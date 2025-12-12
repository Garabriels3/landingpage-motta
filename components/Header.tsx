import React from "react";

export default function Header() {
    return (
        <header className="w-full py-6 px-4 md:px-8 flex justify-between items-center max-w-7xl mx-auto">
            {/* Logo e Nome */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    {/* Ícone de Balança Dourada */}
                    <svg
                        className="w-6 h-6 text-primary-dark"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                        />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-text-main leading-tight">
                        Wagner Chaves
                    </h1>
                    <span className="text-[10px] md:text-xs text-text-gold uppercase tracking-[0.2em] font-medium">
                        Advocacia Especializada
                    </span>
                </div>
            </div>

            {/* Badge de Segurança */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-paper/50 border border-aux-border shadow-sm text-text-gold">
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wide">
                    Ambiente Seguro
                </span>
            </div>
        </header>
    );
}
