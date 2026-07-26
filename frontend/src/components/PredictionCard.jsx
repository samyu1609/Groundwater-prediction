import { FiTrendingDown } from "react-icons/fi";

function PredictionCard({ groundwaterLevel }) {
    return (
        <div className="card-surface p-6 card-surface-hover flex flex-col justify-between">
            <div className="flex items-center gap-2.5 text-blue-600 mb-4">
                <FiTrendingDown className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Prediction Result
                </h3>
            </div>
            
            <div className="flex flex-col justify-center py-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    Predicted Groundwater Level
                </span>
                <span className="text-4xl sm:text-5xl font-extrabold text-blue-600 tracking-tight">
                    {groundwaterLevel !== null && groundwaterLevel !== undefined 
                        ? `${groundwaterLevel.toFixed(2)} m` 
                        : "Calculating..."}
                </span>
                <span className="text-xs text-slate-400 mt-2 font-medium">
                    Depth below ground level (MBGL)
                </span>
            </div>
        </div>
    );
}

export default PredictionCard;
