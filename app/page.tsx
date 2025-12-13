import { Suspense } from "react";
import Header from "@/components/Header";
import FormularioConfirmacao from "@/components/FormularioConfirmacao";
import Footer from "@/components/Footer";
import PageViewTracker from "@/components/PageViewTracker";
import ConteudoText from "@/components/ConteudoText";

function FormLoading() {
    return (
        <div className="bg-white dark:bg-dark-paper border-2 border-primary/30 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-card dark:shadow-card-dark flex items-center justify-center min-h-[400px]">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
    );
}

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <PageViewTracker pagina="/" />
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 dark:bg-dark-surface/40 rounded-full blur-[100px]"></div>
            </div>

            <Header />

            <main className="flex-grow flex items-center justify-center py-12 px-6">
                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Side - Content */}
                    <div className="lg:col-span-7 flex flex-col gap-8 animate-fade-in">

                        {/* Badge "Processo Identificado" */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full w-fit">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                <ConteudoText
                                    chave="homepage.badge"
                                    fallback="Processo Identificado"
                                    className="text-primary-dark dark:text-primary text-xs font-bold uppercase tracking-wider"
                                />
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-primary-darker dark:text-primary animate-pulse-slow">
                                <ConteudoText
                                    chave="homepage.headline"
                                    fallback="Identificamos um direito a seu favor."
                                    as="span"
                                />
                            </h1>

                            {/* Subheadline */}
                            <ConteudoText
                                chave="homepage.subheadline"
                                fallback="Nossa equipe de inteligência jurídica detectou uma oportunidade de restituição em seu nome. Confirme seus dados para que possamos dar andamento ao processo com total segurança."
                                className="text-gray-600 dark:text-dark-textBody text-lg md:text-xl font-normal leading-relaxed max-w-2xl"
                                as="p"
                            />
                        </div>

                        {/* Cards informativos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Card: Dados Protegidos */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-dark-surface/30 border-2 border-primary dark:border-dark-border hover:border-primary-dark dark:hover:border-primary/30 transition-colors shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-surface flex items-center justify-center shrink-0 text-primary">
                                    <span className="material-symbols-outlined">verified_user</span>
                                </div>
                                <div>
                                    <ConteudoText
                                        chave="homepage.card1.titulo"
                                        fallback="Dados Protegidos"
                                        className="text-text-main dark:text-dark-textMain font-bold mb-1"
                                        as="h4"
                                    />
                                    <ConteudoText
                                        chave="homepage.card1.texto"
                                        fallback="Seus dados são criptografados e seguem estritamente a LGPD."
                                        className="text-sm text-gray-600 dark:text-dark-textSecondary"
                                        as="p"
                                    />
                                </div>
                            </div>

                            {/* Card: Equipe Especializada */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-dark-surface/30 border-2 border-primary dark:border-dark-border hover:border-primary-dark dark:hover:border-primary/30 transition-colors shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-surface flex items-center justify-center shrink-0 text-primary">
                                    <span className="material-symbols-outlined">gavel</span>
                                </div>
                                <div>
                                    <ConteudoText
                                        chave="homepage.card2.titulo"
                                        fallback="Equipe Especializada"
                                        className="text-text-main dark:text-dark-textMain font-bold mb-1"
                                        as="h4"
                                    />
                                    <ConteudoText
                                        chave="homepage.card2.texto"
                                        fallback="Advogados com mais de 20 anos de experiência em restituições."
                                        className="text-sm text-gray-600 dark:text-dark-textSecondary"
                                        as="p"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center gap-6 mt-4 pt-6 border-t border-primary/20 dark:border-dark-border">
                            <div className="flex -space-x-3">
                                {/* Avatares com iniciais */}
                                <div className="w-10 h-10 rounded-full border-2 border-background dark:border-dark-bg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-[10px] font-bold text-white">JM</div>
                                <div className="w-10 h-10 rounded-full border-2 border-background dark:border-dark-bg bg-gradient-to-br from-primary-dark to-primary-darker flex items-center justify-center text-[10px] font-bold text-white">RS</div>
                                <div className="w-10 h-10 rounded-full border-2 border-background dark:border-dark-bg bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-[10px] font-bold text-white">AL</div>
                                <div className="w-10 h-10 rounded-full border-2 border-background dark:border-dark-bg bg-primary/20 dark:bg-dark-surface flex items-center justify-center text-xs font-bold text-primary-dark dark:text-white">+12</div>
                            </div>
                            <div>
                                <ConteudoText
                                    chave="homepage.social.titulo"
                                    fallback="Assessoria Jurídica Ativa"
                                    className="text-text-main dark:text-dark-textMain text-sm font-bold"
                                    as="p"
                                />
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <ConteudoText
                                        chave="homepage.social.avaliacao"
                                        fallback="4.9/5 de satisfação dos clientes"
                                        className="text-gray-600 dark:text-dark-textSecondary text-xs"
                                        as="span"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="lg:col-span-5 animate-slide-up">
                        <Suspense fallback={<FormLoading />}>
                            <FormularioConfirmacao />
                        </Suspense>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
