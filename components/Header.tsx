"use client";
import React from "react";
import ThemeToggle from "./ThemeToggle";
import ConteudoText from "./ConteudoText";

export default function Header() {
    return (
        <header className="w-full glass-effect sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <a
                    href="https://wagnerchaves.adv.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 hover:opacity-80 transition-opacity group"
                >
                    {/* Logos Container */}
                    <div className="relative">
                        {/* Logo Light Mode */}
                        <img
                            src="https://wagnerchaves.adv.br/wp-content/uploads/2023/03/logo.png"
                            alt="Wagner Chaves Advocacia"
                            className="h-10 md:h-12 w-auto object-contain block dark:hidden"
                        />
                        {/* Logo Dark Mode */}
                        <img
                            src="/assets/logo-dark.png"
                            alt="Wagner Chaves Advocacia"
                            className="h-10 md:h-12 w-auto object-contain hidden dark:block"
                        />
                    </div>

                    {/* Text Container */}
                    <div className="flex flex-col">
                        <span className="text-gray-800 dark:text-[#f0c168] text-lg font-bold leading-none tracking-tight">
                            Wagner Chaves
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-widest mt-0.5">
                            Advogados Associados
                        </span>
                    </div>
                </a>

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
