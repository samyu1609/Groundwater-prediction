from datetime import datetime, timedelta, date as date_cls
from pathlib import Path
import json
import urllib.request
import urllib.parse
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

BASE_DIR = Path(__file__).resolve().parent
MODEL_CANDIDATES = [
    BASE_DIR / "models" / "groundwater_model.pkl",
    BASE_DIR / "models" / "random_forest.pkl",
    BASE_DIR / "models" / "xgboost.pkl",
]

WEATHER_CACHE = {}
WEATHER_CACHE_TTL = timedelta(minutes=15)

FORECAST_CACHE = {}
FORECAST_CACHE_TTL = timedelta(minutes=30)

REVERSE_GEOCODE_CACHE = {}
REVERSE_GEOCODE_CACHE_TTL = timedelta(hours=1)

LOCATION_HISTORY_CACHE = {}
LOCATION_HISTORY_CACHE_TTL = timedelta(hours=1)

MODEL = None
DATA_DF = None


def get_model_path():
    for path in MODEL_CANDIDATES:
        if path.exists():
            return path
    raise FileNotFoundError(
        "No model file found. Expected groundwater_model.pkl, random_forest.pkl, or xgboost.pkl in backend/models."
    )


def load_model():
    global MODEL
    if MODEL is not None:
        return MODEL
    model_path = get_model_path()
    MODEL = joblib.load(model_path)
    return MODEL


def get_feature_names(model):
    if hasattr(model, "feature_names_in_") and model.feature_names_in_ is not None:
        return list(model.feature_names_in_)
    return ["LATITUDE", "LONGITUDE", "YEAR_x", "MONTH", "Rainfall_NASA", "Temperature_NASA", "Humidity_NASA"]


def prepare_feature_dataframe(latitude, longitude, year, month, rainfall_mm, temperature_c, humidity_pct):
    model = load_model()
    data = {
        "LATITUDE": float(latitude),
        "LONGITUDE": float(longitude),
        "YEAR_x": int(year),
        "MONTH": int(month),
        "Rainfall_NASA": float(rainfall_mm),
        "Temperature_NASA": float(temperature_c),
        "Humidity_NASA": float(humidity_pct),
    }
    columns = get_feature_names(model)
    df = pd.DataFrame([data], columns=columns)
    return data, df


def compute_confidence(model, df, prediction):
    try:
        if hasattr(model, "estimators_") and getattr(model, "estimators_"):
            X_arr = df.to_numpy() if isinstance(df, pd.DataFrame) else np.asarray(df)
            tree_preds = np.array([tree.predict(X_arr)[0] for tree in model.estimators_])
            std = float(np.std(tree_preds))
            if std <= 0:
                return 98.5
            ratio = std / (abs(prediction) + 1e-3)
            score = 100.0 - min(80.0, ratio * 30.0)
            return float(max(40.0, min(99.5, score)))
    except Exception:
        pass
    return 75.0


def predict_groundwater(raw_features):
    model = load_model()
    _, df = prepare_feature_dataframe(
        raw_features["LATITUDE"],
        raw_features["LONGITUDE"],
        raw_features["YEAR_x"],
        raw_features["MONTH"],
        raw_features["Rainfall_NASA"],
        raw_features["Temperature_NASA"],
        raw_features["Humidity_NASA"],
    )
    prediction = float(model.predict(df)[0])
    confidence = round(compute_confidence(model, df, prediction), 1)
    return prediction, confidence


