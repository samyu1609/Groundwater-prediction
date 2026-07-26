function Footer() {
    return (
        <footer className="border-t border-white/30 bg-white/80 py-12 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="space-y-3">
                        <p className="text-lg font-semibold text-slate-950">AquaSense AI</p>
                        <p className="text-sm leading-6 text-slate-600">A trusted groundwater intelligence platform for government and water resource teams.</p>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">Navigate</p>
                        <a href="#" className="block hover:text-water">Dashboard</a>
                        <a href="/prediction" className="block hover:text-water">Prediction</a>
                        <a href="#model" className="block hover:text-water">About</a>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">Contact</p>
                        <p>info@aquasense.ai</p>
                        <p>Smart India Hackathon Ready</p>
                    </div>
                </div>
                <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
                    © 2026 AquaSense AI. Built for responsible groundwater forecasting and sustainable resource planning.
                </div>
            </div>
        </footer>
    );
}

export default Footer;