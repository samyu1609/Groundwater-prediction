import { useState, useMemo } from "react";
import { FiCalendar, FiFilter, FiList, FiTrendingDown } from "react-icons/fi";

const HISTORICAL_DB = [
    // Coimbatore
    { year: 2021, district: "Coimbatore", location: "Site A", groundwater: 8.20, rainfall: 850, temp: 28.5 },
    { year: 2022, district: "Coimbatore", location: "Site A", groundwater: 7.80, rainfall: 900, temp: 29.0 },
    { year: 2023, district: "Coimbatore", location: "Site A", groundwater: 7.20, rainfall: 800, temp: 28.2 },
    { year: 2024, district: "Coimbatore", location: "Site A", groundwater: 6.90, rainfall: 920, temp: 28.7 },
    { year: 2025, district: "Coimbatore", location: "Site A", groundwater: 6.80, rainfall: 870, temp: 29.2 },
    { year: 2026, district: "Coimbatore", location: "Site A", groundwater: 6.35, rainfall: 890, temp: 28.9, isPrediction: true },

    { year: 2021, district: "Coimbatore", location: "Site B", groundwater: 8.60, rainfall: 830, temp: 28.0 },
    { year: 2022, district: "Coimbatore", location: "Site B", groundwater: 8.10, rainfall: 880, temp: 28.5 },
    { year: 2023, district: "Coimbatore", location: "Site B", groundwater: 7.70, rainfall: 820, temp: 27.9 },
    { year: 2024, district: "Coimbatore", location: "Site B", groundwater: 7.30, rainfall: 910, temp: 28.2 },
    { year: 2025, district: "Coimbatore", location: "Site B", groundwater: 7.10, rainfall: 860, temp: 28.8 },
    { year: 2026, district: "Coimbatore", location: "Site B", groundwater: 6.65, rainfall: 880, temp: 28.4, isPrediction: true },

    // Erode
    { year: 2021, district: "Erode", location: "Site A", groundwater: 5.10, rainfall: 780, temp: 29.5 },
    { year: 2022, district: "Erode", location: "Site A", groundwater: 4.80, rainfall: 810, temp: 30.1 },
    { year: 2023, district: "Erode", location: "Site A", groundwater: 4.50, rainfall: 790, temp: 29.8 },
    { year: 2024, district: "Erode", location: "Site A", groundwater: 4.40, rainfall: 820, temp: 30.2 },
    { year: 2025, district: "Erode", location: "Site A", groundwater: 4.35, rainfall: 800, temp: 30.5 },
    { year: 2026, district: "Erode", location: "Site A", groundwater: 3.90, rainfall: 810, temp: 30.0, isPrediction: true },

    // Salem
    { year: 2021, district: "Salem", location: "Site A", groundwater: 10.40, rainfall: 910, temp: 27.8 },
    { year: 2022, district: "Salem", location: "Site A", groundwater: 9.90, rainfall: 950, temp: 28.2 },
    { year: 2023, district: "Salem", location: "Site A", groundwater: 9.50, rainfall: 880, temp: 27.6 },
    { year: 2024, district: "Salem", location: "Site A", groundwater: 9.30, rainfall: 960, temp: 28.0 },
    { year: 2025, district: "Salem", location: "Site A", groundwater: 9.20, rainfall: 900, temp: 28.4 },
    { year: 2026, district: "Salem", location: "Site A", groundwater: 8.75, rainfall: 920, temp: 28.1, isPrediction: true },

    // Tiruppur
    { year: 2021, district: "Tiruppur", location: "Site A", groundwater: 7.20, rainfall: 880, temp: 28.2 },
    { year: 2022, district: "Tiruppur", location: "Site A", groundwater: 6.90, rainfall: 910, temp: 28.7 },
    { year: 2023, district: "Tiruppur", location: "Site A", groundwater: 6.50, rainfall: 840, temp: 28.0 },
    { year: 2024, district: "Tiruppur", location: "Site A", groundwater: 6.30, rainfall: 930, temp: 28.3 },
    { year: 2025, district: "Tiruppur", location: "Site A", groundwater: 6.12, rainfall: 920, temp: 28.9 },
    { year: 2026, district: "Tiruppur", location: "Site A", groundwater: 5.67, rainfall: 940, temp: 28.6, isPrediction: true },
];