def fetch_weather(latitude, longitude, date=None):
    cache_key = f"{round(latitude, 4)}_{round(longitude, 4)}"
    cached = WEATHER_CACHE.get(cache_key)
    now = datetime.utcnow()
    if cached and cached["expires_at"] > now:
        return cached["weather"]

    req_date = date or now.date().isoformat()
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "temperature_2m,relativehumidity_2m,windspeed_10m",
        "daily": "rain_sum",
        "timezone": "auto",
        "start_date": req_date,
        "end_date": req_date,
    }
    url = f"https://api.open-meteo.com/v1/forecast?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(url, headers={"User-Agent": "AquaSenseAI/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            raw = response.read()
    except Exception:
        return {
            "rainfall_mm": 0.0,
            "temperature_c": 0.0,
            "humidity_pct": 0.0,
            "wind_speed_kmh": 12.0,
        }
    payload = json.loads(raw)
    hourly = payload.get("hourly", {})
    daily = payload.get("daily", {})
    times = hourly.get("time", [])
    temp_series = hourly.get("temperature_2m", [])
    humidity_series = hourly.get("relativehumidity_2m", [])
    wind_series = hourly.get("windspeed_10m", [])
    rainfall_value = float(daily.get("rain_sum", [0])[0] or 0)
    if times and temp_series and humidity_series:
        values = [i for i, t in enumerate(times) if t.startswith(req_date)]
        if values:
            temperature = float(np.mean([temp_series[i] for i in values]))
            humidity = float(np.mean([humidity_series[i] for i in values]))
            wind = float(np.mean([wind_series[i] for i in values])) if wind_series else 12.0
        else:
            temperature = float(np.mean(temp_series)) if temp_series else 0.0
            humidity = float(np.mean(humidity_series)) if humidity_series else 0.0
            wind = float(np.mean(wind_series)) if wind_series else 12.0
    else:
        temperature = 0.0
        humidity = 0.0
        wind = 12.0
    weather = {
        "rainfall_mm": round(rainfall_value, 1),
        "temperature_c": round(temperature, 1),
        "humidity_pct": round(humidity, 1),
        "wind_speed_kmh": round(wind, 1),
    }
    WEATHER_CACHE[cache_key] = {"weather": weather, "expires_at": now + WEATHER_CACHE_TTL}
    return weather


def fetch_7day_forecast(latitude, longitude):
    """Fetch 7-day hourly forecast from Open-Meteo and aggregate to daily values."""
    cache_key = f"forecast_{round(latitude, 4)}_{round(longitude, 4)}"
    cached = FORECAST_CACHE.get(cache_key)
    now = datetime.utcnow()
    if cached and cached["expires_at"] > now:
        return cached["forecast"]

    today = date_cls.today()
    end_date = today + timedelta(days=6)

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "temperature_2m,relativehumidity_2m,windspeed_10m",
        "daily": "rain_sum",
        "timezone": "auto",
        "start_date": today.isoformat(),
        "end_date": end_date.isoformat(),
    }
    url = f"https://api.open-meteo.com/v1/forecast?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "AquaSenseAI/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            payload = json.loads(response.read())
    except Exception:
        return []

    hourly = payload.get("hourly", {})
    daily = payload.get("daily", {})
    times = hourly.get("time", [])
    temp_series = hourly.get("temperature_2m", [])
    humidity_series = hourly.get("relativehumidity_2m", [])
    wind_series = hourly.get("windspeed_10m", [])
    daily_dates = daily.get("time", [])
    rain_sums = daily.get("rain_sum", [])

    forecast = []
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    for idx, day_str in enumerate(daily_dates):
        rain = float(rain_sums[idx] or 0) if idx < len(rain_sums) else 0.0
        day_indices = [i for i, t in enumerate(times) if t.startswith(day_str)]
        if day_indices:
            temps = [temp_series[i] for i in day_indices if i < len(temp_series)]
            humids = [humidity_series[i] for i in day_indices if i < len(humidity_series)]
            winds = [wind_series[i] for i in day_indices if i < len(wind_series)]
            temp = float(np.mean(temps)) if temps else 28.0
            humidity = float(np.mean(humids)) if humids else 60.0
            wind = float(np.mean(winds)) if winds else 12.0
        else:
            temp, humidity, wind = 28.0, 60.0, 12.0

        day_date = date_cls.fromisoformat(day_str)
        day_label = "Today" if idx == 0 else day_names[day_date.weekday()]

        forecast.append({
            "date": day_str,
            "day_label": day_label,
            "temperature_c": round(temp, 1),
            "rainfall_mm": round(rain, 1),
            "humidity_pct": round(humidity, 1),
            "wind_speed_kmh": round(wind, 1),
            "condition": get_weather_condition(temp, humidity, rain),
        })

    FORECAST_CACHE[cache_key] = {"forecast": forecast, "expires_at": now + FORECAST_CACHE_TTL}
    return forecast


