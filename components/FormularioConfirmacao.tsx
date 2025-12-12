"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { validarCPF, limparCPF } from "@/lib/validations";
import LegalModal from "./LegalModal";

declare global {
    interface Window { hcaptcha: unknown; onHcaptchaSuccess: (token: string) => void; }
}

export default function FormularioConfirmacao() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({ nome: "", cpf: "", email: "", aceitouTermos: false });
    const [errors, setErrors] = useState<{ nome?: string; cpf?: string; email?: string; termos?: string; geral?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [modalType, setModalType] = useState<"termos" | "privacidade" | null>(null);

    // Capturar parâmetro de campanha da URL (ex: ?campaign=novembro-2025)
    const campaign = searchParams.get("campaign") || null;

    useEffect(() => {
        // Detectar tema atual
        const checkTheme = () => {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
        };
        checkTheme();

        // Observer para mudanças no tema
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        const script = document.createElement("script");
        script.src = "https://hcaptcha.com/1/api.js";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        window.onHcaptchaSuccess = (token: string) => setHcaptchaToken(token);
        return () => {
            document.head.removeChild(script);
            observer.disconnect();
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name as keyof typeof errors]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        value = value.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        setFormData(prev => ({ ...prev, cpf: value }));

        // Validar CPF em tempo real quando tiver 11 dígitos
        const cpfLimpo = limparCPF(value);
        if (cpfLimpo.length === 11) {
            if (!validarCPF(cpfLimpo)) {
                setErrors(prev => ({ ...prev, cpf: "CPF inválido. Verifique os números digitados." }));
            } else {
                setErrors(prev => ({ ...prev, cpf: undefined }));
            }
        } else {
            // Limpar erro se ainda está digitando
            if (errors.cpf) setErrors(prev => ({ ...prev, cpf: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: typeof errors = {};
        if (!formData.nome.trim() || formData.nome.trim().length < 3) newErrors.nome = "Nome inválido (mínimo 3 caracteres)";

        // Validação completa de CPF com algoritmo verificador
        const cpfLimpo = limparCPF(formData.cpf);
        if (!validarCPF(cpfLimpo)) {
            newErrors.cpf = "CPF inválido. Verifique os números digitados.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) newErrors.email = "E-mail inválido";
        if (!formData.aceitouTermos) newErrors.termos = "Você precisa aceitar os termos";
        if (!hcaptchaToken) newErrors.geral = "Complete a verificação de segurança (captcha)";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Verifica se todos os campos estão preenchidos corretamente para habilitar o botão
    const isFormValid = () => {
        const nomeValido = formData.nome.trim().length >= 3;
        const cpfLimpo = limparCPF(formData.cpf);
        const cpfValido = validarCPF(cpfLimpo);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValido = emailRegex.test(formData.email);
        const termosAceitos = formData.aceitouTermos;
        const captchaFeito = !!hcaptchaToken;

        return nomeValido && cpfValido && emailValido && termosAceitos && captchaFeito;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    hcaptchaToken,
                    campaign: campaign || process.env.NEXT_PUBLIC_CAMPAIGN_NAME || "direct"
                }),
            });
            const data = await response.json();
            if (response.ok) {
                // Passar o número do processo na URL (ou "nao-encontrado" se não houver)
                const numeroProcesso = data.numero_processo || "nao-encontrado";
                router.push(`/confirmacao?numero=${encodeURIComponent(numeroProcesso)}`);
            } else {
                setErrors({ geral: data.error || "Erro ao processar" });
            }
        } catch {
            setErrors({ geral: "Erro de conexão" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Estilos de input - bordas douradas mais fortes no light mode
    const inputBaseClass = `w-full h-14 pl-12 pr-4 rounded-xl focus:ring-2 focus:outline-none transition-all
        bg-white dark:bg-dark-bgAlt 
        text-text-main dark:text-dark-textMain 
        placeholder:text-gray-500 dark:placeholder:text-dark-textMuted/50`;

    const inputBorderClass = (hasError: boolean) => hasError
        ? "border-2 border-red-500 focus:border-red-500 focus:ring-red-500/20"
        : "border-2 border-primary dark:border-dark-border focus:border-primary-dark dark:focus:border-primary focus:ring-primary/20";

    return (
        <div className="bg-white dark:bg-dark-paper border-2 border-primary dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-card dark:shadow-card-dark relative overflow-hidden group">
            {/* Linha gradiente no topo */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30"></div>

            <div className="mb-8">
                <h3 className="text-2xl font-bold text-text-main dark:text-dark-textMain mb-2">Confirmação de Interesse</h3>
                <p className="text-gray-600 dark:text-dark-textSecondary text-sm">Preencha o formulário abaixo para validar seu direito.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Nome */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main dark:text-dark-textMain ml-1">Nome Completo</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-primary-darker dark:text-dark-textMuted">person</span>
                        </div>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className={`${inputBaseClass} ${inputBorderClass(!!errors.nome)}`}
                            placeholder="Digite seu nome completo"
                        />
                    </div>
                    {errors.nome && (
                        <p className="text-xs text-red-500 ml-1 mt-1">{errors.nome}</p>
                    )}
                </div>

                {/* CPF */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main dark:text-dark-textMain ml-1">CPF</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-primary-darker dark:text-dark-textMuted">id_card</span>
                        </div>
                        <input
                            type="text"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleCpfChange}
                            maxLength={14}
                            className={`${inputBaseClass} ${inputBorderClass(!!errors.cpf)}`}
                            placeholder="000.000.000-00"
                        />
                    </div>
                    {errors.cpf && (
                        <p className="text-xs text-red-500 ml-1 mt-1">{errors.cpf}</p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-main dark:text-dark-textMain ml-1">E-mail para contato</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-primary-darker dark:text-dark-textMuted">mail</span>
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`${inputBaseClass} ${inputBorderClass(!!errors.email)}`}
                            placeholder="seu@email.com"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-xs text-red-500 ml-1 mt-1">{errors.email}</p>
                    )}
                </div>

                {/* hCaptcha - tema dinâmico */}
                <div className="flex justify-start min-h-[78px]">
                    {process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ? (
                        <div
                            className="h-captcha"
                            data-sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY}
                            data-callback="onHcaptchaSuccess"
                            data-theme={isDarkMode ? "dark" : "light"}
                            key={isDarkMode ? "dark" : "light"} // Força re-render ao trocar tema
                        ></div>
                    ) : <p className="text-xs text-red-500 bg-red-100 dark:bg-red-900/20 p-2 rounded w-full text-center border border-red-300 dark:border-red-500/30">Configurar SITEKEY</p>}
                </div>

                <label className="flex items-start gap-3 mt-2 cursor-pointer group/check">
                    <div className="relative flex items-center">
                        <input
                            id="termos"
                            name="aceitouTermos"
                            type="checkbox"
                            checked={formData.aceitouTermos}
                            onChange={handleChange}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-primary dark:border-dark-border bg-white dark:bg-dark-bgAlt checked:border-primary checked:bg-primary transition-all"
                        />
                        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] text-white opacity-0 peer-checked:opacity-100 transition-opacity font-bold">check</span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-dark-textSecondary leading-normal pt-0.5">
                        Declaro que li e aceito os{" "}
                        <button type="button" onClick={() => setModalType("termos")} className="text-primary-dark dark:text-primary hover:underline font-medium">Termos de Uso</button>
                        {" "}e a{" "}
                        <button type="button" onClick={() => setModalType("privacidade")} className="text-primary-dark dark:text-primary hover:underline font-medium">Política de Privacidade</button>.
                    </span>
                </label>
                {errors.termos && (
                    <p className="text-xs text-red-500 ml-1">{errors.termos}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid()}
                    className={`mt-4 w-full h-14 text-base font-bold rounded-full transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                        ${isSubmitting || !isFormValid()
                            ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                            : "bg-primary hover:bg-primary-dark text-white shadow-glow hover:shadow-glow-lg"}`}
                >
                    {isSubmitting ? "Processando..." : (
                        <>
                            Confirmar Interesse
                            <span className="material-symbols-outlined text-xl font-bold">arrow_forward</span>
                        </>
                    )}
                </button>

                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-500 dark:text-dark-textMuted/50 uppercase tracking-widest">Conexão Segura 256-bit SSL</p>
                </div>

                {errors.geral && <div className="text-center text-red-600 dark:text-red-500 text-sm font-bold bg-red-100 dark:bg-red-900/20 p-2 rounded border border-red-300 dark:border-red-500/30">{errors.geral}</div>}
            </form>

            {/* Modal de Termos/Políticas */}
            <LegalModal
                isOpen={modalType !== null}
                onClose={() => setModalType(null)}
                type={modalType || "termos"}
            />
        </div>
    );
}
