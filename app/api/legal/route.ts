import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

/**
 * GET /api/legal?type=termos|privacidade
 * Busca conteúdo de termos de uso ou política de privacidade do Supabase
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        if (!type || !["termos", "privacidade"].includes(type)) {
            return NextResponse.json(
                { error: "Tipo inválido. Use 'termos' ou 'privacidade'" },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            // Retorna null para usar fallback local
            return NextResponse.json({ content: null });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Buscar da tabela 'legal_content'
        // Estrutura esperada: id, type (termos|privacidade), title, content, updated_at
        const { data, error } = await supabase
            .from("legal_content")
            .select("title, content")
            .eq("type", type)
            .single();

        if (error || !data) {
            // Retorna null para usar fallback local
            return NextResponse.json({ content: null });
        }

        return NextResponse.json({
            title: data.title,
            content: data.content
        });

    } catch {
        return NextResponse.json({ content: null });
    }
}
