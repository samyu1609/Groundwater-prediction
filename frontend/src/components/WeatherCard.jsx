import { FiCloudRain, FiThermometer, FiPercent } from "react-icons/fi";

function WeatherCard({ rainfall, temperature, humidity }) {
    return (
        <div className="card-surface p-6 card-surface-hover">
            <div className="flex items-center gap-2.5 text-blue-600 mb-4">
                <FiCloudRain className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Climate Data
                </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                        Rainfall
                    </span>
                    <div className="flex items-center gap-1">
                        <FiCloudRain className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-lg font-semibold text-slate-800">
                            {rainfall !== null && rainfall !== undefined ? `${rainfall} mm` : "--"}
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                        Temperature
                    </span>
                    <div className="flex items-center gap-1">
                        <FiThermometer className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-lg font-semibold text-slate-800">
                            {temperature !== null && temperature !== undefined ? `${temperature}°C` : "--"}
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                        Humidity
                    </span>
                    <div className="flex items-center gap-1">
                        <FiPercent className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-lg font-semibold text-slate-800">
                            {humidity !== null && humidity !== undefined ? `${humidity}%` : "--"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WeatherCard;
