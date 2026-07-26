import { AnimatePresence, motion } from "framer-motion";

function Toast({ alert, onClose }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-glow"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-950">{alert.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                        ×
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default Toast;
