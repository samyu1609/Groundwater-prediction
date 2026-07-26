import axios from "axios";

const backend = axios.create({
    baseURL: "http://127.0.0.1:8000",
    timeout: 30000
});

export async function requestPrediction(payload) {
    const response = await backend.post("/predict", payload);
    return response.data;
}

export async function requestForecast(payload) {
    const response = await backend.post("/forecast", payload);
    return response.data;
}
