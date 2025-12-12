"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validarCPF, validarEmail, validarNome, limparCPF } from "@/lib/validations";

declare global {
    interface Window {
        hcaptcha: any;
    }
}

interface FormData {
    nome: string;
    cpf: string;
    email: string;
    aceitouTermos: boolean;
}

interface FormErrors {
    nome?: string;
    cpf?: string;
    email?: string;
    termos?: string;
    geral?: string;
}

export default function FormularioConfirmacao() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({ nome: "", cpf: "", email: "", aceitouTermos: false });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hcaptchaLoaded, setHcaptchaLoaded] = useState(false);
    const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);

    useEffect(() => {
        (window as any).onHcaptchaSuccess = (token: string) => {
            setHcaptchaToken(token);
            setErrors((prev) => ({ ...prev, geral: undefined }));
        };
        const script = document.createElement("script");
        script.src = "https://js.hcaptcha.com/1/api.js";
        script.async = true; script.defer = true;
        script.onload = () => setHcaptchaLoaded(true);
        document.body.appendChild(script);
        return () => { if (document.body.contains(script)) document.body.removeChild(script); };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "").slice(0, 11);
        let maskedValue = value;
        if (value.length > 9) maskedValue = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
        else if (value.length > 6) maskedValue = value.replace(/^(\d{3})(\d{3})(\d{3}).*/, "$1.$2.$3");
        else if (value.length > 3) maskedValue = value.replace(/^(\d{3})(\d{3}).*/, "$1.$2");
        setFormData((prev) => ({ ...prev, cpf: maskedValue }));
        if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: FormErrors = {};
        if (!validarNome(formData.nome)) newErrors.nome = "Insira seu nome completo válido.";
        if (!validarCPF(limparCPF(formData.cpf))) newErrors.cpf = "CPF inválido.";
        if (!validarEmail(formData.email)) newErrors.email = "E-mail inválido.";
        if (!formData.aceitouTermos) newErrors.termos = "Aceite os termos.";
        if (!hcaptchaToken) newErrors.geral = "Verifique que não é um robô.";
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/register", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, hcaptchaToken }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            router.push(`/confirmacao?numero=${data.numero_processo || 'nao-encontrado'}`);
        } catch (error: any) {
            setErrors({ geral: error.message }); setIsSubmitting(false);
            if (window.hcaptcha) window.hcaptcha.reset(); setHcaptchaToken(null);
        }
    };

    return (
        <div className="w-full bg-background-paper rounded-lg shadow-xl border border-primary/20 p-8 animate-slide-up relative">
            <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-text-main mb-2">
                    Confirmação de Interesse
                </h2>
                <p className="text-sm text-text-body font-medium">
                    Preencha o formulário abaixo para validar seu direito.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nome */}
                <div className="space-y-1">
                    <label className="text-sm font-bold text-text-main ml-1">Nome Completo</label>
                    <div className="relative">
                        <div className="absolute left-3 top-3.5 text-[#B8935A]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 bg-background-alt border rounded-lg 
                            focus:outline-none focus:ring-0 transition-all font-medium text-text-main placeholder-text-muted
                            ${errors.nome ? "border-red-400 bg-red-50" : "border-aux-border focus:border-primary"}`}
                            placeholder="Digite seu nome completo" />
                    </div>
                </div>

                {/* CPF */}
                <div className="space-y-1">
                    <label className="text-sm font-bold text-text-main ml-1">CPF</label>
                    <div className="relative">
                        <div className="absolute left-3 top-3.5 text-[#B8935A]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        </div>
                        <input type="text" name="cpf" value={formData.cpf} onChange={handleCpfChange} maxLength={14}
                            className={`w-full pl-10 pr-4 py-3 bg-background-alt border rounded-lg 
                            focus:outline-none focus:ring-0 transition-all font-medium text-text-main placeholder-text-muted
                            ${errors.cpf ? "border-red-400 bg-red-50" : "border-aux-border focus:border-primary"}`}
                            placeholder="000.000.000-00" />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <label className="text-sm font-bold text-text-main ml-1">E-mail para contato</label>
                    <div className="relative">
                        <div className="absolute left-3 top-3.5 text-[#B8935A]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 bg-background-alt border rounded-lg 
                            focus:outline-none focus:ring-0 transition-all font-medium text-text-main placeholder-text-muted
                            ${errors.email ? "border-red-400 bg-red-50" : "border-aux-border focus:border-primary"}`}
                            placeholder="seu@email.com" />
                    </div>
                </div>

                {/* hCaptcha (Compacto) */}
                <div className="flex justify-start min-h-[78px]">
                    {process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ? (
                        <div className="h-captcha" data-sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY} data-callback="onHcaptchaSuccess" data-theme="light"></div>
                    ) : <p className="text-xs text-red-500 bg-red-50 p-2 rounded w-full text-center">Configurar SITEKEY</p>}
                </div>

                {/* Termos */}
                <div className="flex items-start gap-3 pt-2">
                    <div className="flex items-center h-5">
                        <input id="termos" name="aceitouTermos" type="checkbox" checked={formData.aceitouTermos} onChange={handleChange}
                            className="w-5 h-5 text-primary border border-aux-border rounded focus:ring-0 cursor-pointer" />
                    </div>
                    <div className="text-xs text-text-body font-medium">
                        <label htmlFor="termos" className="cursor-pointer">Declaro que li e aceito os <a href="#" className="font-bold underline decoration-[#D2AC6E]">Termos de Uso</a> e a <a href="#" className="font-bold underline decoration-[#D2AC6E]">Política de Privacidade</a>.</label>
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting || !hcaptchaToken}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2
                        ${isSubmitting || !hcaptchaToken ? "bg-gray-400 cursor-not-allowed" : "bg-[#B8935A] hover:bg-[#8B6F47] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"}`}
                >
                    {isSubmitting ? "Processando..." : (
                        <>
                            Confirmar Interesse
                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </>
                    )}
                </button>
                <p className="text-[10px] text-center text-text-muted uppercase tracking-widest font-semibold pt-2">Conexão Segura 256-bit SSL</p>
                {errors.geral && <div className="text-center text-red-600 text-sm font-bold bg-red-50 p-2 rounded border border-red-200">{errors.geral}</div>}
            </form>
        </div>
    );
}
