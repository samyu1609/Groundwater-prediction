import { FiCloudRain, FiSun, FiCloud, FiWind, FiThermometer, FiDroplet } from "react-icons/fi";

const CONDITION_ICON = {
    Rainy:  <FiCloudRain className="h-7 w-7 text-blue-500" />,
    Hot:    <FiSun className="h-7 w-7 text-amber-500" />,
    Humid:  <FiCloud className="h-7 w-7 text-slate-400" />,
    Cool:   <FiWind className="h-7 w-7 text-cyan-500" />,
    Clear:  <FiSun className="h-7 w-7 text-yellow-400" />,
};

const CONDITION_EMOJI = {
    Rainy: "🌧",
    Hot:   "☀️",
    Humid: "☁️",
    Cool:  "🌬️",
    Clear: "☀️",
};

function WeatherForecastCard({ forecast = [] }) {
    if (!forecast.length) return null;

    return (
        <div className="card-surface p-6">
            {/* Header */}
            <div className="flex items-center gap-2.5 text-blue-600 mb-5">
                <FiCloudRain className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    7-Day Weather Forecast
                </h3>
            </div>

            {/* Horizontal scroll strip */}
            <div className="overflow-x-auto -mx-1 px-1 pb-2">
                <div className="flex gap-3 min-w-max">
                    {forecast.map((day, idx) => (
                        <div
                            key={day.date}
                            className={`flex flex-col items-center rounded-2xl border p-4 min-w-[110px] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                                idx === 0
                                    ? "bg-blue-50/60 border-blue-100"
                                    : "bg-slate-50/60 border-slate-100"
                            }`}
                        >
                            {/* Day */}
                            <span className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                                idx === 0 ? "text-blue-600" : "text-slate-500"
                            }`}>
                                {day.day_label}
                            </span>

                            {/* Condition icon */}
                            <span className="text-3xl mb-3" role="img" aria-label={day.condition}>
                                {CONDITION_EMOJI[day.condition] ?? "🌤️"}
                            </span>

                            {/* Condition label */}
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                {day.condition}
                            </span>

                            {/* Stats */}
                            <div className="w-full space-y-1.5 text-center">
                                <div className="flex items-center justify-between gap-1 text-xs font-semibold text-slate-700">
                                    <span className="text-slate-400">Temp</span>
                                    <span>{day.temperature_c}°C</span>
                                </div>
                                <div className="flex items-center justify-between gap-1 text-xs font-semibold text-slate-700">
                                    <span className="text-slate-400">Rain</span>
                                    <span>{day.rainfall_mm} mm</span>
                                </div>
                                <div className="flex items-center justify-between gap-1 text-xs font-semibold text-slate-700">
                                    <span className="text-slate-400">Hum</span>
                                    <span>{day.humidity_pct}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WeatherForecastCard;
