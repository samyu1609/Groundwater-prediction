import { FiCpu } from "react-icons/fi";

function ModelInfoCard() {
    return (
        <div className="card-surface p-6 card-surface-hover">
            <div className="flex items-center gap-2.5 text-blue-600 mb-4">
                <FiCpu className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Model Information
                </h3>
            </div>
            
            <div className="py-2 space-y-4">
                <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                        Prediction Models Used
                    </span>
                    <ul className="space-y-1.5">
                        <li className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                            Random Forest
                        </li>
                        <li className="text-sm font-semibold text-blue-700 flex items-center gap-2 bg-blue-50/50 border border-blue-100/50 px-2 py-1 rounded-lg">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            XGBoost (Selected Model)
                        </li>
                        <li className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                            Linear Regression
                        </li>
                    </ul>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Model Accuracy
                        </span>
                        <span className="text-lg font-bold text-slate-800">
                            95.2%
                        </span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-semibold uppercase">
                        Optimal
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ModelInfoCard;
