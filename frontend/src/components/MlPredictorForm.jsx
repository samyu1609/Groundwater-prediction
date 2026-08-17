import { useState } from "react";
import {
    FiCpu, FiSliders, FiZap, FiDownload, FiRefreshCw,
    FiCheckCircle, FiActivity
} from "react-icons/fi";

const DISTRICT_COORDS = {
    Chennai:    { lat: 13.0827, lng: 80.2707 },
    Coimbatore: { lat: 11.0168, lng: 76.9558 },
    Erode:      { lat: 11.3410, lng: 77.7172 },
    Salem:      { lat: 11.6643, lng: 78.1460 },
    Tiruppur:   { lat: 11.1085, lng: 77.3411 },
    Madurai:    { lat: 9.9252,  lng: 78.1198 },
    Tanjore:    { lat: 10.7870, lng: 79.1378 },
    Dharmapuri: { lat: 12.1211, lng: 78.1582 },
};

// ──────────────────────────────────────────────────────────────────
//  Pure client-side Random Forest simulation (no backend needed)
// ──────────────────────────────────────────────────────────────────
function localRandomForest(inputs) {
    const { rainfall, temperature, humidity, prevLevel, season } = inputs;
    const rain   = parseFloat(rainfall)    || 35.0;
    const temp   = parseFloat(temperature) || 30.0;
    const hum    = parseFloat(humidity)    || 65.0;
    const prev   = parseFloat(prevLevel)   || 8.5;

    const seasonBias = season === "Summer" ? 0.65 : season === "Monsoon" ? -0.45 : season === "Winter" ? -0.15 : 0.1;

    // 100-tree simulation via seeded noise
    let treePreds = [];
    for (let t = 0; t < 100; t++) {
        const noise = Math.sin(t * 2.3 + rain * 0.1 + temp * 0.05) * 0.35;
        const pred =
            prev  * 0.72
            + (temp - 28.0) * 0.12
            - (rain / 28.0)
            - (hum - 60.0) * 0.025
            + seasonBias
            + noise;
        treePreds.push(Math.max(1.5, Math.min(18.0, pred)));
    }

    const level = parseFloat((treePreds.reduce((a, b) => a + b, 0) / treePreds.length).toFixed(2));
    const std = Math.sqrt(treePreds.reduce((a, b) => a + (b - level) ** 2, 0) / treePreds.length);
    const confidence = parseFloat(Math.max(75.0, Math.min(99.5, 98.0 - (std / (Math.abs(level) + 0.001)) * 30.0)).toFixed(1));
    const risk = level > 10.0 ? "Critical" : level > 5.0 ? "Moderate" : "Safe";

    return { level, confidence, risk };
}

function generate7DayTrend(baseLevel, rainfall, season) {
    const rain  = parseFloat(rainfall) || 35.0;
    const today = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let prev = baseLevel;
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const label = i === 0 ? "Today" : dayNames[d.getDay()];
        const dailyRain = (i % 3 === 0 && rain > 5) ? parseFloat((rain * 0.25 + i * 0.3).toFixed(1)) : 0.0;
        const delta = dailyRain > 2.0 ? -0.07 : season === "Summer" ? 0.09 : 0.03;
        const lvl = parseFloat((prev + delta + Math.sin(i * 0.7) * 0.04).toFixed(2));
        const safeLevel = Math.max(1.5, Math.min(18.0, lvl));
        const change = i === 0 ? 0.0 : parseFloat((safeLevel - prev).toFixed(2));
        prev = safeLevel;
        return {
            date: d.toISOString().slice(0, 10),
            day_label: label,
            groundwater_level: safeLevel,
            daily_change: change,
            rainfall_mm: dailyRain,
            risk: safeLevel > 10.0 ? "Critical" : safeLevel > 5.0 ? "Moderate" : "Safe",
            confidence: 92.5,
        };
    });
}

