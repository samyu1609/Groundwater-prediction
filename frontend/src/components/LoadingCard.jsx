import { useState, useEffect } from "react";

const messages = [
    "Detecting location...",
    "Collecting climate data...",
    "Running trained machine learning model...",
    "Generating groundwater prediction..."
];

function LoadingCard() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    const progress = ((step + 1) / messages.length) * 100;

    return (
        <div className="card-surface p-8 max-w-lg w-full mx-auto text-center flex flex-col items-center justify-center">
            {/* Minimalist Spinner */}
            <div className="relative mb-6">
                <div className="h-12 w-12 rounded-full border-[3px] border-slate-100 border-t-blue-600 animate-spin"></div>
            </div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
                Running Analysis
            </p>
            
            <h3 className="text-lg font-medium text-slate-800 transition-all duration-300 min-h-[1.75rem]">
                {messages[step]}
            </h3>

            {/* Animated Progress Indicator */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-6">
                <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            
            <span className="text-xs text-slate-400 mt-2 font-medium">
                {Math.round(progress)}% Complete
            </span>
        </div>
    );
}

export default LoadingCard;
