import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

/**
 * Verificar autenticação admin
 */
function verificarAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return false;
    }

    const token = authHeader.substring(7);
    const adminKey = process.env.ADMIN_SECRET_KEY;

    if (!adminKey) {
        console.error("ADMIN_SECRET_KEY não configurada");
        return false;
    }

    return token === adminKey;
}

/**
 * Obter cliente Supabase
 */
function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return null;
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * GET - Listar consentimentos
 */
export async function GET(request: NextRequest) {
    // Verificar autenticação
    if (!verificarAuth(request)) {
        return NextResponse.json(
            { error: "Não autorizado" },
            { status: 401 }
        );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
        return NextResponse.json(
            { error: "Erro de configuração do servidor" },
            { status: 500 }
        );
    }

    try {
        // Buscar parâmetros de paginação
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = (page - 1) * limit;

        // Buscar total de registros
        const { count: total, error: countError } = await supabase
            .from("consentimentos")
            .select("*", { count: "exact", head: true });

        if (countError) {
            console.error("Erro ao contar consentimentos:", countError);
        }

        // Buscar consentimentos com paginação
        const { data, error } = await supabase
            .from("consentimentos")
            .select("id, cpf, nome_fornecido, email_fornecido, aceitou_termos, ip, source_campaign, created_at")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Erro ao buscar consentimentos:", error);
            return NextResponse.json(
                { error: "Erro ao buscar consentimentos" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: data || [],
            total: total || 0,
            page,
            limit,
            totalPages: Math.ceil((total || 0) / limit),
        }, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
    } catch (error) {
        console.error("Erro interno:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
