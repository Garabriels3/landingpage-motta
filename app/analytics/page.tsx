"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Evento {
    id: string;
    evento_tipo: string;
    evento_nome: string;
    usuario_id: string | null;
    pagina: string | null;
    created_at: string;
}

interface Estatisticas {
    totalEventos: number;
    eventosPorTipo: Record<string, number>;
    eventosPorPagina: Record<string, number>;
    eventosHoje: number;
    eventosUltimaHora: number;
}

export default function AnalyticsPage() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState<string>("all");
    const [filtroPagina, setFiltroPagina] = useState<string>("all");

    useEffect(() => {
        carregarEventos();
        const interval = setInterval(carregarEventos, 30000); // Atualizar a cada 30s
        return () => clearInterval(interval);
    }, [filtroTipo, filtroPagina]);

    const carregarEventos = async () => {
        try {
            const params = new URLSearchParams();
            if (filtroTipo !== "all") params.append("tipo", filtroTipo);
            if (filtroPagina !== "all") params.append("pagina", filtroPagina);

            const response = await fetch(`/api/analytics?${params.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setEventos(data.eventos || []);
                setEstatisticas(data.estatisticas || null);
            }
        } catch (error) {
            console.error("Erro ao carregar eventos:", error);
        } finally {
            setLoading(false);
        }
    };

    const tiposUnicos = Array.from(new Set(eventos.map(e => e.evento_tipo).filter(Boolean)));
    const paginasUnicas = Array.from(new Set(eventos.map(e => e.pagina).filter((p): p is string => Boolean(p))));

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-bg">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Header />

            <section className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
                <div className="space-y-6">
                    {/* Título */}
                    <div>
                        <h1 className="text-3xl font-bold text-text-main dark:text-dark-textMain mb-2">
                            📊 Analytics - Jornada do Usuário
                        </h1>
                        <p className="text-gray-600 dark:text-dark-textSecondary">
                            Acompanhe os eventos e a jornada dos usuários em tempo real
                        </p>
                    </div>

                    {/* Estatísticas */}
                    {estatisticas && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-dark-paper p-6 rounded-2xl border-2 border-primary dark:border-dark-border">
                                <div className="text-sm text-gray-600 dark:text-dark-textSecondary mb-1">Total de Eventos</div>
                                <div className="text-3xl font-bold text-primary">{estatisticas.totalEventos}</div>
                            </div>
                            <div className="bg-white dark:bg-dark-paper p-6 rounded-2xl border-2 border-primary dark:border-dark-border">
                                <div className="text-sm text-gray-600 dark:text-dark-textSecondary mb-1">Eventos Hoje</div>
                                <div className="text-3xl font-bold text-primary">{estatisticas.eventosHoje}</div>
                            </div>
                            <div className="bg-white dark:bg-dark-paper p-6 rounded-2xl border-2 border-primary dark:border-dark-border">
                                <div className="text-sm text-gray-600 dark:text-dark-textSecondary mb-1">Última Hora</div>
                                <div className="text-3xl font-bold text-primary">{estatisticas.eventosUltimaHora}</div>
                            </div>
                            <div className="bg-white dark:bg-dark-paper p-6 rounded-2xl border-2 border-primary dark:border-dark-border">
                                <div className="text-sm text-gray-600 dark:text-dark-textSecondary mb-1">Tipos Diferentes</div>
                                <div className="text-3xl font-bold text-primary">{tiposUnicos.length}</div>
                            </div>
                        </div>
                    )}

                    {/* Filtros */}
                    <div className="bg-white dark:bg-dark-paper p-6 rounded-2xl border-2 border-primary dark:border-dark-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-dark-textMain mb-2">
                                    Filtrar por Tipo
                                </label>
                                <select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-primary dark:border-dark-border bg-white dark:bg-dark-bgAlt text-text-main dark:text-dark-textMain"
                                >
                                    <option value="all">Todos os tipos</option>
                                    {tiposUnicos.map(tipo => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-dark-textMain mb-2">
                                    Filtrar por Página
                                </label>
                                <select
                                    value={filtroPagina}
                                    onChange={(e) => setFiltroPagina(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-primary dark:border-dark-border bg-white dark:bg-dark-bgAlt text-text-main dark:text-dark-textMain"
                                >
                                    <option value="all">Todas as páginas</option>
                                    {paginasUnicas.map(pagina => (
                                        <option key={pagina} value={pagina}>{pagina}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Eventos por Tipo */}
                    {estatisticas && Object.keys(estatisticas.eventosPorTipo).length > 0 && (
                        <div className="bg-white dark:bg-dark-paper p-6 rounded-2xl border-2 border-primary dark:border-dark-border">
                            <h2 className="text-xl font-bold text-text-main dark:text-dark-textMain mb-4">
                                Eventos por Tipo
                            </h2>
                            <div className="space-y-3">
                                {Object.entries(estatisticas.eventosPorTipo)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([tipo, count]) => (
                                        <div key={tipo} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-text-main dark:text-dark-textMain font-medium">{tipo}</span>
                                                <span className="text-primary font-bold">{count}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-dark-bgAlt rounded-full h-3">
                                                <div
                                                    className="bg-primary h-3 rounded-full transition-all"
                                                    style={{
                                                        width: `${(count / estatisticas.totalEventos) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Tabela de Eventos Recentes */}
                    <div className="bg-white dark:bg-dark-paper p-6 rounded-2xl border-2 border-primary dark:border-dark-border">
                        <h2 className="text-xl font-bold text-text-main dark:text-dark-textMain mb-4">
                            Eventos Recentes (últimos 50)
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-primary dark:border-dark-border">
                                        <th className="text-left py-3 px-4 text-sm font-bold text-text-main dark:text-dark-textMain">Data/Hora</th>
                                        <th className="text-left py-3 px-4 text-sm font-bold text-text-main dark:text-dark-textMain">Tipo</th>
                                        <th className="text-left py-3 px-4 text-sm font-bold text-text-main dark:text-dark-textMain">Nome</th>
                                        <th className="text-left py-3 px-4 text-sm font-bold text-text-main dark:text-dark-textMain">Página</th>
                                        <th className="text-left py-3 px-4 text-sm font-bold text-text-main dark:text-dark-textMain">Usuário</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventos.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-dark-textMuted">
                                                Nenhum evento registrado ainda
                                            </td>
                                        </tr>
                                    ) : (
                                        eventos.map((evento) => (
                                            <tr
                                                key={evento.id}
                                                className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bgAlt transition-colors"
                                            >
                                                <td className="py-3 px-4 text-sm text-text-main dark:text-dark-textMain">
                                                    {new Date(evento.created_at).toLocaleString('pt-BR')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary">
                                                        {evento.evento_tipo}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-text-main dark:text-dark-textMain">
                                                    {evento.evento_nome}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-dark-textSecondary">
                                                    {evento.pagina || "-"}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-dark-textSecondary font-mono">
                                                    {evento.usuario_id ? evento.usuario_id.substring(0, 8) + "..." : "-"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

