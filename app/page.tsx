import { Suspense } from "react";
import Header from "@/components/Header";
import FormularioConfirmacao from "@/components/FormularioConfirmacao";
import Footer from "@/components/Footer";

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
                                <span className="text-primary-dark dark:text-primary text-xs font-bold uppercase tracking-wider">Processo Identificado</span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-text-main dark:text-dark-textMain">
                                Identificamos um direito{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-darker">
                                    a seu favor.
                                </span>
                            </h1>

                            {/* Subheadline */}
                            <p className="text-text-body dark:text-dark-textBody text-lg md:text-xl font-normal leading-relaxed max-w-2xl">
                                Nossa equipe de inteligência jurídica detectou uma oportunidade de restituição em seu nome.
                                Confirme seus dados para que possamos dar andamento ao processo com total segurança.
                            </p>
                        </div>

                        {/* Cards informativos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Card: Dados Protegidos */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-dark-surface/30 border-2 border-primary/20 dark:border-dark-border hover:border-primary/40 dark:hover:border-primary/30 transition-colors shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-surface flex items-center justify-center shrink-0 text-primary">
                                    <span className="material-symbols-outlined">verified_user</span>
                                </div>
                                <div>
                                    <h4 className="text-text-main dark:text-dark-textMain font-bold mb-1">Dados Protegidos</h4>
                                    <p className="text-sm text-text-muted dark:text-dark-textSecondary">Seus dados são criptografados e seguem estritamente a LGPD.</p>
                                </div>
                            </div>

                            {/* Card: Equipe Especializada */}
                            <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-dark-surface/30 border-2 border-primary/20 dark:border-dark-border hover:border-primary/40 dark:hover:border-primary/30 transition-colors shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-surface flex items-center justify-center shrink-0 text-primary">
                                    <span className="material-symbols-outlined">gavel</span>
                                </div>
                                <div>
                                    <h4 className="text-text-main dark:text-dark-textMain font-bold mb-1">Equipe Especializada</h4>
                                    <p className="text-sm text-text-muted dark:text-dark-textSecondary">Advogados com mais de 20 anos de experiência em restituições.</p>
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
                                <p className="text-text-main dark:text-dark-textMain text-sm font-bold">Assessoria Jurídica Ativa</p>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    <span className="text-text-muted dark:text-dark-textSecondary text-xs">4.9/5 de satisfação dos clientes</span>
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
