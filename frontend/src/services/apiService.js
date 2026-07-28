import axios from "axios";

const backend = axios.create({
    baseURL: "http://127.0.0.1:8000",
    timeout: 10000
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
        risk: "Moderate Risk",
        risk_color: "yellow",
        is_demo: true,
        recommendations: [
            "Monitor groundwater extraction rates regularly.",
            "Implement rainwater harvesting systems to improve local recharge.",
            "Adopt micro-irrigation systems (drip/sprinkler) for agricultural plots.",
            "Schedule well maintenance checks before seasonal rainfall."
        ],
        location: {
            latitude: latitude || 13.0827,
            longitude: longitude || 80.2707,
            state: "Demo Region",
            district: "Monitoring District",
            village: "Station 04",
            display_name: `Location (${(latitude || 13.0827).toFixed(4)}°, ${(longitude || 80.2707).toFixed(4)}°) [Demo Mode]`
        },
        weather: {
            temperature: 29.5,
            humidity: 68.0,
            rainfall: 3.4,
            condition: "Partly Cloudy"
        },
        history: Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return {
                month: d.toLocaleString("default", { month: "short" }),
                year: d.getFullYear(),
                groundwater_level: +(6.2 + Math.sin(i) * 0.8).toFixed(2),
                rainfall: +(15 + Math.random() * 45).toFixed(1)
            };
        }),
        last_updated: today
    };
}

export function getMockForecastData() {
    const today = new Date();
    const weatherConditions = ["Sunny", "Partly Cloudy", "Light Rain", "Cloudy", "Sunny", "Moderate Rain", "Clear"];
    
    const weather_forecast = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i + 1);
        return {
            date: d.toISOString().slice(0, 10),
            day_name: d.toLocaleString("default", { weekday: "short" }),
            temperature_c: +(28 + Math.sin(i) * 3).toFixed(1),
            humidity_pct: Math.floor(65 + Math.cos(i) * 10),
            rainfall_mm: i % 3 === 0 ? +(2.5 + i * 0.8).toFixed(1) : 0,
            condition: weatherConditions[i % weatherConditions.length]
        };
    });

    const groundwater_trend = weather_forecast.map((wf, i) => ({
        date: wf.date,
        day: wf.day_name,
        groundwater_level: +(6.85 - i * 0.05 + (wf.rainfall_mm > 0 ? 0.08 : -0.02)).toFixed(2),
        rainfall_mm: wf.rainfall_mm
    }));

    return {
        weather_forecast,
        groundwater_trend,
        recommendation: "Demo Mode Active: Weather patterns indicate moderate groundwater replenishment potential.",
        is_demo: true
    };
}

