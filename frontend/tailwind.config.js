module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                brand: "#2563EB",
                cyan: "#06B6D4",
                surface: "#F8FAFC",
                ink: "#0F172A",
                lead: "#475569"
            },
            boxShadow: {
                glow: "0 24px 80px rgba(37, 99, 235, 0.12)",
                soft: "0 18px 50px rgba(15, 23, 42, 0.08)"
            },
            backgroundImage: {
                "hero-glow": "radial-gradient(circle at top left, rgba(37, 99, 235, 0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.10), transparent 32%)"
            }
        }
    },
    plugins: []
}