function HistoryView() {
    const [filterYear, setFilterYear] = useState("All");
    const [filterDistrict, setFilterDistrict] = useState("Coimbatore");
    const [filterLocation, setFilterLocation] = useState("Site A");

    // Dynamic filtering
    const filteredRecords = useMemo(() => {
        return HISTORICAL_DB.filter(rec => {
            const matchesYear = filterYear === "All" || rec.year.toString() === filterYear;
            const matchesDistrict = rec.district === filterDistrict;
            const matchesLocation = rec.location === filterLocation;
            return matchesYear && matchesDistrict && matchesLocation;
        });
    }, [filterYear, filterDistrict, filterLocation]);

    // Graph points representing 2021-2026 for the active district and location
    const graphData = useMemo(() => {
        return HISTORICAL_DB.filter(rec => rec.district === filterDistrict && rec.location === filterLocation)
            .sort((a, b) => a.year - b.year);
    }, [filterDistrict, filterLocation]);

    // Unique options for dropdowns
    const yearOptions = ["All", "2021", "2022", "2023", "2024", "2025", "2026"];
    const districtOptions = ["Coimbatore", "Erode", "Salem", "Tiruppur"];
    
    // Locations for the selected district
    const locationOptions = useMemo(() => {
        const locs = HISTORICAL_DB.filter(rec => rec.district === filterDistrict)
            .map(rec => rec.location);
        return Array.from(new Set(locs));
    }, [filterDistrict]);

    // SVG parameters
    const W = 600, H = 220;
    const PL = 50, PR = 20, PT = 20, PB = 36;
    const cw = W - PL - PR;
    const ch = H - PT - PB;

    const levels = graphData.map(d => d.groundwater);
    const minL = Math.max(0, Math.min(...levels) - 1.0);
    const maxL = Math.max(...levels) + 1.0;

    const getX = (i) => PL + (i / (graphData.length - 1)) * cw;
    const getY = (v) => PT + (1 - (v - minL) / (maxL - minL)) * ch;

    let linePath = "";
    graphData.forEach((d, i) => {
        const x = getX(i), y = getY(d.groundwater);
        linePath += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    return (
        <div className="space-y-6 text-left">
            {/* Filter Section Card */}
            <div className="card-surface p-5">
                <div className="flex items-center gap-2 text-[#0F4C81] mb-4">
                    <FiFilter className="h-4.5 w-4.5" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Filter Historical Records
                    </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Year
                        </label>
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:bg-white"
                        >
                            {yearOptions.map(y => (
                                <option key={y} value={y}>{y === "All" ? "All Years" : y}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            District
                        </label>
                        <select
                            value={filterDistrict}
                            onChange={(e) => {
                                setFilterDistrict(e.target.value);
                                setFilterLocation("Site A");
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:bg-white"
                        >
                            {districtOptions.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Location
                        </label>
                        <select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:bg-white"
                        >
                            {locationOptions.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Line Chart & Records Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Groundwater Trend Chart */}
                <div className="card-surface p-5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[#0F4C81]">
                            <FiTrendingDown className="h-4.5 w-4.5" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Groundwater Trend
                            </h3>
                        </div>
                        <div className="flex gap-4 text-[10px] font-bold">
                            <span className="flex items-center gap-1.5 text-blue-600">
                                <span className="h-2 w-2 bg-blue-600 rounded-full inline-block"></span>
                                Historical Levels
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-400">
                                <span className="h-2 w-2 bg-slate-400 rounded-full inline-block"></span>
                                Predicted Level
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px] h-auto">
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

                            {/* Line path */}
                            <path d={linePath} fill="none" stroke="#0F4C81" strokeWidth="2.5" strokeLinecap="round" />

                            {/* Node circles */}
                            {graphData.map((d, i) => {
                                const x = getX(i), y = getY(d.groundwater);
                                const isPrediction = d.isPrediction;
                                return (
                                    <g key={i}>
                                        <circle cx={x} cy={y} r={isPrediction ? 6 : 4.5}
                                            fill={isPrediction ? "#1976D2" : "#0F4C81"}
                                            stroke="#fff" strokeWidth="1.5" />
                                        <text x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="600">
                                            {d.year} {isPrediction ? "(Pred)" : ""}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* 2. Simple data table for filter values */}
                <div className="card-surface p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[#0F4C81] mb-4">
                            <FiList className="h-4.5 w-4.5" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Historical Records
                            </h3>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-slate-100 max-h-[220px]">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                                    <tr>
                                        <th className="text-left px-3 py-2 font-semibold text-slate-400">Year</th>
                                        <th className="text-right px-3 py-2 font-semibold text-slate-400">Level</th>
                                        <th className="text-right px-3 py-2 font-semibold text-slate-400">Rainfall</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((rec, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="px-3 py-2 font-bold text-slate-700">
                                                {rec.year}
                                                {rec.isPrediction && (
                                                    <span className="ml-1 text-[8px] bg-blue-100 text-blue-800 px-1 rounded font-bold uppercase">
                                                        Pred
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-right font-bold text-slate-800">
                                                {rec.groundwater.toFixed(2)} m
                                            </td>
                                            <td className="px-3 py-2 text-right text-slate-600 font-semibold">
                                                {rec.rainfall} mm
                                            </td>
                                        </tr>
                                    ))}
                                    {!filteredRecords.length && (
                                        <tr>
                                            <td colSpan="3" className="px-3 py-6 text-center text-slate-400 font-medium">
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                        Filtered dataset output
                    </div>
                </div>

            </div>
        </div>
    );
}

export default HistoryView;
