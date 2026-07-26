import { motion } from "framer-motion";

function LoadingScreen({ message }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-6">
            <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/95 p-8 text-center shadow-glow backdrop-blur-xl">
                <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
                <p className="text-xl font-semibold text-slate-950">{message}</p>
                <p className="mt-4 text-sm text-slate-600">Your groundwater prediction is being prepared using location and weather insights.</p>
            </div>
        </motion.div>
    );
}

export default LoadingScreen;
