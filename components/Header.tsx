"use client";
import React from "react";
import ThemeToggle from "./ThemeToggle";
import ConteudoText from "./ConteudoText";

export default function Header() {
    return (
        <header className="w-full glass-effect sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo e Nome */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-2xl">balance</span>
                    </div>
                    <div>
                        <ConteudoText
                            chave="header.logo.nome"
                            fallback="Wagner Chaves"
                            className="text-text-main dark:text-dark-textMain text-lg font-bold leading-tight tracking-tight"
                            as="h2"
                        />
                        <ConteudoText
                            chave="header.logo.subtitulo"
                            fallback="Advocacia Especializada"
                            className="text-text-muted dark:text-dark-textSecondary text-xs font-medium tracking-wide uppercase"
                            as="p"
                        />
                    </div>
                </div>

                {/* Right Side - Badge + Theme Toggle */}
                <div className="flex items-center gap-3">
                    {/* Badge de Segurança */}
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-dark-surface/50 border border-primary/30 dark:border-dark-border rounded-full">
                        <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
                        <ConteudoText
                            chave="header.badge"
                            fallback="Ambiente Seguro"
                            className="text-sm font-semibold text-text-main dark:text-dark-textMain tracking-wide"
                            as="span"
                        />
                    </div>

                    {/* Theme Toggle */}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
