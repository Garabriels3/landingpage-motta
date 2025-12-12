"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Conteudo {
    id: string;
    chave: string;
    texto: string;
    pagina: string;
    tipo: string;
    descricao?: string;
    updated_at?: string;
}

export default function AdminConteudosPage() {
    const router = useRouter();
    const [autenticado, setAutenticado] = useState(false);
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [conteudos, setConteudos] = useState<Conteudo[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [editando, setEditando] = useState<string | null>(null);
    const [textoEditando, setTextoEditando] = useState("");
    const [filtroPagina, setFiltroPagina] = useState("all");

    // Verificar autenticação ao montar
    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (token) {
            verificarToken(token);
        }
    }, []);

    // Recarregar conteúdos quando filtro mudar
    useEffect(() => {
        if (autenticado) {
            const token = localStorage.getItem("admin_token");
            if (token) {
                carregarConteudos(token);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroPagina]);

    const verificarToken = async (token: string) => {
        try {
            const response = await fetch("/api/admin/conteudos", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setAutenticado(true);
                carregarConteudos(token);
            } else {
                localStorage.removeItem("admin_token");
            }
        } catch (error) {
            localStorage.removeItem("admin_token");
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");

        try {
            const response = await fetch("/api/admin/conteudos", {
                headers: {
                    Authorization: `Bearer ${senha}`,
                },
            });

            if (response.ok) {
                localStorage.setItem("admin_token", senha);
                setAutenticado(true);
                carregarConteudos(senha);
            } else {
                // Exibir mensagem de erro detalhada do servidor
                const data = await response.json();
                setErro(data.error || "Senha incorreta");
            }
        } catch (error) {
            setErro("Erro ao conectar com o servidor");
        }
    };

    const carregarConteudos = async (token: string) => {
        setCarregando(true);
        try {
            const url = filtroPagina !== "all"
                ? `/api/admin/conteudos?pagina=${encodeURIComponent(filtroPagina)}`
                : "/api/admin/conteudos";

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            });

            if (response.ok) {
                const data = await response.json();
                setConteudos(data.data || []);
            } else {
                console.error("Erro ao carregar conteúdos:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Erro ao carregar conteúdos:", error);
        } finally {
            setCarregando(false);
        }
    };

    const handleSalvar = async (chave: string) => {
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        try {
            const response = await fetch("/api/admin/conteudos", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chave,
                    texto: textoEditando,
                }),
            });

            if (response.ok) {
                setEditando(null);
                await carregarConteudos(token);
                // Mostrar confirmação de sucesso
                alert("✅ Conteúdo salvo com sucesso!\n\nO site será atualizado automaticamente em até 60 segundos.\n\nPara ver as mudanças imediatamente, recarregue a página do site (Ctrl+F5).");
            } else {
                const data = await response.json();
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert("Erro ao salvar");
        }
    };

    const handleCancelar = () => {
        setEditando(null);
        setTextoEditando("");
    };

    const iniciarEdicao = (conteudo: Conteudo) => {
        setEditando(conteudo.chave);
        setTextoEditando(conteudo.texto);
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        setAutenticado(false);
        setConteudos([]);
    };

    // Páginas únicas
    const paginasUnicas = Array.from(new Set(conteudos.map((c) => c.pagina))).sort();

    if (!autenticado) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Admin - Gerenciar Conteúdos
                    </h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Senha de Administrador
                            </label>
                            <input
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Digite a senha admin"
                                required
                            />
                        </div>
                        {erro && (
                            <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Entrar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Gerenciar Conteúdos do Site
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Edite os textos do site sem precisar mexer no código
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Filtro */}
                            <select
                                value={filtroPagina}
                                onChange={(e) => setFiltroPagina(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">Todas as páginas</option>
                                {paginasUnicas.map((pagina) => (
                                    <option key={pagina} value={pagina}>
                                        {pagina}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de conteúdos */}
                {carregando ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {conteudos.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Nenhum conteúdo encontrado
                                </p>
                            </div>
                        ) : (
                            conteudos.map((conteudo) => (
                                <div
                                    key={conteudo.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                    {conteudo.chave}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                                                    {conteudo.pagina}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                                                    {conteudo.tipo}
                                                </span>
                                            </div>
                                            {conteudo.descricao && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    {conteudo.descricao}
                                                </p>
                                            )}
                                            {editando === conteudo.chave ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={textoEditando}
                                                        onChange={(e) => setTextoEditando(e.target.value)}
                                                        rows={4}
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSalvar(conteudo.chave)}
                                                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                                                        >
                                                            Salvar
                                                        </button>
                                                        <button
                                                            onClick={handleCancelar}
                                                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                                        {conteudo.texto}
                                                    </p>
                                                    {conteudo.updated_at && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                            Atualizado: {new Date(conteudo.updated_at).toLocaleString("pt-BR")}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {editando !== conteudo.chave && (
                                            <button
                                                onClick={() => iniciarEdicao(conteudo)}
                                                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shrink-0"
                                            >
                                                Editar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

