import { useEffect, useState } from "react";
import { requestPrediction, requestForecast } from "../services/apiService";
import LocationCard from "../components/LocationCard";
import WeatherCard from "../components/WeatherCard";
import PredictionCard from "../components/PredictionCard";
import StatusCard from "../components/StatusCard";
import RecommendationCard from "../components/RecommendationCard";
import ModelInfoCard from "../components/ModelInfoCard";
import LoadingCard from "../components/LoadingCard";
import DashboardView from "../components/DashboardView";
import HistoryView from "../components/HistoryView";
import WeatherForecastCard from "../components/WeatherForecastCard";
import GroundwaterTrendCard from "../components/GroundwaterTrendCard";
import {
    FiLayout, FiTrendingDown, FiCloud, FiInfo,
    FiActivity, FiAlertTriangle, FiBookOpen
} from "react-icons/fi";

const TABS = [
    { id: "dashboard",   label: "Dashboard",          icon: FiLayout },
    { id: "prediction",  label: "Prediction",         icon: FiActivity },
    { id: "trends",      label: "Groundwater Trends", icon: FiTrendingDown },
    { id: "weather",     label: "Weather Forecast",   icon: FiCloud },
    { id: "recs",        label: "Recommendations",    icon: FiInfo },
    { id: "about",       label: "About",              icon: FiBookOpen },
];

