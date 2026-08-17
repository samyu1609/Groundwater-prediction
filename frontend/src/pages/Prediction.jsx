import { useEffect, useState } from "react";
import { requestPrediction, requestForecast, getMockPredictionData, getMockForecastData } from "../services/apiService";
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
import SystemAlertCard from "../components/SystemAlertCard";
import {
    FiLayout, FiTrendingDown, FiCloud, FiInfo,
    FiActivity, FiAlertTriangle, FiBookOpen, FiRefreshCw
} from "react-icons/fi";

const TABS = [
    { id: "dashboard",   label: "Dashboard",          icon: FiLayout },
    { id: "prediction",  label: "AI Predictor",       icon: FiActivity },
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

    const fetchAllData = async (lat, lng, isExplicitRetry = false) => {
        setIsLoading(true);
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
            
            // Push location details and weather condition up to the parent App/Navbar
            if (onDataLoaded) {
                onDataLoaded(pred.location, pred.weather?.condition);
            }
        } catch (err) {
            console.error("API Fetch Error:", err);
            // Fallback to Demo Mode so the dashboard remains fully functional even when backend is offline
            const mockPred = getMockPredictionData(lat, lng);
            const mockFcast = getMockForecastData();
            setPredictionData(mockPred);
            setForecastData(mockFcast);
            if (onDataLoaded) {
                onDataLoaded(mockPred.location, mockPred.weather?.condition);
            }
            if (isExplicitRetry && !err.response) {
                console.warn("Prediction server (http://127.0.0.1:8000) is unreachable. Operating in Demo Mode.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnableDemoMode = (lat = 13.0827, lng = 80.2707) => {
        setIsLoading(true);
        setError(null);
        setTimeout(() => {
            const mockPred = getMockPredictionData(lat, lng);
            const mockFcast = getMockForecastData();
            setPredictionData(mockPred);
            setForecastData(mockFcast);
            setLocationCoords({ latitude: lat, longitude: lng });
            if (onDataLoaded) {
                onDataLoaded(mockPred.location, mockPred.weather?.condition);
            }
            setIsLoading(false);
        }, 400);
    };

    const handleManualLocationSubmit = (lat, lng) => {
        setLocationCoords({ latitude: lat, longitude: lng });
        fetchAllData(lat, lng, true);
    };

    const runAutomaticDetection = () => {
        setIsLoading(true);
        setError(null);
        const defaultLat = 13.0827;
        const defaultLng = 80.2707;

        if (!navigator.geolocation) {
            setLocationCoords({ latitude: defaultLat, longitude: defaultLng });
            fetchAllData(defaultLat, defaultLng);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setLocationCoords({ latitude: lat, longitude: lng });
                fetchAllData(lat, lng);
            },
            (geoError) => {
                console.warn("Geolocation warning:", geoError);
                // Fall back to default location instead of locking user out with error screen
                setLocationCoords({ latitude: defaultLat, longitude: defaultLng });
                fetchAllData(defaultLat, defaultLng);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
        );
    };

    useEffect(() => {
        runAutomaticDetection();
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

    if (!isLoading && error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
                <SystemAlertCard 
                    error={error}
                    onRetry={runAutomaticDetection}
                    onEnableDemoMode={() => handleEnableDemoMode(locationCoords.latitude || 13.0827, locationCoords.longitude || 80.2707)}
                    onManualLocationSubmit={handleManualLocationSubmit}
                    isRetrying={isLoading}
                />
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

            {/* Offline / Demo Mode Warning Banner */}
            {predictionData?.is_demo && (
                <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-700 font-bold shrink-0">
                            <FiAlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
                                System Notice: Demo / Offline Mode Active
                            </h4>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                                Displaying offline simulated telemetry. Start the backend FastAPI server (<code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-amber-900">http://127.0.0.1:8000</code>) for live ML predictions.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={runAutomaticDetection} 
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                        <FiRefreshCw className="h-3.5 w-3.5" />
                        Reconnect Live Server
                    </button>
                </div>
            )}

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
                            <DashboardView predictionData={predictionData} forecastData={forecastData} />
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
                                    <LocationCard latitude={locationCoords.latitude} longitude={locationCoords.longitude} location={predictionData?.location} />
                                    <WeatherCard
                                        rainfall={predictionData?.weather?.rainfall}
                                        temperature={predictionData?.weather?.temperature}
                                        humidity={predictionData?.weather?.humidity}
                                    />
                                    <PredictionCard groundwaterLevel={currentLevel} />
                                    <StatusCard risk={predictionData?.risk} />
                                    <RecommendationCard recommendations={predictionData?.recommendations} />
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
            )}
        </div>
    );
}

export default Prediction;
