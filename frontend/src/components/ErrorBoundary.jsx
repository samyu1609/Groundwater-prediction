import React from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("React ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6 text-center">
                    <div className="card-surface p-8 max-w-md w-full flex flex-col items-center bg-white space-y-4 shadow-md rounded-xl">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-full">
                            <FiAlertTriangle className="h-8 w-8" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Interface Error Detected
                        </h2>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            An unexpected view error occurred. Click below to refresh telemetry data.
                        </p>
                        <button
                            onClick={this.handleReload}
                            className="btn-primary px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            Reload Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
