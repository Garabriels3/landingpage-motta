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
                // Cores de Fundo - DARK THEME (Inspirado na referência)
                background: {
                    DEFAULT: "#1A1612", // Fundo escuro marrom
                    light: "#F5F1E8",   // Fundo claro (alternativo)
                    alt: "#241E18",     // Fundo alternativo (inputs)
                    paper: "#2A231C",   // Cards
                },
                // Cores de Superfície
                surface: {
                    dark: "#2A231C",    // Superfície escura
                    border: "#3D3429",  // Borda de superfície
                },
                // Cores de Texto - DARK THEME
                text: {
                    main: "#FFFFFF",    // Branco (títulos)
                    body: "#E8DED0",    // Bege claro (corpo)
                    muted: "#A89A85",   // Bege médio (placeholders)
                    secondary: "#C4B59A", // Secundário
                    accent: "#D2AC6E",  // Dourado para destaques
                },
                // Cores de Input e Formulário
                input: {
                    border: "#D2AC6E",      // Borda dourada para inputs
                    borderHover: "#B8935A", // Borda dourada hover
                    borderFocus: "#E8C88A", // Borda dourada focus (mais clara)
                },
                // Cores do Botão
                button: {
                    bg: "#D2AC6E",          // Fundo do botão (dourado)
                    bgHover: "#E8C88A",     // Hover do botão (mais claro)
                    text: "#1A1612",        // Texto do botão (escuro)
                },
                // Cores do Box/Card do Formulário
                formBox: {
                    border: "#3D3429",      // Borda do box
                    bg: "#2A231C",          // Fundo do box
                },
            },
            fontFamily: {
                display: ["Spline Sans", "system-ui", "sans-serif"],
                sans: ["Spline Sans", "system-ui", "sans-serif"],
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem",
                "4xl": "2rem",
                "5xl": "3rem",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "gradient-gold": "linear-gradient(to right, #D2AC6E, #8B6F47)",
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
                "glow": "0 0 20px rgba(210, 172, 110, 0.3)",
                "glow-lg": "0 0 30px rgba(210, 172, 110, 0.4)",
                "card": "0 4px 20px -2px rgba(0, 0, 0, 0.3)",
                "input": "0 2px 4px 0 rgba(0, 0, 0, 0.2)",
            }
        },
    },
    plugins: [],
};
export default config;
