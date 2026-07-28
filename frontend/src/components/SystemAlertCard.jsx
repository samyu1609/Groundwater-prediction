import { useState } from "react";
import { 
    FiAlertTriangle, 
    FiRefreshCw, 
    FiServer, 
    FiCompass, 
    FiMapPin, 
    FiCheckCircle,
    FiExternalLink,
    FiCpu
} from "react-icons/fi";

function SystemAlertCard({ 
    error, 
    onRetry, 
    onEnableDemoMode, 
    onManualLocationSubmit, 
    isRetrying = false 
}) {
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [manualLat, setManualLat] = useState("");
    const [manualLng, setManualLng] = useState("");
    const [showManualCoords, setShowManualCoords] = useState(false);

    const isGeoError = error?.toLowerCase().includes("location") || error?.toLowerCase().includes("geolocation");
    const isConnError = error?.toLowerCase().includes("connect") || error?.toLowerCase().includes("server");

    const handleManualSubmit = (e) => {
        e.preventDefault();
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (!isNaN(lat) && !isNaN(lng) && onManualLocationSubmit) {
            onManualLocationSubmit(lat, lng);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
            {/* Main Card Shell */}
            <div className="w-full bg-white rounded-2xl border border-red-200/80 shadow-xl overflow-hidden text-left transition-all duration-300">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-white opacity-75"></span>
                            <FiAlertTriangle className="relative h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded text-white/90">
                                {isGeoError ? "Permission Needed" : "Connectivity Notice"}
                            </span>
                            <h3 className="text-base font-bold leading-tight">System Alert</h3>
                        </div>
                    </div>
                    <span className="text-xs bg-red-700/50 px-2.5 py-1 rounded-full font-mono text-red-100 flex items-center gap-1.5 border border-red-400/30">
                        <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse"></span>
                        Status 503 / Offline
                    </span>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6">
                    {/* Error Message Display */}
                    <div className="bg-red-50/70 rounded-xl p-4 border border-red-100/80 flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0 mt-0.5">
                            {isGeoError ? <FiCompass className="h-5 w-5" /> : <FiServer className="h-5 w-5" />}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900">
                                {isGeoError ? "Geolocation Permission Required" : "Prediction Server Unavailable"}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                {error || "AquaSense AI is unable to fetch real-time telemetry from the backend service."}
                            </p>
                        </div>
                    </div>

                    {/* Troubleshooting / Diagnostic Hints */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs space-y-3">
                        <div className="flex items-center justify-between text-slate-700 font-semibold">
                            <span className="flex items-center gap-1.5">
                                <FiCpu className="h-4 w-4 text-blue-600" />
                                Recommended Action
                            </span>
                            <button 
                                onClick={() => setShowDiagnostics(!showDiagnostics)}
                                className="text-blue-600 hover:text-blue-800 text-[11px] font-medium underline flex items-center gap-1"
                            >
                                {showDiagnostics ? "Hide Technical Details" : "View Diagnostic Info"}
                            </button>
                        </div>

                        {isConnError && (
                            <p className="text-slate-600 leading-relaxed">
                                Ensure the Python FastAPI server is running on <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px] text-slate-800">http://127.0.0.1:8000</code>.
                            </p>
                        )}

                        {isGeoError && (
                            <p className="text-slate-600 leading-relaxed">
                                Enable browser location permissions or manually enter coordinates below to proceed with prediction.
                            </p>
                        )}

                        {showDiagnostics && (
                            <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-2 border border-slate-800">
                                <div className="text-amber-400 font-semibold mb-1">Backend Diagnostics:</div>
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span>Target Endpoint:</span>
                                    <span className="text-cyan-400">http://127.0.0.1:8000/predict</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-1">
                                    <span>Fallback Server:</span>
                                    <span className="text-cyan-400">http://localhost:8000</span>
                                </div>
                                <div className="pt-1">
                                    <span className="text-slate-400 block mb-1">Command to launch backend:</span>
                                    <code className="text-emerald-400 bg-slate-800 p-1.5 rounded block select-all">
                                        python -m uvicorn backend.app:app --reload --port 8000
                                    </code>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Manual Location Form Toggle */}
                    {isGeoError && (
                        <div className="border-t border-slate-100 pt-4">
                            <button 
                                onClick={() => setShowManualCoords(!showManualCoords)}
                                className="text-xs text-blue-600 font-semibold flex items-center gap-1.5 hover:underline"
                            >
                                <FiMapPin className="h-4 w-4" />
                                {showManualCoords ? "Hide manual coordinate form" : "Enter coordinates manually (Latitude & Longitude)"}
                            </button>

                            {showManualCoords && (
                                <form onSubmit={handleManualSubmit} className="mt-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap gap-3 items-end">
                                    <div className="flex-1 min-w-[130px]">
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Latitude</label>
                                        <input 
                                            type="number" 
                                            step="any"
                                            placeholder="e.g. 13.0827" 
                                            value={manualLat}
                                            onChange={(e) => setManualLat(e.target.value)}
                                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[130px]">
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Longitude</label>
                                        <input 
                                            type="number" 
                                            step="any"
                                            placeholder="e.g. 80.2707" 
                                            value={manualLng}
                                            onChange={(e) => setManualLng(e.target.value)}
                                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                    >
                                        Submit Location
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <button 
                            onClick={onRetry} 
                            disabled={isRetrying}
                            className="w-full sm:flex-1 py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <FiRefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
                            {isRetrying ? "Reconnecting..." : "Retry Connection"}
                        </button>

                        {onEnableDemoMode && (
                            <button 
                                onClick={onEnableDemoMode} 
                                className="w-full sm:flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <FiCheckCircle className="h-4 w-4 text-emerald-400" />
                                Explore Demo / Offline Mode
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>AquaSense AI Diagnostic Assistant</span>
                    <span className="flex items-center gap-1 text-slate-400">
                        AquaSense v1.0
                    </span>
                </div>
            </div>
        </div>
    );
}

export default SystemAlertCard;
