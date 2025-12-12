import React from "react";

export default function Footer() {
    return (
        <footer className="w-full mt-auto py-8 px-4 md:px-8 border-t border-aux-border bg-background-paper/30">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Logo e nome */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg text-text-main">Wagner Chaves</span>
                    </div>

                    {/* Info OAB e Copyright */}
                    <div className="text-sm text-text-body space-y-1 md:text-right">
                        <p className="font-medium text-text-main">OAB/SP 123.456</p>
                        <p>© 2024 Wagner Chaves Advocacia. Todos os direitos reservados.</p>
                    </div>
                </div>

                <div className="h-px w-full bg-aux-border my-6"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Links legais */}
                    <div className="flex gap-4 text-xs font-medium text-text-gold">
                        <a href="#termos" className="hover:text-primary-dark transition-colors">Termos de Uso</a>
                        <a href="#privacidade" className="hover:text-primary-dark transition-colors">Privacidade</a>
                    </div>

                    {/* Disclaimer LGPD */}
                    <div className="max-w-2xl text-[10px] text-text-muted leading-relaxed text-justify md:text-right">
                        <p>
                            As informações contidas neste site têm caráter meramente informativo. O envio de informações não estabelece relação advogado-cliente. Todos os dados coletados serão tratados em conformidade com a LGPD e armazenados com segurança.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
