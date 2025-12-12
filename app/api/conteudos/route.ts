import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

/**
 * GET /api/conteudos
 * Buscar conteúdos do site (público, mas usa service_role internamente)
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
                { status: 503 }
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

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

