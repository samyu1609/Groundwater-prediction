import axios from "axios";

const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeatherForLocation(latitude, longitude) {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    const response = await axios.get(WEATHER_API_URL, {
        params: {
            latitude,
            longitude,
            hourly: "temperature_2m,relativehumidity_2m",
            daily: "rain_sum",
            timezone: "auto",
            start_date: formattedDate,
            end_date: formattedDate
        }
    });

    const { hourly, daily } = response.data;
    const hours = hourly.time
        .map((dateString, index) => ({ dateString, index }))
        .filter((item) => item.dateString.startsWith(formattedDate));

    const temperatureValues = hours.map((item) => hourly.temperature_2m[item.index]);
    const humidityValues = hours.map((item) => hourly.relativehumidity_2m[item.index]);

    const average = (values) => {
        if (!values.length) {
            return 0;
        }
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    };

    const rainfallValue = daily?.rain_sum?.[0] ?? 0;
    const temperature = average(temperatureValues);
    const humidity = average(humidityValues);

    return {
        rainfall: Number(rainfallValue.toFixed(1)),
        temperature: Number(temperature.toFixed(1)),
        humidity: Number(humidity.toFixed(0))
    };
}
