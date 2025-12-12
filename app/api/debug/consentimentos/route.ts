import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

/**
 * GET /api/debug/consentimentos
 * Rota de debug para verificar consentimentos salvos
 * ATENÇÃO: Esta rota expõe dados sensíveis - use apenas em desenvolvimento!
 */
export async function GET() {
    // Apenas em desenvolvimento
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { error: "Esta rota está desabilitada em produção" },
            { status: 403 }
        );
    }

    try {
        // Buscar últimos 10 consentimentos
        const { data, error, count } = await supabaseServer
            .from("consentimentos")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .limit(10);

        if (error) {
            return NextResponse.json(
                {
                    error: "Erro ao buscar consentimentos",
                    detalhes: {
                        message: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint
                    }
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            total: count || 0,
            ultimos: data || [],
            mensagem: "Últimos 10 consentimentos (apenas desenvolvimento)"
        });

    } catch (error: any) {
        return NextResponse.json(
            {
                error: "Erro inesperado",
                mensagem: error.message
            },
            { status: 500 }
        );
    }
}

