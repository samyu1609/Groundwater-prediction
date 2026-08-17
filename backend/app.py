from datetime import date
from pathlib import Path
from typing import Optional
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

try:
    from backend.predict import (
        fetch_weather,
        predict_groundwater,
        reverse_geocode,
        classify_risk,
        get_recommendations,
        get_weather_condition,
        get_location_history,
        train_model,
        get_model_path,
        fetch_7day_forecast,
        predict_7day_groundwater,
    )
except ModuleNotFoundError:
    from predict import (
        fetch_weather,
        predict_groundwater,
        reverse_geocode,
        classify_risk,
        get_recommendations,
        get_weather_condition,
        get_location_history,
        train_model,
        get_model_path,
        fetch_7day_forecast,
        predict_7day_groundwater,
    )

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

executor = ThreadPoolExecutor(max_workers=4)

app = FastAPI(title="AquaSense AI", version="1.0")
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    latitude: float
    longitude: float
    year: Optional[int] = None
    month: Optional[int] = None
    date: Optional[date] = None


class UploadResponse(BaseModel):
    filename: str
    path: str
    message: str


@app.get("/")
def home():
    return {"message": "Welcome to AquaSense AI"}


@app.post("/predict")
def predict(request: PredictionRequest):
    try:
        year = request.year or date.today().year
        month = request.month or date.today().month
        req_date = request.date.isoformat() if request.date else None

        f_weather = executor.submit(fetch_weather, request.latitude, request.longitude, req_date)
        f_geocode = executor.submit(reverse_geocode, request.latitude, request.longitude)
        f_history = executor.submit(get_location_history, request.latitude, request.longitude, 6)

        weather = f_weather.result()
        location_info = f_geocode.result()
        history = f_history.result()

        raw_features = {
            "LATITUDE": request.latitude,
            "LONGITUDE": request.longitude,
            "YEAR_x": year,
            "MONTH": month,
            "Rainfall_NASA": weather["rainfall_mm"],
            "Temperature_NASA": weather["temperature_c"],
            "Humidity_NASA": weather["humidity_pct"],
        }
        groundwater_value, confidence = predict_groundwater(raw_features)
        risk_label, risk_color = classify_risk(groundwater_value)
        recommendations = get_recommendations(risk_label)
        weather_condition = get_weather_condition(weather["temperature_c"], weather["humidity_pct"], weather["rainfall_mm"])

        return {
            "groundwater_level": round(groundwater_value, 2),
            "confidence": confidence,
            "risk": risk_label,
            "risk_color": risk_color,
            "recommendations": recommendations,
            "location": {
                "latitude": request.latitude,
                "longitude": request.longitude,
                "state": location_info["state"],
                "district": location_info["district"],
                "village": location_info["village"],
                "display_name": location_info["display_name"],
            },
            "weather": {
                "temperature": weather["temperature_c"],
                "humidity": weather["humidity_pct"],
                "rainfall": weather["rainfall_mm"],
                "condition": weather_condition,
            },
            "history": history,
            "last_updated": date.today().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/forecast")
def forecast(request: PredictionRequest):
    try:
        weather_forecast = fetch_7day_forecast(request.latitude, request.longitude)
        if not weather_forecast:
            raise HTTPException(status_code=503, detail="Unable to fetch 7-day weather forecast.")
        groundwater_trend = predict_7day_groundwater(request.latitude, request.longitude, weather_forecast)
        total_rain = sum(d["rainfall_mm"] for d in weather_forecast)
        has_rainfall = total_rain > 2.0
        if has_rainfall:
            rainfall_recommendation = (
                "Rainfall is expected over the coming days. Groundwater recharge may improve. "
                "Continue monitoring groundwater extraction."
            )
        else:
            rainfall_recommendation = (
                "Low rainfall is expected over the coming days. "
                "Reduce groundwater pumping and adopt efficient irrigation methods."
            )
        return {
            "weather_forecast": weather_forecast,
            "groundwater_trend": groundwater_trend,
            "has_rainfall": has_rainfall,
            "rainfall_recommendation": rainfall_recommendation,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/admin/upload-groundwater", response_model=UploadResponse)
def upload_groundwater(file: UploadFile = File(...)):
    target = UPLOAD_DIR / f"groundwater_{file.filename}"
    with target.open("wb") as buffer:
        buffer.write(file.file.read())
    return {"filename": file.filename, "path": str(target), "message": "Groundwater dataset uploaded successfully."}


@app.post("/admin/upload-rainfall", response_model=UploadResponse)
def upload_rainfall(file: UploadFile = File(...)):
    target = UPLOAD_DIR / f"rainfall_{file.filename}"
    with target.open("wb") as buffer:
        buffer.write(file.file.read())
    return {"filename": file.filename, "path": str(target), "message": "Rainfall dataset uploaded successfully."}


@app.post("/admin/retrain")
def admin_retrain():
    trained = train_model()
    return {"message": "Model retrained successfully.", "trained_rows": trained["trained_rows"], "feature_count": trained["feature_count"], "model_path": trained["model_path"]}


@app.get("/admin/download-model")
def download_model():
    path = get_model_path()
    return FileResponse(path, filename=path.name)
