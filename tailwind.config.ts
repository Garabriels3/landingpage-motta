import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class', // Habilitar dark mode via classe
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Cores Principais (Dourado) - Mantidas em ambos os modos
                primary: {
                    DEFAULT: "#D2AC6E", // Dourado principal
                    dark: "#B8935A",    // Dourado médio/escuro
                    darker: "#8B6F47",  // Dourado mais escuro
                    light: "#E8C88A",   // Dourado claro
                },

                // ============================================
                // LIGHT MODE (padrão)
                // ============================================
                background: {
                    DEFAULT: "#F5F1E8", // Bege quente
                    alt: "#FFFFFF",     // Branco (inputs)
                    paper: "#FFFFFF",   // Branco (cards)
                },
                surface: {
                    dark: "#F0EBE1",    // Bege mais escuro
                    border: "#D2AC6E",  // Borda dourada (destaque)
                },
                text: {
                    main: "#1A1A1A",    // Preto suave
                    body: "#333333",    // Cinza escuro
                    muted: "#666666",   // Cinza médio
                    secondary: "#555555", // Secundário
                    accent: "#8B6F47",  // Dourado escuro
                },
                input: {
                    border: "#D2AC6E",      // Borda dourada
                    borderHover: "#B8935A", // Hover
                    borderFocus: "#8B6F47", // Focus
                },

                // ============================================
                // DARK MODE (via classes dark:)
                // Cores específicas para dark mode
                // ============================================
                dark: {
                    bg: "#1A1612",           // Fundo escuro
                    bgAlt: "#241E18",        // Inputs
                    paper: "#2A231C",        // Cards
                    surface: "#2A231C",      // Superfície
                    border: "#3D3429",       // Bordas
                    textMain: "#FFFFFF",     // Texto principal
                    textBody: "#E8DED0",     // Corpo
                    textMuted: "#A89A85",    // Muted
                    textSecondary: "#C4B59A", // Secundário
                },

                // Cores do Botão (iguais em ambos)
                button: {
                    bg: "#D2AC6E",
                    bgHover: "#B8935A",
                    textLight: "#1A1612",  // Texto escuro para light mode
                    textDark: "#1A1612",   // Texto escuro para dark mode também (botão dourado)
                },

                // Cores do Box/Card do Formulário
                formBox: {
                    border: "#D2AC6E",      // Borda dourada em ambos
                    bgLight: "#FFFFFF",     // Fundo light
                    bgDark: "#2A231C",      // Fundo dark
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
                "card": "0 4px 20px -2px rgba(0, 0, 0, 0.1)",
                "card-dark": "0 4px 20px -2px rgba(0, 0, 0, 0.3)",
                "input": "0 2px 4px 0 rgba(0, 0, 0, 0.05)",
            }
        },
    },
    plugins: [],
};
export default config;
