import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Forçar renderização dinâmica (sem cache)
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/conteudos
 * Buscar conteúdos do site (público, mas usa service_role internamente)
 * IMPORTANTE: Não fazer cache para garantir dados atualizados do CMS
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const chave = searchParams.get("chave");
        const pagina = searchParams.get("pagina");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { error: "Supabase não configurado" },
                {
                    status: 503,
                    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
                }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        let data, error;

        if (chave) {
            const result = await supabase
                .from("conteudos")
                .select("*")
                .eq("chave", chave)
                .single();
            data = result.data;
            error = result.error;
        } else if (pagina) {
            const result = await supabase
                .from("conteudos")
                .select("*")
                .eq("pagina", pagina);
            data = result.data;
            error = result.error;
        } else {
            const result = await supabase
                .from("conteudos")
                .select("*")
                .limit(100);
            data = result.data;
            error = result.error;
        }

        if (error) {
            console.error("Erro ao buscar conteúdos:", error);
            return NextResponse.json(
                { error: "Erro ao buscar conteúdos" },
                { status: 500 }
            );
        }

        // Retornar com headers anti-cache para garantir dados frescos
        return NextResponse.json(
            { data },
            {
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                },
            }
        );
    } catch (error) {
        console.error("Erro inesperado:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

