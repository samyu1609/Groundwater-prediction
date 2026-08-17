import axios from "axios";

const backend = axios.create({
    baseURL: "http://127.0.0.1:8000",
    timeout: 8000
});

export async function checkServerHealth() {
    try {
        const response = await backend.get("/", { timeout: 3000 });
        return response.status === 200;
    } catch {
        return false;
    }
}

export async function requestPrediction(payload) {
    const response = await backend.post("/predict", payload);
    return response.data;
}

export async function requestForecast(payload) {
    const response = await backend.post("/forecast", payload);
    return response.data;
}

export function getMockPredictionData(latitude = 13.0827, longitude = 80.2707) {
    const today = new Date().toISOString().slice(0, 10);
    return {
        groundwater_level: 6.85,
        confidence: 94.8,
        risk: "Moderate",
        risk_color: "#f59e0b",
        is_demo: true,
        recommendations: [
            "Use efficient irrigation techniques.",
            "Monitor groundwater extraction rates regularly.",
            "Implement rainwater harvesting systems to improve local recharge.",
            "Reduce water wastage during low rainfall periods."
        ],
        location: {
            latitude: latitude || 13.0827,
            longitude: longitude || 80.2707,
            state: "Tamil Nadu",
            district: "Coimbatore",
            village: "Station 04",
            display_name: `Location (${(latitude || 13.0827).toFixed(4)}°, ${(longitude || 80.2707).toFixed(4)}°) [Demo Mode]`
        },
        weather: {
            temperature: 29.5,
            humidity: 68.0,
            rainfall: 3.4,
            condition: "Clear",
            wind_speed_kmh: 12.0
        },
        history: Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return {
                month: d.toLocaleString("default", { month: "short" }) + " " + d.getFullYear(),
                groundwater: +(6.2 + Math.sin(i) * 0.8).toFixed(2),
                rainfall: +(15 + Math.random() * 45).toFixed(1)
            };
        }),
        last_updated: today
    };
}

export function getMockForecastData() {
    const today = new Date();
    const weatherConditions = ["Clear", "Clear", "Rainy", "Humid", "Clear", "Rainy", "Clear"];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const weather_forecast = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const day_str = d.toISOString().slice(0, 10);
        const day_label = i === 0 ? "Today" : dayNames[d.getDay()];
        return {
            date: day_str,
            day_label: day_label,
            temperature_c: +(28 + Math.sin(i) * 3).toFixed(1),
            humidity_pct: Math.floor(65 + Math.cos(i) * 10),
            rainfall_mm: i % 3 === 0 ? +(2.5 + i * 0.8).toFixed(1) : 0,
            condition: weatherConditions[i % weatherConditions.length],
            wind_speed_kmh: 12.0
        };
    });

    let prevLevel = 6.85;
    const groundwater_trend = weather_forecast.map((wf, i) => {
        const level = +(6.85 - i * 0.05 + (wf.rainfall_mm > 0 ? -0.08 : 0.02)).toFixed(2);
        const change = i === 0 ? 0.0 : +(level - prevLevel).toFixed(2);
        prevLevel = level;
        return {
            date: wf.date,
            day_label: wf.day_label,
            groundwater_level: level,
            daily_change: change,
            risk: "Moderate",
            confidence: 94.5,
            rainfall_mm: wf.rainfall_mm
        };
    });

    return {
        weather_forecast,
        groundwater_trend,
        has_rainfall: true,
        rainfall_recommendation: "Demo Mode Active: Weather patterns indicate moderate groundwater replenishment potential.",
        is_demo: true
    };
}
