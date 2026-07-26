import { motion } from "framer-motion";

function FeatureCard({ icon, title, description }) {
    return (
        <motion.article
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="card-surface border border-slate-200/80 bg-white p-6"
        >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-brand/10 text-brand shadow-sm">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            <p className="mt-3 text-slate-600 leading-7">{description}</p>
        </motion.article>
    );
}

export default FeatureCard;
