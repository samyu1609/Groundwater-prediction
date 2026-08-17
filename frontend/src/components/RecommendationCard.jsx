import { FiInfo } from "react-icons/fi";

function RecommendationCard({ recommendations }) {
    const defaultActions = [
        "Harvest rainwater frequently.",
        "Use drip irrigation where suitable.",
        "Avoid excessive groundwater extraction.",
        "Monitor groundwater levels regularly.",
        "Use water efficiently during low rainfall periods."
    ];
    const actions = (recommendations && recommendations.length > 0) ? recommendations : defaultActions;

    return (
        <div className="card-surface p-6 card-surface-hover">
            <div className="flex items-center gap-2.5 text-[#0F4C81] mb-4">
                <FiInfo className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Recommended Actions
                </h3>
            </div>
            
            <div className="py-2">
                <ul className="space-y-3">
                    {actions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm font-semibold text-slate-700 leading-relaxed">
                            <span className="text-[#0F4C81] mt-1 select-none font-extrabold">•</span>
                            <span>{action}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default RecommendationCard;
