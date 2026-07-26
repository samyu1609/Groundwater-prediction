import { useState } from "react";
import axios from "axios";

function PredictionForm() {
    const [form, setForm] = useState({
        latitude: "",
        longitude: "",
        year: "",
        month: "",
        rainfall: "",
        temperature: "",
        humidity: ""
    });

    const [prediction, setPrediction] = useState(null);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await axios.post(
            "http://127.0.0.1:8000/predict",
            form
        );

        setPrediction(res.data.prediction);
    };

    return (
        <div>

            <h2>Groundwater Prediction</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="number"
                    name="latitude"
                    placeholder="Latitude"
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="longitude"
                    placeholder="Longitude"
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="year"
                    placeholder="Year"
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="month"
                    placeholder="Month"
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="rainfall"
                    placeholder="Rainfall"
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="temperature"
                    placeholder="Temperature"
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="humidity"
                    placeholder="Humidity"
                    onChange={handleChange}
                />

                <button type="submit">
                    Predict
                </button>

            </form>

            {prediction && (
                <h3>
                    Predicted Groundwater Level:
                    {prediction.toFixed(2)} mbgl
                </h3>
            )}

        </div>
    );
}

export default PredictionForm;