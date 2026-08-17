import { useState } from "react";
import { FiMap } from "react-icons/fi";

const RISK_INDICATORS = {
    Safe:     { emoji: "🟢", label: "Safe",     text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-600" },
    Moderate: { emoji: "🟡", label: "Moderate", text: "text-amber-700",   bg: "bg-amber-50 border-amber-100",     dot: "bg-amber-500" },
    Critical: { emoji: "🔴", label: "Critical", text: "text-rose-700",    bg: "bg-rose-50 border-rose-100",       dot: "bg-rose-600" },
};

function RiskMapView() {
    const districts = [
        {
            id: "erode",
            name: "Erode District",
            groundwater: 4.35,
            predicted: 3.90,
            risk: "Critical",
            rainfall: 800,
            recommendation: "Reduce groundwater extraction and implement rainwater harvesting.",
            color: "fill-rose-50 hover:fill-rose-100 stroke-rose-500",
            x: 40,
            y: 30,
            w: 120,
            h: 80
        },
        {
            id: "coimbatore",
            name: "Coimbatore District",
            groundwater: 7.84,
            predicted: 7.39,
            risk: "Moderate",
            rainfall: 850,
            recommendation: "Monitor groundwater usage and adopt efficient irrigation.",
            color: "fill-amber-50 hover:fill-amber-100 stroke-amber-500",
            x: 40,
            y: 130,
            w: 120,
            h: 80
        },
        {
            id: "salem",
            name: "Salem District",
            groundwater: 9.20,
            predicted: 8.75,
            risk: "Safe",
            rainfall: 900,
            recommendation: "Groundwater level is healthy.",
            color: "fill-emerald-50 hover:fill-emerald-100 stroke-emerald-500",
            x: 180,
            y: 30,
            w: 120,
            h: 80
        },
        {
            id: "tiruppur",
            name: "Tiruppur District",
            groundwater: 6.12,
            predicted: 5.67,
            risk: "Safe",
            rainfall: 920,
            recommendation: "Groundwater level is healthy.",
            color: "fill-emerald-50 hover:fill-emerald-100 stroke-emerald-500",
            x: 180,
            y: 130,
            w: 120,
            h: 80
        }
    ];

    const [selectedId, setSelectedId] = useState("erode");
    const activeDistrict = districts.find(d => d.id === selectedId) || districts[0];
    const config = RISK_INDICATORS[activeDistrict?.risk] ?? RISK_INDICATORS.Moderate;

    const gwVal = typeof activeDistrict?.groundwater === "number" && !isNaN(activeDistrict.groundwater) ? activeDistrict.groundwater.toFixed(2) : "0.00";
    const predVal = typeof activeDistrict?.predicted === "number" && !isNaN(activeDistrict.predicted) ? activeDistrict.predicted.toFixed(2) : "0.00";

    return (
        <div className="card-surface p-6 text-left">
            {/* Header info */}
            <div className="flex items-center gap-2.5 text-[#0F4C81] mb-5 border-b border-slate-100 pb-3">
                <FiMap className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Groundwater Risk Map
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Map Container */}
                <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 lg:col-span-2 flex flex-col items-center justify-center min-h-[280px]">
                    <svg viewBox="0 0 340 240" className="w-full max-w-[340px] h-auto">
                        {districts.map((d) => (
                            <g 
                                key={d.id} 
                                onClick={() => setSelectedId(d.id)}
                                className="cursor-pointer group"
                            >
                                <rect 
                                    x={d.x} 
                                    y={d.y} 
                                    width={d.w} 
                                    height={d.h} 
                                    rx="6" 
                                    className={`${d.color} stroke-2 transition-all duration-150 ${
                                        selectedId === d.id ? "filter drop-shadow-sm stroke-[3px] stroke-blue-700" : ""
                                    }`}
                                />
                                <text 
                                    x={d.x + d.w / 2} 
                                    y={d.y + d.h / 2} 
                                    textAnchor="middle" 
                                    className="text-[10px] font-bold fill-slate-800 pointer-events-none group-hover:fill-slate-900"
                                >
                                    {d.name.split(" ")[0]}
                                </text>
                                <text 
                                    x={d.x + d.w / 2} 
                                    y={d.y + d.h / 2 + 13} 
                                    textAnchor="middle" 
                                    className="text-[8px] font-semibold fill-slate-500 pointer-events-none"
                                >
                                    {d.risk}
                                </text>
                            </g>
                        ))}
                    </svg>

                    {/* Legend */}
                    <div className="flex gap-4 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                            <span className="h-3 w-3 bg-emerald-50 border border-emerald-400 rounded"></span>
                            Safe
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-3 w-3 bg-amber-50 border border-amber-400 rounded"></span>
                            Moderate
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-3 w-3 bg-rose-50 border border-rose-400 rounded"></span>
                            Critical
                        </span>
                    </div>
                </div>

                {/* District details inspector */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                {activeDistrict?.name}
                            </h4>
                            <span className="text-sm">{config.emoji}</span>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Groundwater Level
                                </span>
                                <span className="text-base font-bold text-slate-800">
                                    {gwVal} m
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Prediction (30 Days)
                                </span>
                                <span className="text-base font-bold text-blue-700">
                                    {predVal} m
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Rainfall Level
                                </span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {activeDistrict?.rainfall} mm
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Recommendation
                        </span>
                        <p className="text-[11px] font-semibold text-slate-600 leading-normal">
                            {activeDistrict?.recommendation}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RiskMapView;
