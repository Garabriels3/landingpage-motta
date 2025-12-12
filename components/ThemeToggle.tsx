"use client";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Verificar preferência salva ou do sistema
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (savedTheme === "light" || (!savedTheme && !prefersDark)) {
            setIsDark(false);
            document.documentElement.classList.remove("dark");
        } else {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);

        if (newIsDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    // Evitar flash durante hydration
    if (!mounted) {
        return (
            <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">dark_mode</span>
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-300 border border-primary/20"
            aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            title={isDark ? "Modo Claro" : "Modo Escuro"}
        >
            <span
                className="material-symbols-outlined text-primary text-xl transition-transform duration-300"
                style={{ fontVariationSettings: "'FILL' 1" }}
            >
                {isDark ? "light_mode" : "dark_mode"}
            </span>
        </button>
    );
}
