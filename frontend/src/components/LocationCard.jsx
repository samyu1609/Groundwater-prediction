import { FiMapPin } from "react-icons/fi";

function LocationCard({ latitude, longitude, location }) {
    const currentDate = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    const state = location?.state ?? "Tamil Nadu";
    const district = location?.district ?? "Coimbatore";

    const latStr = typeof latitude === "number" && !isNaN(latitude) ? `${latitude.toFixed(5)}° N` : "Detecting...";
    const lngStr = typeof longitude === "number" && !isNaN(longitude) ? `${longitude.toFixed(5)}° E` : "Detecting...";

    return (
        <div className="card-surface p-6 card-surface-hover text-left">
            <div className="flex items-center gap-2.5 text-[#0F4C81] mb-4">
                <FiMapPin className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Current Location
                </h3>
            </div>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 pb-2 border-b border-slate-100">
                    <div>
                        <span className="text-[10px] text-slate-400 block uppercase">State</span>
                        <span className="text-slate-800">{state}</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-400 block uppercase">District</span>
                        <span className="text-slate-800">{district}</span>
                    </div>
                </div>
                <div>
                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                        Latitude
                    </span>
                    <span className="text-lg font-semibold text-slate-800">
                        {latStr}
                    </span>
                </div>
                <div>
                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                        Longitude
                    </span>
                    <span className="text-lg font-semibold text-slate-800">
                        {lngStr}
                    </span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                        Current Date
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                        {currentDate}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default LocationCard;
