"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Importando Footer para consistência

export default function ConfirmacaoPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [numeroProcesso, setNumeroProcesso] = useState<string | null>(null);

    useEffect(() => {
        const numero = searchParams.get("numero");
        if (!numero) {
            // Se não houver número, redirecionar para home
            router.push("/");
            return;
        }
        setNumeroProcesso(numero);
    }, [searchParams, router]);

    const handleCopiar = () => {
        if (numeroProcesso && numeroProcesso !== "nao-encontrado") {
            navigator.clipboard.writeText(numeroProcesso);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWhatsApp = () => {
        const telefone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";
        const mensagem = numeroProcesso !== "nao-encontrado"
            ? `Olá! Recebi a confirmação do processo ${numeroProcesso} e gostaria de mais informações sobre os próximos passos.`
            : "Olá! Não foi encontrado um processo em meu nome, mas gostaria de conversar sobre meus direitos.";

        const mensagemEncoded = encodeURIComponent(mensagem);

        // Detectar se é mobile para usar deep link
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const url = isMobile
            ? `whatsapp://send?phone=${telefone}&text=${mensagemEncoded}`
            : `https://web.whatsapp.com/send?phone=${telefone}&text=${mensagemEncoded}`;

        window.open(url, "_blank");
    };

    if (!numeroProcesso) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </main>
        );
    }

    const encontrado = numeroProcesso !== "nao-encontrado";

    return (
        <main className="min-h-screen flex flex-col bg-background selection:bg-primary/30 selection:text-primary-darker">
            <Header />

            <section className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full space-y-8 animate-fade-in">
                    {/* Ícone de sucesso */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-primary/20 shadow-lg animate-pulse-slow">
                            <svg
                                className="w-10 h-10 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Título */}
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-text-main">
                            Interesse Confirmado
                        </h1>
                        <p className="text-text-body max-w-lg mx-auto leading-relaxed">
                            {encontrado
                                ? "Recebemos sua solicitação. Identificamos um processo jurídico em seu nome com status ativo. Confira os dados oficiais abaixo."
                                : "Recebemos sua solicitação. Não encontramos um processo ativo no momento, mas nossa equipe pode analisar outras oportunidades."}
                        </p>
                    </div>

                    {/* Card com número do processo ou mensagem */}
                    {encontrado ? (
                        <div className="bg-white p-8 rounded-2xl border border-aux-beige shadow-xl space-y-6 animate-slide-up relative overflow-hidden">
                            {/* Decoração de fundo */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-0 transform translate-x-10 -translate-y-10"></div>

                            <div className="flex items-center gap-2 text-xs font-bold text-text-gold uppercase tracking-wider justify-center md:justify-start">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path
                                        fillRule="evenodd"
                                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>Número do Processo Unificado</span>
                            </div>

                            <div className="bg-background-alt border border-primary/20 rounded-xl p-8 shadow-inner">
                                <p className="text-2xl md:text-3xl font-mono font-bold text-primary-dark text-center tracking-wide select-all">
                                    {numeroProcesso}
                                </p>
                            </div>

                            <button
                                onClick={handleCopiar}
                                className="w-full flex items-center justify-center gap-2 bg-text-main hover:bg-black text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Copiar Número
                                    </>
                                )}
                            </button>

                            <div className="flex items-start gap-2 text-xs text-text-muted justify-center md:justify-start pt-2 border-t border-dashed border-gray-200">
                                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p>
                                    Dados protegidos por sigilo profissional e LGPD.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-2xl border border-aux-beige shadow-lg text-center space-y-4">
                            <p className="text-text-body">
                                Não localizamos um processo ativo neste momento, mas isso não significa que você não tenha direitos a receber.
                            </p>
                            <p className="text-sm text-text-muted">
                                Nossa equipe pode realizar uma análise mais detalhada e identificar outras oportunidades de restituição.
                            </p>
                        </div>
                    )}

                    {/* Instruções de consulta */}
                    {encontrado && (
                        <div className="space-y-4">
                            <h2 className="font-bold text-text-main text-lg border-b border-primary/10 pb-2">
                                Como consultar seu processo:
                            </h2>

                            <div className="space-y-4">
                                {/* Passo 1 */}
                                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-aux-beige">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main mb-1">
                                            Copie o número
                                        </h3>
                                        <p className="text-sm text-text-body">
                                            Utilize o botão "Copiar" no cartão acima para transferir o número para sua área de transferência.
                                        </p>
                                    </div>
                                </div>

                                {/* Passo 2 */}
                                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-aux-beige">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main mb-1">
                                            Acesse o portal de consultas
                                        </h3>
                                        <p className="text-sm text-text-body mb-2">
                                            Recomendamos o site JusBrasil para uma consulta pública simplificada e rápida.
                                        </p>
                                        <a
                                            href="https://www.jusbrasil.com.br"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-bold text-primary-dark hover:text-primary-darker hover:underline"
                                        >
                                            Acessar jusbrasil.com.br
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                {/* Passo 3 */}
                                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-aux-beige">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm">
                                        3
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main mb-1">
                                            Cole na barra de busca
                                        </h3>
                                        <p className="text-sm text-text-body">
                                            No campo de pesquisa do site, cole o número do processo para visualizar as movimentações públicas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA WhatsApp */}
                    <div className="bg-white p-6 rounded-2xl border border-primary/20 shadow-glow space-y-4">
                        <h3 className="font-bold text-text-main text-center text-lg">
                            Precisa de orientação especializada?
                        </h3>
                        <p className="text-sm text-text-body text-center max-w-lg mx-auto">
                            Processos jurídicos podem ser complexos. Nossa equipe já analisou preliminarmente seu caso e pode explicar os próximos passos em uma conversa rápida.
                        </p>

                        <button
                            onClick={handleWhatsApp}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Falar no WhatsApp
                            <span className="text-xs opacity-75 font-normal ml-1 border-l border-white/30 pl-2">Resposta em 5min</span>
                        </button>

                        <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>Advogados Especializados</span>
                            <span>·</span>
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>Atendimento Rápido</span>
                        </div>
                    </div>

                    {/* Botão voltar (opcional) */}
                    <div className="text-center pt-4 mb-8">
                        <button
                            onClick={() => router.push("/")}
                            className="text-sm font-medium text-text-muted hover:text-primary-dark transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            ← Voltar para o início
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