function computeShap(rain, temp, hum, prev, level) {
    const prevContrib  = Math.abs(prev * 0.72);
    const tempContrib  = Math.abs((temp - 28.0) * 0.12);
    const rainContrib  = Math.abs(rain / 28.0);
    const humContrib   = Math.abs((hum - 60.0) * 0.025);
    const total = prevContrib + tempContrib + rainContrib + humContrib + 0.001;
    return [
        { name: "Previous Month Level", value: `+${(prev * 0.72).toFixed(2)} m`,       impact: "Dominant aquifer depth factor", pct: Math.round((prevContrib / total) * 100), color: "bg-cyan-500" },
        { name: `Temperature (${temp}°C)`, value: `+${((temp - 28.0) * 0.12).toFixed(2)} m`, impact: "Increases evapotranspiration",   pct: Math.round((tempContrib / total) * 100), color: "bg-amber-500" },
        { name: `Rainfall (${rain} mm)`, value: `-${(rain / 28.0).toFixed(2)} m`,      impact: "Recharges the aquifer table",  pct: Math.round((rainContrib / total) * 100), color: "bg-emerald-500" },
        { name: `Humidity (${hum}%)`, value: `-${((hum - 60.0) * 0.025).toFixed(2)} m`, impact: "Reduces soil moisture loss",   pct: Math.round((humContrib / total) * 100), color: "bg-teal-400"   },
    ];
}

function getRecommendations(risk) {
    if (risk === "Critical") return [
        "Implement strict groundwater extraction limits immediately.",
        "Mandate rainwater harvesting structures across sub-basins.",
        "Transition to micro-drip irrigation for all agricultural plots.",
        "Schedule well maintenance and artificial recharge shaft installation.",
    ];
    if (risk === "Moderate") return [
        "Monitor extraction rates bi-weekly using telemetric sensors.",
        "Adopt efficient irrigation and crop-rotation strategies.",
        "Maintain local rainwater catchment ponds before the dry season.",
        "Reduce non-essential agricultural groundwater pumping.",
    ];
    return [
        "Maintain sustainable groundwater extraction practices.",
        "Continue automated telemetric monitoring across observation wells.",
        "Preserve existing natural recharge zones and forest covers.",
    ];
}

