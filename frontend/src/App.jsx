import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Prediction from "./pages/Prediction";
import Navbar from "./components/Navbar";
import { useState } from "react";

function App() {
  const [navLocation, setNavLocation] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState(null);

  const handleDataLoaded = (loc, cond) => {
    setNavLocation(loc);
    setWeatherCondition(cond);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F3F4F6] text-slate-800 flex flex-col justify-between">
        <div>
          {/* Header */}
          <Navbar location={navLocation} weatherCondition={weatherCondition} />
          
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/prediction" element={<Prediction onDataLoaded={handleDataLoaded} />} />
              <Route path="/ai-predictor" element={<Prediction onDataLoaded={handleDataLoaded} />} />
              <Route path="/predictor" element={<Prediction onDataLoaded={handleDataLoaded} />} />
              <Route path="/predict" element={<Prediction onDataLoaded={handleDataLoaded} />} />
              <Route path="*" element={<Prediction onDataLoaded={handleDataLoaded} />} />
            </Routes>
          </main>
        </div>
        
        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-xs font-semibold text-slate-500 text-left">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  About AquaSense AI
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
                  AquaSense AI is developed to monitor groundwater conditions and estimate future groundwater availability using historical groundwater records, rainfall information, weather conditions, and trained Machine Learning models. The application supports groundwater monitoring and assists users in planning water usage more effectively.
                </p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end text-slate-400">
                <a href="#sources" className="hover:text-blue-700 transition-colors">Data Sources</a>
                <a href="#privacy" className="hover:text-blue-700 transition-colors">Privacy Policy</a>
                <a href="#contact" className="hover:text-blue-700 transition-colors">Contact Us</a>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              <span>Last Updated: {new Date().toISOString().slice(0, 10)}</span>
              <span>© {new Date().getFullYear()} AquaSense AI · Groundwater Monitoring and Prediction System</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;