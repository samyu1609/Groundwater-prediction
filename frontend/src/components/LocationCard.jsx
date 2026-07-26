import { FiMapPin } from "react-icons/fi";

function LocationCard({ latitude, longitude }) {
    const currentDate = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    return (
        <div className="card-surface p-6 card-surface-hover">
            <div className="flex items-center gap-2.5 text-blue-600 mb-4">
                <FiMapPin className="h-5 w-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Current Location
                </h3>
            </div>
            <div className="space-y-4">
                <div>
                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                        Latitude
                    </span>
                    <span className="text-lg font-semibold text-slate-800">
                        {latitude !== null && latitude !== undefined ? latitude.toFixed(5) : "Detecting..."}
                    </span>
                </div>
                <div>
                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                        Longitude
                    </span>
                    <span className="text-lg font-semibold text-slate-800">
                        {longitude !== null && longitude !== undefined ? longitude.toFixed(5) : "Detecting..."}
                    </span>
                </div>
                <div>
                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                        Current Date
                    </span>
                    <span className="text-lg font-semibold text-slate-800">
                        {currentDate}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default LocationCard;
