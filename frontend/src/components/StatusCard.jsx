import { FiActivity } from "react-icons/fi";

const STATUS_INDICATORS = {
    Safe:     { emoji: "🟢", label: "Safe",     text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", desc: "Groundwater level is safe. Conditions are optimal." },
    Moderate: { emoji: "🟡", label: "Moderate", text: "text-amber-700",   bg: "bg-amber-50 border-amber-100",     desc: "Groundwater level is moderate. Ongoing monitoring is recommended." },
    Critical: { emoji: "🔴", label: "Critical", text: "text-rose-700",    bg: "bg-rose-50 border-rose-100",       desc: "Groundwater level is critical. Immediate reduction in usage required." },
};

function StatusCard({ risk }) {
    // Map backend "Safe" to display "Safe"
    const displayStatus = risk === "Safe" ? "Safe" : risk || "Moderate";
    const config = STATUS_INDICATORS[displayStatus] ?? STATUS_INDICATORS.Moderate;

    return (
        <div className="card-surface p-6 card-surface-hover flex flex-col justify-between text-left">
            <div>
                <div className="flex items-center gap-2.5 text-[#0F4C81] mb-4">
                    <FiActivity className="h-5 w-5" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Groundwater Status
                    </h3>
                </div>
                
                <div className="py-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                        Current Status
                    </span>
                    
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${config.bg} ${config.text}`}>
                        <span>{config.emoji}</span>
                        <span>{config.label}</span>
                    </div>
                </div>
            </div>

            <p className="text-[11px] font-semibold text-slate-400 leading-normal pt-3 border-t border-slate-100">
                Groundwater condition based on predicted water level.
            </p>
        </div>
    );
}

export default StatusCard;