def predict_7day_groundwater(latitude, longitude, forecast_days):
    """Run the trained ML model on each forecast day's climate data to produce a groundwater trend."""
    if not forecast_days:
        return []

    model = load_model()
    columns = get_feature_names(model)

    rows = []
    for day in forecast_days:
        day_date = date_cls.fromisoformat(day["date"])
        rows.append({
            "LATITUDE": float(latitude),
            "LONGITUDE": float(longitude),
            "YEAR_x": int(day_date.year),
            "MONTH": int(day_date.month),
            "Rainfall_NASA": float(day["rainfall_mm"]),
            "Temperature_NASA": float(day["temperature_c"]),
            "Humidity_NASA": float(day["humidity_pct"]),
        })

    df_batch = pd.DataFrame(rows, columns=columns)
    predictions = model.predict(df_batch)

    confidences = []
    if hasattr(model, "estimators_") and getattr(model, "estimators_"):
        X_arr = df_batch.to_numpy()
        tree_preds = np.array([tree.predict(X_arr) for tree in model.estimators_])
        stds = np.std(tree_preds, axis=0)
        for i, pred in enumerate(predictions):
            std = float(stds[i])
            if std <= 0:
                confidences.append(98.5)
            else:
                ratio = std / (abs(pred) + 1e-3)
                score = 100.0 - min(80.0, ratio * 30.0)
                confidences.append(float(max(40.0, min(99.5, score))))
    else:
        confidences = [75.0] * len(predictions)

    trend = []
    prev_level = None
    for idx, day in enumerate(forecast_days):
        level = round(float(predictions[idx]), 2)
        confidence = round(float(confidences[idx]), 1)
        daily_change = round(level - prev_level, 2) if prev_level is not None else 0.0
        risk_label, _ = classify_risk(level)
        trend.append({
            "date": day["date"],
            "day_label": day["day_label"],
            "groundwater_level": level,
            "daily_change": daily_change,
            "risk": risk_label,
            "confidence": confidence,
        })
        prev_level = level

    return trend


def reverse_geocode(latitude, longitude):
    cache_key = f"{round(latitude, 3)}_{round(longitude, 3)}"
    cached = REVERSE_GEOCODE_CACHE.get(cache_key)
    now = datetime.utcnow()
    if cached and cached["expires_at"] > now:
        return cached["result"]

    params = {
        "format": "jsonv2",
        "lat": latitude,
        "lon": longitude,
        "addressdetails": 1,
        "zoom": 10,
    }
    url = f"https://nominatim.openstreetmap.org/reverse?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(url, headers={"User-Agent": "AquaSenseAI/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=3) as response:
            payload = json.loads(response.read())
    except Exception:
        fallback = {
            "state": "Unknown",
            "district": "Unknown",
            "village": "Unknown",
            "display_name": None,
        }
        return fallback

    address = payload.get("address", {})
    result = {
        "state": address.get("state") or address.get("region") or "Unknown",
        "district": address.get("county") or address.get("district") or "Unknown",
        "village": address.get("village") or address.get("town") or address.get("city") or "Unknown",
        "display_name": address.get("display_name"),
    }
    REVERSE_GEOCODE_CACHE[cache_key] = {"result": result, "expires_at": now + REVERSE_GEOCODE_CACHE_TTL}
    return result


def get_weather_condition(temperature_c, humidity_pct, rainfall_mm):
    if rainfall_mm >= 5:
        return "Rainy"
    if temperature_c >= 34:
        return "Hot"
    if humidity_pct >= 80:
        return "Humid"
    if temperature_c <= 18:
        return "Cool"
    return "Clear"


def classify_risk(groundwater_level):
    if groundwater_level > 10.0:
        return "Critical", "#dc2626"
    if groundwater_level > 5.0:
        return "Moderate", "#f59e0b"
    return "Safe", "#10b981"


def get_recommendations(risk_label):
    if risk_label == "Critical":
        return [
            "Harvest rainwater frequently",
            "Reduce groundwater extraction",
            "Use drip irrigation",
            "Avoid water intensive crops",
        ]
    if risk_label == "Moderate":
        return [
            "Use efficient irrigation",
            "Monitor groundwater regularly",
            "Reduce water wastage",
        ]
    return [
        "Maintain sustainable usage",
        "Continue regular monitoring",
        "Preserve recharge and conservation practices",
    ]


