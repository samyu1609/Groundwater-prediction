import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiTrendingDown, FiActivity, FiHome } from "react-icons/fi";

const CONDITION_EMOJI = {
    Rainy: "🌧",
    Hot:   "☀️",
    Humid: "☁️",
    Cool:  "🌬️",
    Clear: "☀️",
};

function Navbar({ location, weatherCondition }) {
    const [timeString, setTimeString] = useState("");
    const [dateString, setDateString] = useState("");
    const routerLocation = useLocation();

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setTimeString(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
            setDateString(now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
        };
        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Format location text: State, District
    const locationText = location?.state && location?.district
        ? `${location.district}, ${location.state}`
        : "Detecting location...";

    const emoji = CONDITION_EMOJI[weatherCondition] ?? "🌤️";
    const isPredictionActive = routerLocation.pathname !== "/";

    return (
        <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
            <div className="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 lg:px-8 gap-4">
                {/* Left Side: Brand, Subtitle & Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F4C81] text-white shadow-sm shrink-0 group-hover:bg-[#0c3e69] transition-colors">
                            <FiTrendingDown className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                                AquaSense AI
                            </h1>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                                Groundwater Monitoring and Prediction System
                            </p>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-2 sm:pl-4 sm:border-l sm:border-slate-200">
                        <Link
                            to="/"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                !isPredictionActive
                                    ? "bg-slate-100 text-[#0F4C81]"
                                    : "text-slate-600 hover:text-[#0F4C81] hover:bg-slate-50"
                            }`}
                        >
                            <FiHome className="h-3.5 w-3.5" />
                            <span>Home</span>
                        </Link>
                        <Link
                            to="/prediction"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                isPredictionActive
                                    ? "bg-[#0F4C81] text-white shadow-sm"
                                    : "text-slate-600 hover:text-[#0F4C81] hover:bg-slate-50"
                            }`}
                        >
                            <FiActivity className="h-3.5 w-3.5" />
                            <span>AI Predictor</span>
                        </Link>
                    </nav>
                </div>

                {/* Right Side: Date, Time, Location, Weather */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 sm:text-right sm:justify-end">
                    <div className="border-r border-slate-200 pr-4 last:border-none">
                        <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Date &amp; Time</span>
                        <span>{dateString} · {timeString}</span>
                    </div>
                    <div className="border-r border-slate-200 pr-4 last:border-none">
                        <span className="text-[10px] uppercase text-slate-400 block tracking-wider">Location</span>
                        <span className="text-slate-800">{locationText}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-1">
                        <span className="text-2xl" role="img" aria-label={weatherCondition || "Weather"}>
                            {emoji}
                        </span>
                        {weatherCondition && (
                            <span className="text-[10px] uppercase text-slate-400 font-bold">
                                {weatherCondition}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
