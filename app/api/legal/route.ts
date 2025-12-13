import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['termos', 'privacidade'].includes(type)) {
        return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    try {
        const chave = type === 'termos' ? 'termos_de_uso' : 'politica_privacidade';
        const title = type === 'termos' ? 'Termos de Uso' : 'Política de Privacidade';

        const { data, error } = await supabaseServer
            .from("conteudos")
            .select("texto")
            .eq("chave", chave)
            .single();

        if (error) {
            // Se não achar, retorna 404 para o front usar o fallback
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: "Conteúdo não encontrado" }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json({
            title,
            content: data.texto
        });

    } catch (error: any) {
        console.error("Erro ao buscar legal text:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
