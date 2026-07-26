import { useState } from "react";
import { FiTrendingDown, FiTrendingUp, FiMinus } from "react-icons/fi";

const RISK_STYLES = {
    Safe:     { dot: "bg-emerald-500", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    Moderate: { dot: "bg-amber-500",   text: "text-amber-600",   badge: "bg-amber-50 text-amber-700 border-amber-100"   },
    Critical: { dot: "bg-rose-500",    text: "text-rose-600",    badge: "bg-rose-50 text-rose-700 border-rose-100"     },
};

function ChangeArrow({ change }) {
    if (change === 0) return <FiMinus className="h-3.5 w-3.5 text-slate-400" />;
    if (change > 0)  return <FiTrendingDown className="h-3.5 w-3.5 text-rose-500" title="Depth increasing" />;
    return <FiTrendingUp className="h-3.5 w-3.5 text-emerald-500" title="Depth decreasing" />;
}

function GroundwaterTrendCard({ trend = [], currentLevel, rainfallRecommendation, hasRainfall }) {
    const [hoveredIdx, setHoveredIdx] = useState(null);

    if (!trend.length) return null;

    // SVG chart dimensions
    const W = 560, H = 200;
    const PL = 50, PR = 20, PT = 20, PB = 36;
    const cw = W - PL - PR;
    const ch = H - PT - PB;

    const levels = trend.map(d => d.groundwater_level);
    const minL = Math.max(0, Math.min(...levels) - 0.5);
    const maxL = Math.max(...levels) + 0.5;

    const getX = (i) => PL + (i / (trend.length - 1)) * cw;
    const getY = (v) => PT + (1 - (v - minL) / (maxL - minL)) * ch;

    let linePath = "";
    trend.forEach((d, i) => {
        const x = getX(i), y = getY(d.groundwater_level);
        linePath += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    // Filled area under line
    const firstX = getX(0), lastX = getX(trend.length - 1);
    const bottomY = PT + ch;
    const areaPath = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return (
        <div className="card-surface p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-blue-600">
                    <FiTrendingDown className="h-5 w-5" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Groundwater Trend — Next 7 Days
                    </h3>
                </div>
                {currentLevel !== undefined && (
                    <span className="text-xs font-semibold text-slate-400">
                        Current: <span className="text-slate-700">{currentLevel?.toFixed(2)} m</span>
                    </span>
                )}
            </div>

            {/* SVG Line Chart */}
            <div className="overflow-x-auto -mx-1 px-1">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px] h-auto">
                    {/* Area fill */}
                    <defs>
                        <linearGradient id="gwGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#gwGrad)" />

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                        const y = PT + r * ch;
                        const val = maxL - r * (maxL - minL);
                        return (
                            <g key={i}>
                                <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                                <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="600">
                                    {val.toFixed(1)}m
                                </text>
                            </g>
                        );
                    })}

                    {/* Main trend line */}
                    <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data points + tooltips */}
                    {trend.map((d, i) => {
                        const x = getX(i), y = getY(d.groundwater_level);
                        const isHovered = hoveredIdx === i;
                        const rs = RISK_STYLES[d.risk] ?? RISK_STYLES.Safe;
                        return (
                            <g key={i}
                                onMouseEnter={() => setHoveredIdx(i)}
                                onMouseLeave={() => setHoveredIdx(null)}
                                style={{ cursor: "pointer" }}>
                                <circle cx={x} cy={y} r={isHovered ? 7 : 4.5}
                                    fill={isHovered ? "#2563eb" : "#fff"}
                                    stroke="#2563eb" strokeWidth="2"
                                    style={{ transition: "r 0.15s" }} />
                                {/* Hover tooltip */}
                                {isHovered && (
                                    <g>
                                        <rect x={x - 42} y={y - 40} width="84" height="30"
                                            rx="6" fill="#1e293b" opacity="0.92" />
                                        <text x={x} y={y - 28} textAnchor="middle" fontSize="9.5" fill="#fff" fontWeight="700">
                                            {d.groundwater_level.toFixed(2)} m · {d.risk}
                                        </text>
                                        <text x={x} y={y - 16} textAnchor="middle" fontSize="8.5" fill="#94a3b8">
                                            Conf: {d.confidence}%
                                        </text>
                                    </g>
                                )}
                                {/* X-axis day label */}
                                <text x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="600">
                                    {d.day_label === "Today" ? "Today" : d.day_label.slice(0, 3)}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-xs min-w-[480px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="text-left px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wider">Day</th>
                            <th className="text-right px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wider">Level (m)</th>
                            <th className="text-right px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wider">Change</th>
                            <th className="text-right px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wider">Confidence</th>
                            <th className="text-right px-4 py-2.5 font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trend.map((d, i) => {
                            const rs = RISK_STYLES[d.risk] ?? RISK_STYLES.Safe;
                            return (
                                <tr key={i}
                                    className={`border-b border-slate-50 transition-colors duration-150 ${
                                        i === 0 ? "bg-blue-50/30" : "hover:bg-slate-50/60"
                                    }`}
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onMouseLeave={() => setHoveredIdx(null)}>
                                    <td className="px-4 py-2.5 font-bold text-slate-700">
                                        {d.day_label}
                                        {i === 0 && (
                                            <span className="ml-2 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                                Current
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-bold text-slate-800">
                                        {d.groundwater_level.toFixed(2)} m
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <span className="inline-flex items-center justify-end gap-1 font-semibold text-slate-600">
                                            <ChangeArrow change={d.daily_change} />
                                            {i === 0 ? "—" : (
                                                <span className={d.daily_change >= 0 ? "text-rose-500" : "text-emerald-600"}>
                                                    {d.daily_change >= 0 ? "+" : ""}{d.daily_change.toFixed(2)} m
                                                </span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-semibold text-slate-600">
                                        {d.confidence}%
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${rs.badge}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${rs.dot}`}></span>
                                            {d.risk}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Rainfall Recommendation Banner */}
            {rainfallRecommendation && (
                <div className={`rounded-xl border px-5 py-4 text-sm font-medium leading-relaxed ${
                    hasRainfall
                        ? "bg-blue-50/60 border-blue-100 text-blue-800"
                        : "bg-amber-50/60 border-amber-100 text-amber-800"
                }`}>
                    <span className="mr-2">{hasRainfall ? "🌧" : "☀️"}</span>
                    {rainfallRecommendation}
                </div>
            )}
        </div>
    );
}

export default GroundwaterTrendCard;