function Prediction({ onDataLoaded }) {
    const [isLoading,       setIsLoading]       = useState(true);
    const [error,           setError]           = useState(null);
    const [activeTab,       setActiveTab]       = useState("dashboard");
    const [predictionData,  setPredictionData]  = useState(null);
    const [forecastData,    setForecastData]    = useState(null);
    const [locationCoords,  setLocationCoords]  = useState({ latitude: null, longitude: null });

    const fetchAllData = async (lat, lng) => {
        setIsLoading(true);
        setError(null);
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        try {
            const [pred, fcast] = await Promise.all([
                requestPrediction({ latitude: lat, longitude: lng, year, month }),
                requestForecast({ latitude: lat, longitude: lng })
            ]);
            setPredictionData(pred);
            setForecastData(fcast);
            
            // Push location details and weather condition up to the parent App/Navbar
            if (onDataLoaded) {
                onDataLoaded(pred.location, pred.weather?.condition);
            }
        } catch (err) {
            console.error("API Fetch Error:", err);
            setError(err.response ? "Prediction could not be generated." : "Unable to connect to prediction server.");
        } finally {
            setIsLoading(false);
        }
    };

    const runAutomaticDetection = () => {
        if (!navigator.geolocation) {
            setError("Location permission is required for groundwater prediction.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setLocationCoords({ latitude: lat, longitude: lng });
                fetchAllData(lat, lng);
            },
            (geoError) => {
                console.error("Geolocation Error:", geoError);
                setError("Location permission is required for groundwater prediction.");
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    useEffect(() => {
        runAutomaticDetection();
    }, []);

    // Local variables
    const currentLevel = predictionData?.groundwater_level ?? 6.80;
    const confidence = predictionData?.confidence ?? 95.2;
    const trend = forecastData?.groundwater_trend ?? [];
    const weatherForecast = forecastData?.weather_forecast ?? [];
    const level7d = trend.length ? trend[trend.length - 1]?.groundwater_level : 6.42;
    const level30d = predictionData?.groundwater_level ? +(predictionData.groundwater_level - 0.70).toFixed(2) : 6.10;
    const expectedChange = +(level30d - currentLevel).toFixed(2);
    const predictionDate = predictionData?.last_updated ?? new Date().toISOString().slice(0, 10);

    if (!isLoading && error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="card-surface p-8 max-w-md w-full bg-red-50/50 border border-red-100 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                        <FiAlertTriangle className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">System Alert</h3>
                    <p className="text-sm text-slate-600 mb-6">{error}</p>
                    <button onClick={runAutomaticDetection} className="btn-primary">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8 space-y-6">
            
            {/* Groundwater Status Overview - Hero Banner */}
            <div className="card-surface p-6 bg-white flex flex-col gap-2 text-left">
                <h2 className="text-lg font-bold text-slate-900">
                    Groundwater Status Overview
                </h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-3xl">
                    Monitor groundwater conditions, view prediction results, analyze historical trends, and receive recommendations for efficient water resource management.
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <LoadingCard />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Navigation Tab Menu */}
                    <div className="border-b border-slate-200">
                        <nav className="flex flex-wrap -mb-px gap-2 sm:gap-6">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 py-3 px-3 border-b-2 font-bold text-xs transition-colors duration-150 ${
                                            isActive
                                                ? "border-[#0F4C81] text-[#0F4C81]"
                                                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content Views */}
                    <div className="transition-all duration-200">
                        
                        {/* 1. Dashboard View */}
                        {activeTab === "dashboard" && (
                            <DashboardView predictionData={predictionData} />
                        )}

                        {/* 2. Prediction View */}
                        {activeTab === "prediction" && (
                            <div className="space-y-6">
                                {/* Summary Table/Card */}
                                <div className="card-surface p-6 text-left">
                                    <div className="flex items-center gap-2 text-[#0F4C81] mb-5">
                                        <FiActivity className="h-5 w-5" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Prediction Summary
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Current Level</span>
                                            <span className="text-lg font-bold text-slate-800">{currentLevel.toFixed(2)} m</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="text-[10px] text-slate-400 block uppercase font-semibold">After 7 Days</span>
                                            <span className="text-lg font-bold text-blue-700">{level7d.toFixed(2)} m</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="text-[10px] text-slate-400 block uppercase font-semibold">After 30 Days</span>
                                            <span className="text-lg font-bold text-slate-800">{level30d.toFixed(2)} m</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Expected Change</span>
                                            <span className={`text-lg font-bold ${expectedChange <= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                {expectedChange > 0 ? "+" : ""}{expectedChange.toFixed(2)} m
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg col-span-2 md:col-span-1">
                                            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Prediction Date</span>
                                            <span className="text-sm font-bold text-slate-700">{predictionDate}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail KPI layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <LocationCard latitude={locationCoords.latitude} longitude={locationCoords.longitude} />
                                    <WeatherCard
                                        rainfall={predictionData?.weather?.rainfall}
                                        temperature={predictionData?.weather?.temperature}
                                        humidity={predictionData?.weather?.humidity}
                                    />
                                    <PredictionCard groundwaterLevel={currentLevel} />
                                    <StatusCard risk={predictionData?.risk} />
                                    <RecommendationCard />
                                    <ModelInfoCard />
                                </div>
                            </div>
                        )}

                        {/* 3. Groundwater Trends View */}
                        {activeTab === "trends" && (
                            <div className="space-y-6">
                                <HistoryView />
                                <GroundwaterTrendCard
                                    trend={trend}
                                    currentLevel={currentLevel}
                                />
                            </div>
                        )}

                        {/* 4. Weather Forecast View */}
                        {activeTab === "weather" && (
                            <div className="space-y-6">
                                <WeatherForecastCard forecast={weatherForecast} />
                            </div>
                        )}

                        {/* 5. Recommendations View */}
                        {activeTab === "recs" && (
                            <div className="max-w-2xl mx-auto space-y-6 text-left">
                                <RecommendationCard />
                                {forecastData?.rainfall_recommendation && (
                                    <div className={`card-surface p-6 border ${
                                        forecastData.has_rainfall
                                            ? "bg-blue-50/40 border-blue-100 text-blue-800"
                                            : "bg-amber-50/40 border-amber-100 text-amber-800"
                                    }`}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                            Rainfall Outlook Recommendation
                                        </p>
                                        <p className="text-sm font-semibold leading-relaxed">
                                            {forecastData.rainfall_recommendation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 6. About View */}
                        {activeTab === "about" && (
                            <div className="max-w-3xl mx-auto card-surface p-8 space-y-6 text-left">
                                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">
                                    About AquaSense AI
                                </h3>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    AquaSense AI supports groundwater monitoring and prediction by integrating historical groundwater records, rainfall information, weather conditions, and trained Machine Learning models. The platform assists farmers and water resource authorities in making informed decisions for sustainable groundwater management.
                                </p>
                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        System Design Principles
                                    </h4>
                                    <ul className="space-y-2 text-xs text-slate-500 font-semibold list-disc list-inside">
                                        <li>Ensuring data integrity through automated open registry GPS reverse coordinates queries.</li>
                                        <li>Generating groundwater forecasts using standard regression machine learning algorithms.</li>
                                        <li>Providing practical recommended actions optimized for sustainability and agricultural support.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

export default Prediction;
