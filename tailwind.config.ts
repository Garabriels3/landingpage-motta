import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Cores Principais (Dourado)
                primary: {
                    DEFAULT: "#D2AC6E", // Dourado principal
                    dark: "#B8935A",    // Dourado médio/escuro
                    darker: "#8B6F47",  // Dourado mais escuro
                    light: "#E8C88A",   // Dourado claro
                },
                // Cores de Fundo - Design Minimalista
                background: {
                    DEFAULT: "#FAF8F5", // Creme muito claro (fundo principal) - Minimalista
                    alt: "#FFFFFF",     // Branco puro (fundo inputs)
                    paper: "#FFFFFF",   // Branco puro (cards)
                },
                // Cores de Texto
                text: {
                    main: "#1A1A1A",    // Preto suave (títulos)
                    body: "#2A2A2A",    // Cinza muito escuro (corpo)
                    muted: "#6B6B6B",   // Cinza médio suave
                    gold: "#7A6342",    // Dourado escuro para textos secundários
                },
                // Auxiliares
                aux: {
                    beige: "#E8DCC8",   // Tom bege claro
                    border: "#E5E5E5",  // Borda suave e minimalista
                },
                // Legacy support
                "accent-green": "#D2AC6E",
            },
            fontFamily: {
                sans: ["var(--font-inter)"],
                serif: ["var(--font-merriweather)"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
            boxShadow: {
                "glow": "0 0 20px -5px rgba(210, 172, 110, 0.3)",
                "card": "0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 1px 3px -1px rgba(0, 0, 0, 0.04)",
                "input": "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
            }
        },
    },
    plugins: [],
};
export default config;
