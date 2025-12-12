"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { tracking } from "@/lib/tracking";

function ConfirmacaoContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [numeroProcesso, setNumeroProcesso] = useState<string | null>(null);

    useEffect(() => {
        const numero = searchParams.get("numero");
        if (!numero) {
            router.push("/");
            return;
        }
        setNumeroProcesso(numero);
        
        // Track page view
        tracking.pageView("/confirmacao", {
            processo_encontrado: numero !== "nao-encontrado",
        });
    }, [searchParams, router]);

    const handleCopiar = () => {
        if (numeroProcesso && numeroProcesso !== "nao-encontrado") {
            navigator.clipboard.writeText(numeroProcesso);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            
            // Track copy action
            tracking.copyProcessoNumber(numeroProcesso);
        }
    };

    const handleWhatsApp = () => {
        const telefone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
        const mensagem = numeroProcesso !== "nao-encontrado"
            ? `Olá! Recebi a confirmação do processo ${numeroProcesso} e gostaria de mais informações sobre os próximos passos.`
            : "Olá! Não foi encontrado um processo em meu nome, mas gostaria de conversar sobre meus direitos.";

        const mensagemEncoded = encodeURIComponent(mensagem);
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const url = isMobile
            ? `whatsapp://send?phone=${telefone}&text=${mensagemEncoded}`
            : `https://web.whatsapp.com/send?phone=${telefone}&text=${mensagemEncoded}`;

        window.open(url, "_blank");
        
        // Track WhatsApp click
        tracking.whatsappClicked(undefined, {
            processo_encontrado: numeroProcesso !== "nao-encontrado",
            numero_processo: numeroProcesso !== "nao-encontrado" ? numeroProcesso : null,
        });
    };

    if (!numeroProcesso) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-bg">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </main>
        );
    }

    const encontrado = numeroProcesso !== "nao-encontrado";

    return (
        <main className="min-h-screen flex flex-col bg-background dark:bg-dark-bg selection:bg-primary/30 selection:text-primary-darker">
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 dark:bg-dark-surface/40 rounded-full blur-[100px]"></div>
            </div>

            <Header />

            <section className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full space-y-8 animate-fade-in">
                    {/* Ícone de sucesso */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-dark-surface flex items-center justify-center border-4 border-primary dark:border-primary/20 shadow-lg animate-pulse-slow">
                            <span className="material-symbols-outlined text-primary-darker dark:text-primary text-4xl">check_circle</span>
                        </div>
                    </div>

                    {/* Título */}
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-text-main dark:text-dark-textMain">
                            Interesse Confirmado
                        </h1>
                        <p className="text-gray-600 dark:text-dark-textSecondary max-w-lg mx-auto leading-relaxed">
                            {encontrado
                                ? "Recebemos sua solicitação. Identificamos um processo jurídico em seu nome com status ativo. Confira os dados oficiais abaixo."
                                : "Recebemos sua solicitação. Não encontramos um processo ativo no momento, mas nossa equipe pode analisar outras oportunidades."}
                        </p>
                    </div>

                    {/* Card com número do processo */}
                    {encontrado ? (
                        <div className="bg-white dark:bg-dark-paper p-8 rounded-3xl border-2 border-primary dark:border-dark-border shadow-2xl space-y-6 animate-slide-up relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider justify-center">
                                <span className="material-symbols-outlined text-lg">description</span>
                                <span>Número do Processo Unificado</span>
                            </div>

                            <div className="bg-background dark:bg-dark-bgAlt border-2 border-primary/30 dark:border-dark-border rounded-xl p-8 shadow-inner">
                                <p className="text-2xl md:text-3xl font-mono font-bold text-primary text-center tracking-wide select-all">
                                    {numeroProcesso}
                                </p>
                            </div>

                            <button
                                onClick={handleCopiar}
                                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-background font-bold py-3 px-4 rounded-full transition-all duration-300 shadow-glow hover:shadow-glow-lg"
                            >
                                {copied ? (
                                    <>
                                        <span className="material-symbols-outlined">check</span>
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">content_copy</span>
                                        Copiar Número
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-dark-textMuted pt-2 border-t border-dashed border-primary/20 dark:border-dark-border">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                <p>Dados protegidos por sigilo profissional e LGPD.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-paper p-8 rounded-3xl border-2 border-primary dark:border-dark-border shadow-lg text-center space-y-4">
                            <p className="text-gray-700 dark:text-dark-textBody">
                                Não localizamos um processo ativo neste momento, mas isso não significa que você não tenha direitos a receber.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-dark-textMuted">
                                Nossa equipe pode realizar uma análise mais detalhada e identificar outras oportunidades de restituição.
                            </p>
                        </div>
                    )}

                    {/* Instruções de consulta */}
                    {encontrado && (
                        <div className="space-y-4">
                            <h2 className="font-bold text-text-main dark:text-dark-textMain text-lg border-b border-primary/30 dark:border-dark-border pb-2">
                                Como consultar seu processo:
                            </h2>

                            <div className="space-y-4">
                                {[
                                    { num: 1, title: "Copie o número", desc: "Utilize o botão \"Copiar\" no cartão acima." },
                                    { num: 2, title: "Acesse o portal de consultas", desc: "Recomendamos o site JusBrasil.", link: "https://www.jusbrasil.com.br" },
                                    { num: 3, title: "Cole na barra de busca", desc: "No campo de pesquisa, cole o número para visualizar as movimentações." },
                                ].map((step) => (
                                    <div key={step.num} className="flex items-start gap-4 p-4 bg-white dark:bg-dark-surface/50 rounded-2xl border-2 border-primary/20 dark:border-dark-border">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm">
                                            {step.num}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-main dark:text-dark-textMain mb-1">{step.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-dark-textSecondary">{step.desc}</p>
                                            {step.link && (
                                                <a
                                                    href={step.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-light hover:underline mt-1"
                                                >
                                                    Acessar jusbrasil.com.br
                                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA WhatsApp */}
                    <div className="bg-white dark:bg-dark-paper p-6 rounded-3xl border-2 border-primary dark:border-dark-border shadow-glow space-y-4">
                        <h3 className="font-bold text-text-main dark:text-dark-textMain text-center text-lg">
                            Precisa de orientação especializada?
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-dark-textSecondary text-center max-w-lg mx-auto">
                            Nossa equipe já analisou seu caso e pode explicar os próximos passos.
                        </p>

                        <button
                            onClick={handleWhatsApp}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Falar no WhatsApp
                            <span className="text-xs opacity-75 font-normal ml-1 border-l border-white/30 pl-2">Resposta em 5min</span>
                        </button>

                        <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-primary text-sm">verified</span>
                                Advogados Especializados
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                                Atendimento Rápido
                            </span>
                        </div>
                    </div>

                    {/* Botão voltar */}
                    <div className="text-center pt-4 mb-8">
                        <button
                            onClick={() => router.push("/")}
                            className="text-sm font-medium text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Voltar para o início
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

export default function ConfirmacaoPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </main>
        }>
            <ConfirmacaoContent />
        </Suspense>
    );
}