def load_history_data():
    global DATA_DF
    if DATA_DF is not None:
        return DATA_DF
    history_path = BASE_DIR.parent / "data" / "processed" / "final_dataset.csv"
    if history_path.exists():
        df = pd.read_csv(history_path)
        required_columns = ["LATITUDE", "LONGITUDE", "YEAR_x", "MONTH", "WATER_LEVEL_MBGL", "Rainfall_NASA"]
        if set(required_columns).issubset(df.columns):
            df = df.dropna(subset=required_columns).copy()
            df["LATITUDE"] = df["LATITUDE"].astype(float)
            df["LONGITUDE"] = df["LONGITUDE"].astype(float)
            df["YEAR_x"] = df["YEAR_x"].astype(int)
            df["MONTH"] = df["MONTH"].astype(int)
            df["WATER_LEVEL_MBGL"] = df["WATER_LEVEL_MBGL"].astype(float)
            df["Rainfall_NASA"] = df["Rainfall_NASA"].astype(float)
            df["date"] = pd.to_datetime(df["YEAR_x"].astype(str) + "-" + df["MONTH"].astype(str) + "-01", errors="coerce")
            DATA_DF = df
        else:
            DATA_DF = pd.DataFrame()
    else:
        DATA_DF = pd.DataFrame()
    return DATA_DF


def get_location_history(latitude, longitude, months=6):
    cache_key = f"{round(latitude, 3)}_{round(longitude, 3)}_{months}"
    cached = LOCATION_HISTORY_CACHE.get(cache_key)
    now = datetime.utcnow()
    if cached and cached["expires_at"] > now:
        return cached["result"]

    df = load_history_data()
    if df.empty:
        return []

    coords = df[["LATITUDE", "LONGITUDE"]].drop_duplicates().copy()
    coords["dist2"] = (coords["LATITUDE"] - latitude) ** 2 + (coords["LONGITUDE"] - longitude) ** 2
    nearest = coords.sort_values("dist2").iloc[0]

    nearest_df = df[(df["LATITUDE"] == nearest["LATITUDE"]) & (df["LONGITUDE"] == nearest["LONGITUDE"])].copy()
    grouped = nearest_df.groupby("date").agg(
        groundwater=("WATER_LEVEL_MBGL", "mean"),
        rainfall=("Rainfall_NASA", "mean"),
    ).reset_index()
    grouped = grouped.dropna(subset=["date"]).sort_values("date").tail(months)
    history = []
    for row in grouped.itertuples(index=False):
        history.append({
            "month": row.date.strftime("%b %Y"),
            "groundwater": round(float(row.groundwater), 2),
            "rainfall": round(float(row.rainfall), 2),
        })

    LOCATION_HISTORY_CACHE[cache_key] = {"result": history, "expires_at": now + LOCATION_HISTORY_CACHE_TTL}
    return history


def train_model(csv_path=None, save_path=None):
    csv_path = Path(csv_path) if csv_path else BASE_DIR.parent / "data" / "processed" / "final_dataset.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"Training dataset not found at {csv_path}")
    training_df = pd.read_csv(csv_path)
    required_columns = ["LATITUDE", "LONGITUDE", "YEAR_x", "MONTH", "Rainfall_NASA", "Temperature_NASA", "Humidity_NASA", "WATER_LEVEL_MBGL"]
    if not set(required_columns).issubset(training_df.columns):
        raise ValueError(f"Training dataset must contain columns: {required_columns}")
    X = training_df[["LATITUDE", "LONGITUDE", "YEAR_x", "MONTH", "Rainfall_NASA", "Temperature_NASA", "Humidity_NASA"]]
    y = training_df["WATER_LEVEL_MBGL"]
    model = RandomForestRegressor(n_estimators=150, random_state=42, n_jobs=-1)
    model.fit(X, y)
    save_path = Path(save_path) if save_path else get_model_path()
    joblib.dump(model, save_path)
    global MODEL
    MODEL = model
    return {
        "trained_rows": len(X),
        "feature_count": X.shape[1],
        "model_path": str(save_path),
    }
