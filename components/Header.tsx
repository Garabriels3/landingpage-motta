import React from "react";

export default function Header() {
    return (
        <header className="w-full border-b border-surface-border glass-effect sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo e Nome */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-2xl">balance</span>
                    </div>
                    <div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-tight">Wagner Chaves</h2>
                        <p className="text-text-secondary text-xs font-medium tracking-wide uppercase">Advocacia Especializada</p>
                    </div>
                </div>

                {/* Badge de Segurança */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-dark/50 border border-surface-border rounded-full">
                    <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
                    <span className="text-sm font-semibold text-white tracking-wide">Ambiente Seguro</span>
                </div>
            </div>
        </header>
    );
}
