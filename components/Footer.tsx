import React from "react";

export default function Footer() {
    return (
        <footer className="border-t border-primary/30 dark:border-dark-border bg-white/50 dark:bg-dark-bg py-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Logo */}
                    <a
                        href="https://wagnerchaves.adv.br/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:opacity-80 transition-all duration-500"
                    >
                        <img
                            src="https://wagnerchaves.adv.br/wp-content/uploads/2023/03/logo.png"
                            alt="Wagner Chaves Advocacia"
                            className="h-10 w-auto object-contain"
                        />
                    </a>

                    {/* Copyright */}
                    <div className="text-center md:text-right">
                        <p className="text-gray-500 dark:text-dark-textMuted/60 text-xs">© 2024 Wagner Chaves Advocacia. Todos os direitos reservados.</p>
                        <p className="text-gray-500 dark:text-dark-textMuted/60 text-xs mt-1">OAB/RJ 0145662020</p>
                    </div>
                </div>

                {/* Disclaimer LGPD */}
                <div className="mt-8 pt-8 border-t border-primary/20 dark:border-dark-border/50 text-center md:text-left">
                    <p className="text-[11px] text-gray-500 dark:text-dark-textMuted/40 leading-relaxed max-w-4xl">
                        <strong className="text-gray-600 dark:text-dark-textMuted/60">Aviso Legal:</strong> As informações contidas neste site têm caráter meramente informativo e não constituem aconselhamento jurídico.
                        O envio de informações através deste formulário não estabelece, por si só, uma relação advogado-cliente.
                        Todos os dados coletados serão tratados em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                    </p>
                </div>
            </div>
        </footer>
    );
}
