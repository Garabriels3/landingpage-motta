import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

/**
 * Verificar autenticação admin
 */
function verificarAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get("authorization");
    const adminSecret = process.env.ADMIN_SECRET_KEY;

    if (!adminSecret) {
        return false;
    }

    const expectedAuth = `Bearer ${adminSecret}`;
    return authHeader === expectedAuth;
}

/**
 * GET /api/admin/conteudos
 * Listar todos os conteúdos (admin only)
 */
export async function GET(request: NextRequest) {
    if (!verificarAuth(request)) {
        return NextResponse.json(
            { error: "Não autorizado" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
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

        let query = supabase.from("conteudos").select("*").order("pagina", { ascending: true }).order("chave", { ascending: true });

        if (pagina) {
            query = query.eq("pagina", pagina);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Erro ao buscar conteúdos:", error);
            return NextResponse.json(
                { error: "Erro ao buscar conteúdos" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: data || [] });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/conteudos
 * Criar novo conteúdo (admin only)
 */
export async function POST(request: NextRequest) {
    if (!verificarAuth(request)) {
        return NextResponse.json(
            { error: "Não autorizado" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { chave, texto, pagina, tipo, descricao } = body;

        // Validação
        if (!chave || !texto || !pagina) {
            return NextResponse.json(
                { error: "Campos obrigatórios: chave, texto, pagina" },
                { status: 400 }
            );
        }

        // Sanitizar chave (apenas letras, números, pontos e hífens)
        if (!/^[a-zA-Z0-9._-]+$/.test(chave)) {
            return NextResponse.json(
                { error: "Chave inválida. Use apenas letras, números, pontos e hífens." },
                { status: 400 }
            );
        }

        // Limitar tamanho do texto (prevenir abusos)
        if (texto.length > 10000) {
            return NextResponse.json(
                { error: "Texto muito longo (máximo 10000 caracteres)" },
                { status: 400 }
            );
        }

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

        const { data, error } = await supabase
            .from("conteudos")
            .insert([{
                chave,
                texto: texto.trim(),
                pagina,
                tipo: tipo || "texto",
                descricao: descricao || null,
            }])
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json(
                    { error: "Já existe um conteúdo com esta chave" },
                    { status: 409 }
                );
            }
            console.error("Erro ao criar conteúdo:", error);
            return NextResponse.json(
                { error: "Erro ao criar conteúdo" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/conteudos
 * Atualizar conteúdo existente (admin only)
 */
export async function PUT(request: NextRequest) {
    if (!verificarAuth(request)) {
        return NextResponse.json(
            { error: "Não autorizado" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { chave, texto, pagina, tipo, descricao } = body;

        if (!chave) {
            return NextResponse.json(
                { error: "Campo obrigatório: chave" },
                { status: 400 }
            );
        }

        // Limitar tamanho do texto
        if (texto && texto.length > 10000) {
            return NextResponse.json(
                { error: "Texto muito longo (máximo 10000 caracteres)" },
                { status: 400 }
            );
        }

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

        const updateData: any = {};
        if (texto !== undefined) updateData.texto = texto.trim();
        if (pagina !== undefined) updateData.pagina = pagina;
        if (tipo !== undefined) updateData.tipo = tipo;
        if (descricao !== undefined) updateData.descricao = descricao;

        const { data, error } = await supabase
            .from("conteudos")
            .update(updateData)
            .eq("chave", chave)
            .select()
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Conteúdo não encontrado" },
                    { status: 404 }
                );
            }
            console.error("Erro ao atualizar conteúdo:", error);
            return NextResponse.json(
                { error: "Erro ao atualizar conteúdo" },
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

/**
 * DELETE /api/admin/conteudos
 * Deletar conteúdo (admin only)
 */
export async function DELETE(request: NextRequest) {
    if (!verificarAuth(request)) {
        return NextResponse.json(
            { error: "Não autorizado" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const chave = searchParams.get("chave");

        if (!chave) {
            return NextResponse.json(
                { error: "Campo obrigatório: chave" },
                { status: 400 }
            );
        }

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

        const { error } = await supabase
            .from("conteudos")
            .delete()
            .eq("chave", chave);

        if (error) {
            console.error("Erro ao deletar conteúdo:", error);
            return NextResponse.json(
                { error: "Erro ao deletar conteúdo" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

