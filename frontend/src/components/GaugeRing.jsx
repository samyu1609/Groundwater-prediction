import { motion } from "framer-motion";

function GaugeRing({ value }) {
    const normalized = Math.min(100, Math.max(0, (value / 12) * 100));
    const stroke = 12;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (normalized / 100) * circumference;
    const hue = value > 8 ? 140 : value >= 5 ? 42 : 6;

    return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
            <motion.circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={`hsl(${hue}, 90%, 56%)`}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: offset }}
                initial={{ strokeDashoffset: circumference }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                transform="rotate(-90 100 100)"
            />
            <text x="50%" y="50%" textAnchor="middle" dy="0" className="text-slate-950 text-[1.55rem] font-semibold" fill="#0f172a">
                {value !== null ? value.toFixed(2) : "0.00"}
            </text>
            <text x="50%" y="60%" textAnchor="middle" className="text-slate-500 text-[0.9rem]" fill="#64748b">
                m
            </text>
        </svg>
    );
}

export default GaugeRing;
