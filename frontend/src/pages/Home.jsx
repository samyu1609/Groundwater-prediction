import { Link } from "react-router-dom";
import { FiTrendingDown } from "react-icons/fi";

function Home() {
    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#F3F4F6] px-6 text-center">
            <div className="max-w-2xl flex flex-col items-center card-surface bg-white p-12">
                {/* Brand Logo */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0F4C81] text-white shadow-sm mb-6">
                    <FiTrendingDown className="h-8 w-8" />
                </div>
                
                {/* Name */}
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
                    AquaSense AI
                </h1>
                
                {/* Subtitle */}
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">
                    Groundwater Monitoring and Prediction System
                </p>
                
                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed mb-10 max-w-lg">
                    Monitor groundwater conditions, view prediction results, analyze historical trends, and receive recommended actions for efficient water resource management.
                </p>
                
                {/* Start Button */}
                <Link 
                    to="/prediction" 
                    className="btn-primary px-8 py-3 text-sm rounded-lg font-bold shadow-sm transition-transform duration-150 active:scale-[0.98]"
                >
                    Launch Dashboard
                </Link>
            </div>
        </div>
    );
}

export default Home;
