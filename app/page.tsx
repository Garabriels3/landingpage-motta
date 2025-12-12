import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FormularioConfirmacao from "@/components/FormularioConfirmacao";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col bg-background selection:bg-primary/30 selection:text-primary-darker">
            <Header />

            {/* Hero Section */}
            <section className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-16 px-4 md:px-8 py-12 max-w-7xl mx-auto w-full">
                {/* Left Side - Content */}
                <div className="flex-1 space-y-8 animate-fade-in text-center lg:text-left">
                    {/* Badge "Processo Identificado" */}
                    <div className="inline-flex items-center gap-2 bg-[#B8935A] px-5 py-2 rounded-full shadow-md">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Processo Identificado
                        </span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-text-main leading-[1.1] tracking-tight">
                            Identificamos um direito <br className="hidden lg:block" />
                            <span className="text-[#8B6F47] italic">a seu favor.</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-text-body leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                            Nossa equipe de inteligência jurídica detectou uma oportunidade de restituição em seu nome.
                            Confirme seus dados para que possamos dar andamento ao processo com <strong className="font-semibold text-text-main border-b-2 border-primary/40">total segurança</strong>.
                        </p>
                    </div>

                    {/* Cards informativos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                        {/* Card: Dados Protegidos */}
                        <div className="bg-background-paper p-6 rounded-xl border border-aux-border shadow-card hover:border-primary/30 transition-all duration-300">
                            <div className="flex flex-col items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[#F5F1E8] flex items-center justify-center border border-[#D2AC6E]/30">
                                    <svg
                                        className="w-6 h-6 text-[#B8935A]"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-text-main text-lg mb-1 font-serif">Dados Protegidos</h3>
                                    <p className="text-sm text-text-body font-medium leading-snug">
                                        Seus dados são criptografados e seguem estritamente a LGPD.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card: Equipe Especializada */}
                        <div className="bg-background-paper p-6 rounded-xl border border-aux-border shadow-card hover:border-primary/30 transition-all duration-300">
                            <div className="flex flex-col items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[#F5F1E8] flex items-center justify-center border border-[#D2AC6E]/30">
                                    <svg
                                        className="w-6 h-6 text-[#B8935A]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                        />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-text-main text-lg mb-1 font-serif">
                                        Equipe Especializada
                                    </h3>
                                    <p className="text-sm text-text-body font-medium leading-snug">
                                        Advogados com mais de 20 anos de experiência em restituições.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {/* Avatares simples com borda dourada */}
                            <div className="w-10 h-10 rounded-full bg-[#E8DCC8] border-2 border-background-paper flex items-center justify-center text-[10px] font-bold text-[#8B6F47]">WC</div>
                            <div className="w-10 h-10 rounded-full bg-[#D2AC6E] border-2 border-background-paper opacity-80"></div>
                            <div className="w-10 h-10 rounded-full bg-[#B8935A] border-2 border-background-paper opacity-60"></div>
                            <div className="w-10 h-10 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm">
                                +12k
                            </div>
                        </div>
                        <div className="text-sm text-left">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-text-main">Assessoria Jurídica Ativa</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#B8935A] font-bold text-xs">
                                <span>★★★★★</span>
                                <span className="text-text-muted font-normal">4.9/5 de satisfação dos clientes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Formulário */}
                <div className="w-full lg:w-[480px] flex justify-center lg:justify-end">
                    <FormularioConfirmacao />
                </div>
            </section>

            <Footer />
        </main>
    );
}