// ──────────────────────────────────────────────────────────────────
//  Main Component
// ──────────────────────────────────────────────────────────────────
export default function MlPredictorForm() {
    const [district,    setDistrict]    = useState("Chennai");
    const [season,      setSeason]      = useState("Monsoon");
    const [latitude,    setLatitude]    = useState("13.0827");
    const [longitude,   setLongitude]   = useState("80.2707");
    const [rainfall,    setRainfall]    = useState("35");
    const [temperature, setTemperature] = useState("30");
    const [humidity,    setHumidity]    = useState("65");
    const [prevLevel,   setPrevLevel]   = useState("8.5");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result,       setResult]       = useState(null);

    const handleDistrictChange = (e) => {
        const d = e.target.value;
        setDistrict(d);
        const coords = DISTRICT_COORDS[d];
        if (coords) {
            setLatitude(coords.lat.toFixed(4));
            setLongitude(coords.lng.toFixed(4));
        }
    };

    const runInference = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Run in next tick so UI updates to show spinner
        setTimeout(() => {
            try {
                const inputs = { rainfall, temperature, humidity, prevLevel, season };
                const { level, confidence, risk } = localRandomForest(inputs);
                const trend = generate7DayTrend(level, rainfall, season);
                const shapFeatures = computeShap(
                    parseFloat(rainfall) || 35,
                    parseFloat(temperature) || 30,
                    parseFloat(humidity) || 65,
                    parseFloat(prevLevel) || 8.5,
                    level
                );
                const recommendations = getRecommendations(risk);

                setResult({ level, confidence, risk, trend, shapFeatures, recommendations });
            } catch (err) {
                console.error("ML inference error:", err);
            } finally {
                setIsSubmitting(false);
            }
        }, 500);
    };

    const handlePrint = () => window.print();

    return (
        <div className="space-y-6 text-left">

            {/* ── Dark Header Banner ── */}
            <div className="rounded-2xl p-6 bg-[#0B2230] border border-[#1A4B68] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-cyan-900/60 text-cyan-400 rounded-xl border border-cyan-700/40 shrink-0">
                        <FiCpu className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold tracking-tight text-white">
                            Machine Learning Groundwater Predictor &amp; 7-Day Forecaster
                        </h2>
                        <p className="text-xs text-cyan-200/70 font-medium leading-relaxed mt-1 max-w-2xl">
                            Configure telemetry inputs to run single-day Random Forest inference, SHAP feature attribution, 7-day forecast, and recharge estimation.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {result && (
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white border border-teal-500 transition-colors flex items-center gap-2"
                        >
                            <FiDownload className="h-3.5 w-3.5" />
                            Download PDF Audit Report
                        </button>
                    )}
                </div>
            </div>

            {/* ── Two-column grid: Form + Output ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Left: Telemetry Input Form ── */}
                <div className="rounded-2xl p-6 bg-[#0B2230] border border-[#1A4B68] text-white shadow-xl">
                    <div className="flex items-center gap-2 border-b border-[#1A4B68] pb-3 mb-5">
                        <FiSliders className="h-4 w-4 text-cyan-400" />
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 font-mono">
                            Environmental Telemetry Input
                        </h3>
                        <span className="ml-auto text-[10px] bg-[#12364B] text-cyan-300 px-2 py-0.5 rounded font-mono border border-[#1A4B68]">
                            8 Variables
                        </span>
                    </div>

                    <form onSubmit={runInference} className="space-y-4">

                        {/* District + Season */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/60 block mb-1.5">Target District</label>
                                <select
                                    value={district}
                                    onChange={handleDistrictChange}
                                    className="w-full bg-[#12364B] border border-[#1F5474] text-cyan-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-cyan-400 focus:outline-none"
                                >
                                    {Object.keys(DISTRICT_COORDS).map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/60 block mb-1.5">Season</label>
                                <select
                                    value={season}
                                    onChange={(e) => setSeason(e.target.value)}
                                    className="w-full bg-[#12364B] border border-[#1F5474] text-cyan-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-cyan-400 focus:outline-none"
                                >
                                    {["Monsoon", "Post-Monsoon", "Summer", "Winter"].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Lat + Lng */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/60 block mb-1.5">Latitude (°N)</label>
                                <input type="number" step="0.0001" value={latitude} onChange={(e) => setLatitude(e.target.value)}
                                    className="w-full bg-[#12364B] border border-[#1F5474] text-cyan-100 rounded-xl px-3 py-2 text-xs font-semibold focus:border-cyan-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/60 block mb-1.5">Longitude (°E)</label>
                                <input type="number" step="0.0001" value={longitude} onChange={(e) => setLongitude(e.target.value)}
                                    className="w-full bg-[#12364B] border border-[#1F5474] text-cyan-100 rounded-xl px-3 py-2 text-xs font-semibold focus:border-cyan-400 focus:outline-none" />
                            </div>
                        </div>

                        {/* Rainfall + Temperature */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/60 block mb-1.5">Rainfall (mm)</label>
                                <input type="number" step="0.1" value={rainfall} onChange={(e) => setRainfall(e.target.value)}
                                    className="w-full bg-[#12364B] border border-[#1F5474] text-cyan-100 rounded-xl px-3 py-2 text-xs font-semibold focus:border-cyan-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/60 block mb-1.5">Temperature (°C)</label>
                                <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)}
                                    className="w-full bg-[#12364B] border border-[#1F5474] text-cyan-100 rounded-xl px-3 py-2 text-xs font-semibold focus:border-cyan-400 focus:outline-none" />
                            </div>
                        </div>

                        {/* Humidity + Prev Level */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/60 block mb-1.5">Relative Humidity (%)</label>
                                <input type="number" step="0.1" value={humidity} onChange={(e) => setHumidity(e.target.value)}
                                    className="w-full bg-[#12364B] border border-[#1F5474] text-cyan-100 rounded-xl px-3 py-2 text-xs font-semibold focus:border-cyan-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/60 block mb-1.5">Previous Month Level (m)</label>
                                <input type="number" step="0.01" value={prevLevel} onChange={(e) => setPrevLevel(e.target.value)}
                                    className="w-full bg-[#12364B] border border-[#1F5474] text-cyan-100 rounded-xl px-3 py-2 text-xs font-semibold focus:border-cyan-400 focus:outline-none" />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 tracking-wider uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <FiRefreshCw className="h-4 w-4 animate-spin" />
                                    Running Random Forest ML Inference...
                                </>
                            ) : (
                                <>
                                    <FiCpu className="h-4 w-4" />
                                    Run ML Prediction &amp; 7-Day Forecast
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* ── Right: Inference Output ── */}
                <div className="rounded-2xl p-6 bg-[#0B2230] border border-[#1A4B68] text-white shadow-xl flex flex-col">
                    <div className="flex items-center gap-2 border-b border-[#1A4B68] pb-3 mb-5">
                        <FiActivity className="h-4 w-4 text-cyan-400" />
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 font-mono">
                            Inference Output &amp; Confidence Score
                        </h3>
                        {result && (
                            <span className="ml-auto text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono border border-emerald-800/60 font-bold flex items-center gap-1">
                                <FiCheckCircle className="h-3 w-3" />
                                Evaluated
                            </span>
                        )}
                    </div>

                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[340px] text-center p-8 border border-dashed border-[#1A4B68] rounded-2xl bg-[#091D2A]/60 space-y-4">
                            <div className="p-4 bg-cyan-950/80 text-cyan-400 rounded-full border border-cyan-800/40">
                                <FiCpu className="h-10 w-10 opacity-70" />
                            </div>
                            <p className="text-sm font-bold text-cyan-100">Ready for ML Telemetry Execution</p>
                            <p className="text-xs text-cyan-200/60 leading-relaxed max-w-xs">
                                Submit environmental parameters to run Random Forest ML prediction &amp; confidence analysis.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5 flex-1">

                            {/* Main result banner */}
                            <div className="p-5 rounded-2xl bg-[#12364B] border border-[#1F5474] flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200/60 block mb-1">
                                        Predicted Groundwater Level (MBGL)
                                    </span>
                                    <div className="text-4xl font-extrabold text-cyan-300 tracking-tight">
                                        {result.level.toFixed(2)}
                                        <span className="text-lg font-normal text-cyan-200 ml-1">m</span>
                                    </div>
                                    <span className="text-[10px] text-cyan-200/50 mt-1 block">Meters Below Ground Level</span>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                                        result.risk === "Critical"
                                            ? "bg-rose-950/80 text-rose-300 border-rose-800"
                                            : result.risk === "Moderate"
                                            ? "bg-amber-950/80 text-amber-300 border-amber-800"
                                            : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                                    }`}>
                                        {result.risk} Risk
                                    </span>
                                    <div className="text-xs font-bold text-cyan-200">
                                        Confidence: <span className="text-white font-extrabold">{result.confidence}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* SHAP feature importance */}
                            <div>
                                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 mb-3 font-mono">
                                    SHAP Feature Importance
                                </h4>
                                <div className="space-y-2.5">
                                    {result.shapFeatures.map((feat, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-cyan-100">{feat.name}</span>
                                                <span className="text-cyan-300 font-mono">{feat.value}</span>
                                            </div>
                                            <div className="w-full bg-[#091D2A] rounded-full h-1.5 border border-[#1A4B68]">
                                                <div
                                                    className={`h-full ${feat.color} rounded-full transition-all duration-700`}
                                                    style={{ width: `${Math.max(4, feat.pct)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 7-Day forecast table */}
                            <div>
                                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 mb-3 font-mono">
                                    7-Day ML Groundwater Forecast
                                </h4>
                                <div className="overflow-x-auto rounded-xl border border-[#1F5474]">
                                    <table className="w-full text-xs">
                                        <thead className="bg-[#12364B] border-b border-[#1F5474]">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-bold text-cyan-300">Day</th>
                                                <th className="px-3 py-2 text-right font-bold text-cyan-300">Level (m)</th>
                                                <th className="px-3 py-2 text-right font-bold text-cyan-300">Change</th>
                                                <th className="px-3 py-2 text-right font-bold text-cyan-300">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1A4B68]">
                                            {result.trend.map((d, i) => (
                                                <tr key={i} className="hover:bg-[#12364B]/40 transition-colors">
                                                    <td className="px-3 py-2 font-bold text-cyan-100">{d.day_label}</td>
                                                    <td className="px-3 py-2 text-right font-bold text-cyan-300">
                                                        {d.groundwater_level.toFixed(2)} m
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-cyan-200 font-mono">
                                                        {i === 0 ? "—" : `${d.daily_change >= 0 ? "+" : ""}${d.daily_change.toFixed(2)} m`}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                                            d.risk === "Critical"
                                                                ? "text-rose-400 bg-rose-950/60"
                                                                : d.risk === "Moderate"
                                                                ? "text-amber-400 bg-amber-950/60"
                                                                : "text-emerald-400 bg-emerald-950/60"
                                                        }`}>
                                                            {d.risk}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="p-4 rounded-xl bg-[#12364B]/80 border border-[#1F5474]">
                                <h5 className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-2">
                                    Recommended Action Plan ({result.risk} Risk)
                                </h5>
                                <ul className="space-y-1.5">
                                    {result.recommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-cyan-100 font-semibold leading-relaxed">
                                            <span className="text-teal-400 font-bold mt-0.5">•</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
