import { useEffect, useState } from "react";
import { requestPrediction, requestForecast, getMockPredictionData, getMockForecastData } from "../services/apiService";
import LocationCard from "../components/LocationCard";
import WeatherCard from "../components/WeatherCard";
import PredictionCard from "../components/PredictionCard";
import StatusCard from "../components/StatusCard";
import RecommendationCard from "../components/RecommendationCard";
import ModelInfoCard from "../components/ModelInfoCard";
import DashboardView from "../components/DashboardView";
import HistoryView from "../components/HistoryView";
import WeatherForecastCard from "../components/WeatherForecastCard";
import GroundwaterTrendCard from "../components/GroundwaterTrendCard";
import SystemAlertCard from "../components/SystemAlertCard";
import MlPredictorForm from "../components/MlPredictorForm";
import {
    FiLayout, FiTrendingDown, FiCloud, FiInfo,
    FiActivity, FiAlertTriangle, FiBookOpen, FiRefreshCw
} from "react-icons/fi";

const TABS = [
    { id: "prediction",  label: "AI Predictor",       icon: FiActivity },
    { id: "dashboard",   label: "Dashboard",          icon: FiLayout },
    { id: "trends",      label: "Groundwater Trends", icon: FiTrendingDown },
    { id: "weather",     label: "Weather Forecast",   icon: FiCloud },
    { id: "recs",        label: "Recommendations",    icon: FiInfo },
    { id: "about",       label: "About",              icon: FiBookOpen },
];

function Prediction({ onDataLoaded }) {
    // Instant initialization with telemetry defaults so page NEVER freezes or goes blank
    const defaultLat = 13.0827;
    const defaultLng = 80.2707;
    const initialPred = getMockPredictionData(defaultLat, defaultLng);
    const initialFcast = getMockForecastData();

    const [isLoading,       setIsLoading]       = useState(false);
    const [isRefreshing,    setIsRefreshing]    = useState(false);
    const [error,           setError]           = useState(null);
    const [activeTab,       setActiveTab]       = useState("prediction");
    const [predictionData,  setPredictionData]  = useState(initialPred);
    const [forecastData,    setForecastData]    = useState(initialFcast);
    const [locationCoords,  setLocationCoords]  = useState({ latitude: defaultLat, longitude: defaultLng });

    const fetchAllData = async (lat, lng) => {
        setIsRefreshing(true);
        setError(null);
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        try {
            const [pred, fcast] = await Promise.all([
                requestPrediction({ latitude: lat, longitude: lng, year, month }),
                requestForecast({ latitude: lat, longitude: lng })
            ]);
            setPredictionData({ ...pred, is_demo: false });
            setForecastData(fcast);
            if (onDataLoaded) {
                onDataLoaded(pred.location, pred.weather?.condition);
            }
        } catch (err) {
            console.warn("API Fetch Note: Operating in offline mode.", err);
            const mockPred = getMockPredictionData(lat, lng);
            const mockFcast = getMockForecastData();
            setPredictionData(mockPred);
            setForecastData(mockFcast);
            if (onDataLoaded) {
                onDataLoaded(mockPred.location, mockPred.weather?.condition);
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        // Notify parent Navbar of initial location on mount
        if (onDataLoaded && initialPred) {
            onDataLoaded(initialPred.location, initialPred.weather?.condition);
        }

        // Background geolocation detection
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setLocationCoords({ latitude: lat, longitude: lng });
                    fetchAllData(lat, lng);
                },
                () => {
                    fetchAllData(defaultLat, defaultLng);
                },
                { enableHighAccuracy: false, timeout: 4000 }
            );
        } else {
            fetchAllData(defaultLat, defaultLng);
        }
    }, []);

    // Local variables with type safety guards
    const currentLevel = typeof predictionData?.groundwater_level === "number" && !isNaN(predictionData.groundwater_level)
        ? predictionData.groundwater_level
        : 6.80;
    const confidence = typeof predictionData?.confidence === "number" && !isNaN(predictionData.confidence)
        ? predictionData.confidence
        : 95.2;
    const trend = Array.isArray(forecastData?.groundwater_trend) ? forecastData.groundwater_trend : [];
    const weatherForecast = Array.isArray(forecastData?.weather_forecast) ? forecastData.weather_forecast : [];
    
    const raw7d = trend.length && typeof trend[trend.length - 1]?.groundwater_level === "number"
        ? trend[trend.length - 1].groundwater_level
        : (typeof predictionData?.groundwater_level === "number" ? predictionData.groundwater_level - 0.38 : 6.42);
    
    const level7d = typeof raw7d === "number" && !isNaN(raw7d) ? raw7d : 6.42;
    const level30d = +(currentLevel + (level7d - currentLevel) * 4).toFixed(2);
    const expectedChange = +(level30d - currentLevel).toFixed(2);
    const predictionDate = predictionData?.last_updated ?? new Date().toISOString().slice(0, 10);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8 space-y-6">
            
            {/* Groundwater Status Overview - Hero Banner */}
            <div className="card-surface p-6 bg-white flex flex-col gap-2 text-left shadow-sm border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">
                        Groundwater Status Overview
                    </h2>
                    {isRefreshing && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                            <FiRefreshCw className="h-3 w-3 animate-spin" />
                            Updating Live Data...
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-3xl">
                    Monitor groundwater conditions, view prediction results, analyze historical trends, and receive recommendations for efficient water resource management.
                </p>
            </div>

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
                    
                    {/* 1. AI Predictor Telemetry Form & Inference View */}
                    {activeTab === "prediction" && (
                        <div className="space-y-6">
                            <MlPredictorForm />
                        </div>
                    )}

                    {/* 2. Dashboard View */}
                    {activeTab === "dashboard" && (
                        <DashboardView predictionData={predictionData} forecastData={forecastData} />
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
                            <RecommendationCard recommendations={predictionData?.recommendations} />
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
        </div>
    );
}

export default Prediction;
