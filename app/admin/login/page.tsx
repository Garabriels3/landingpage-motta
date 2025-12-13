"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                router.push("/admin/conteudos");
            } else {
                const data = await response.json();
                setError(data.error || "Login falhou");
            }
        } catch (err) {
            setError("Erro de conexão");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#110e0a] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1e1a14] rounded-2xl shadow-xl border border-white/5 p-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#2a261f] rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <span className="material-symbols-outlined text-primary text-3xl">shield_lock</span>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Acesso Administrativo</h1>
                <p className="text-gray-400 text-center text-sm mb-8">
                    Digite sua chave de segurança para acessar o painel.
                </p>

                <form onSubmit={handleLogin} className="w-full space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Chave de Acesso"
                            className="w-full h-12 bg-[#110e0a] border border-white/10 rounded-xl px-4 text-white hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder-gray-600"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-primary hover:bg-primary-dark text-black font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Entrar</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
