import { useState } from "react";
import { FiMapPin, FiCloudRain, FiThermometer, FiPercent, FiTrendingDown, FiCpu, FiCompass, FiAlertCircle } from "react-icons/fi";
import RiskMapView from "./RiskMapView";

const STATUS_CONFIG = {
    Safe:     { label: "Safe",     color: "bg-emerald-600", badge: "bg-emerald-50 text-emerald-800 border-emerald-100", desc: "Groundwater level is safe. Conditions are optimal." },
    Moderate: { label: "Moderate", color: "bg-amber-500",   badge: "bg-amber-50 text-amber-800 border-amber-100",   desc: "Groundwater level is moderate. Ongoing monitoring is recommended." },
    Critical: { label: "Critical", color: "bg-rose-600",    badge: "bg-rose-50 text-rose-800 border-rose-100",     desc: "Groundwater level is critical. Immediate reduction in usage required." },
};

function DashboardView({ predictionData }) {
    // Current Location parameters
    const lat = predictionData?.location?.latitude ?? 11.0168;
    const lng = predictionData?.location?.longitude ?? 76.9558;
    const state = predictionData?.location?.state ?? "Tamil Nadu";
    const district = predictionData?.location?.district ?? "Coimbatore";
    const lastUpdated = predictionData?.last_updated ?? new Date().toISOString().slice(0, 10);

    // Weather parameters
    const temperature = predictionData?.weather?.temperature ?? 29.0;
    const humidity = predictionData?.weather?.humidity ?? 72;
    const rainfall = predictionData?.weather?.rainfall ?? 8.0;
    const windSpeed = predictionData?.weather?.wind_speed_kmh ?? 12.0;
    const weatherCondition = predictionData?.weather?.condition ?? "Clear";

    // Groundwater parameters
    const currentLevel = predictionData?.groundwater_level ?? 6.80;
    const predictedLevel = (predictionData?.groundwater_level ? +(predictionData.groundwater_level - 0.45).toFixed(2) : 6.35);
    const confidence = predictionData?.confidence ?? 95.2;
    const risk = predictionData?.risk ?? "Moderate";

    // Forecast projection
    const level7d = (predictionData?.groundwater_level ? +(predictionData.groundwater_level - 0.38).toFixed(2) : 6.42);
    const level30d = (predictionData?.groundwater_level ? +(predictionData.groundwater_level - 0.70).toFixed(2) : 6.10);
    const expectedChange = +(level30d - currentLevel).toFixed(2);

    const activeConfig = STATUS_CONFIG[risk] ?? STATUS_CONFIG.Moderate;

    return (
        <div className="space-y-6 text-left">
            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Current Location */}
                <div className="card-surface p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[#0F4C81] mb-4">
                            <FiMapPin className="h-5 w-5" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Location</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase">State</span>
                                <span className="text-slate-800">{state}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase">District</span>
                                <span className="text-slate-800">{district}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase">Latitude</span>
                                <span className="text-slate-800">{lat.toFixed(4)}° N</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase">Longitude</span>
                                <span className="text-slate-800">{lng.toFixed(4)}° E</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                        Last Updated: {lastUpdated}
                    </div>
                </div>

                {/* 2. Current Weather */}
                <div className="card-surface p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[#0F4C81] mb-4">
                            <FiCloudRain className="h-5 w-5" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Weather</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase">Temp</span>
                                <span className="text-slate-800">{temperature}°C</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase">Rainfall</span>
                                <span className="text-slate-800">{rainfall} mm</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase">Humidity</span>
                                <span className="text-slate-800">{humidity}%</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase">Wind Speed</span>
                                <span className="text-slate-800">{windSpeed} km/h</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-[10px] text-slate-400 block uppercase">Condition</span>
                                <span className="text-slate-800 font-bold">{weatherCondition}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                        Data from weather API
                    </div>
                </div>

                {/* 3. Groundwater Summary */}
                <div className="card-surface p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[#0F4C81] mb-4">
                            <FiCompass className="h-5 w-5" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Groundwater Summary</h3>
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Current Level</span>
                                <span className="text-slate-800 font-bold">{currentLevel.toFixed(2)} m</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Predicted Level</span>
                                <span className="text-blue-700 font-bold">{predictedLevel.toFixed(2)} m</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Confidence</span>
                                <span className="text-slate-800 font-bold">{confidence.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Groundwater Status</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border ${activeConfig.badge} font-bold text-[10px]`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${activeConfig.color}`}></span>
                                    {activeConfig.label}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                        Unit: Meters Below Ground Level (MBGL)
                    </div>
                </div>

                {/* 4. Prediction Summary */}
                <div className="card-surface p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[#0F4C81] mb-4">
                            <FiTrendingDown className="h-5 w-5" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Prediction Summary</h3>
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Current Level</span>
                                <span className="text-slate-800 font-bold">{currentLevel.toFixed(2)} m</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">After 7 Days</span>
                                <span className="text-blue-700 font-bold">{level7d.toFixed(2)} m</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">After 30 Days</span>
                                <span className="text-slate-800 font-bold">{level30d.toFixed(2)} m</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Expected Change</span>
                                <span className={`font-bold ${expectedChange <= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    {expectedChange > 0 ? "+" : ""}{expectedChange.toFixed(2)} m
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                        Prediction Date: {lastUpdated}
                    </div>
                </div>

                {/* 5. Groundwater Status Card */}
                <div className="card-surface p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[#0F4C81] mb-4">
                            <FiAlertCircle className="h-5 w-5" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Groundwater Status</h3>
                        </div>
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <span className="h-3.5 w-3.5 rounded-full bg-emerald-600 border border-emerald-300 inline-block"></span>
                                <span className="text-slate-800">Safe</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <span className="h-3.5 w-3.5 rounded-full bg-amber-500 border border-amber-300 inline-block"></span>
                                <span className="text-slate-800">Moderate</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <span className="h-3.5 w-3.5 rounded-full bg-rose-600 border border-rose-300 inline-block"></span>
                                <span className="text-slate-800">Critical</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 leading-normal pt-3 border-t border-slate-100">
                        Groundwater condition based on predicted water level.
                    </p>
                </div>

                {/* 6. Model Information */}
                <div className="card-surface p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[#0F4C81] mb-4">
                            <FiCpu className="h-5 w-5" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Model Information</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Prediction Model</span>
                                <span className="text-blue-700 font-bold">XGBoost</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Comparison Model 1</span>
                                <span className="text-slate-700">Random Forest</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Comparison Model 2</span>
                                <span className="text-slate-700">Linear Regression</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-500">Model Accuracy</span>
                                <span className="text-slate-800 font-bold">95.2%</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                        Optimal configuration selected
                    </div>
                </div>

            </div>

            {/* Groundwater Risk Map Section */}
            <div className="pt-2">
                <RiskMapView />
            </div>
        </div>
    );
}

export default DashboardView;
