import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics
 * Retorna eventos e estatísticas para visualização
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tipoFiltro = searchParams.get("tipo");
        const paginaFiltro = searchParams.get("pagina");

        // Construir query base
        let query = supabaseServer
            .from("eventos")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

        // Aplicar filtros
        if (tipoFiltro && tipoFiltro !== "all") {
            query = query.eq("evento_tipo", tipoFiltro);
        }
        if (paginaFiltro && paginaFiltro !== "all") {
            query = query.eq("pagina", paginaFiltro);
        }

        const { data: eventos, error } = await query;

        if (error) {
            console.error("Erro ao buscar eventos:", error);
            return NextResponse.json(
                { error: "Erro ao buscar eventos" },
                { status: 500 }
            );
        }

        // Calcular estatísticas
        const totalEventos = eventos?.length || 0;
        const agora = new Date();
        const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const umaHoraAtras = new Date(agora.getTime() - 60 * 60 * 1000);

        const eventosHoje = eventos?.filter(e => new Date(e.created_at) >= hoje).length || 0;
        const eventosUltimaHora = eventos?.filter(e => new Date(e.created_at) >= umaHoraAtras).length || 0;

        // Contar por tipo
        const eventosPorTipo: Record<string, number> = {};
        eventos?.forEach(evento => {
            eventosPorTipo[evento.evento_tipo] = (eventosPorTipo[evento.evento_tipo] || 0) + 1;
        });

        // Contar por página
        const eventosPorPagina: Record<string, number> = {};
        eventos?.forEach(evento => {
            if (evento.pagina) {
                eventosPorPagina[evento.pagina] = (eventosPorPagina[evento.pagina] || 0) + 1;
            }
        });

        // Buscar total geral (sem filtros)
        const { count: totalGeral } = await supabaseServer
            .from("eventos")
            .select("*", { count: "exact", head: true });

        return NextResponse.json({
            eventos: eventos || [],
            estatisticas: {
                totalEventos: totalGeral || 0,
                eventosPorTipo,
                eventosPorPagina,
                eventosHoje,
                eventosUltimaHora,
            }
        });

    } catch (error) {
        console.error("Erro no endpoint /api/analytics:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

