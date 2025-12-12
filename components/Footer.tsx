import React from "react";

export default function Footer() {
    return (
        <footer className="border-t border-surface-border bg-background py-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <span className="material-symbols-outlined text-primary">balance</span>
                        <span className="text-text-main font-bold">Wagner Chaves Advocacia</span>
                    </div>

                    {/* Copyright */}
                    <div className="text-center md:text-right">
                        <p className="text-text-secondary/60 text-xs">© 2024 Wagner Chaves Advocacia. Todos os direitos reservados.</p>
                    </div>
                </div>

                {/* Disclaimer LGPD */}
                <div className="mt-8 pt-8 border-t border-surface-border/50 text-center md:text-left">
                    <p className="text-[10px] text-text-secondary/40 leading-relaxed max-w-4xl">
                        Aviso Legal: As informações contidas neste site têm caráter meramente informativo e não constituem aconselhamento jurídico.
                        O envio de informações através deste formulário não estabelece, por si só, uma relação advogado-cliente.
                        Todos os dados coletados serão tratados em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                    </p>
                </div>
            </div>
        </footer>
    );
}
