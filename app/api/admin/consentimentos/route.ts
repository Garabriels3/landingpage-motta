import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Forçar renderização dinâmica e ZERO cache
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Verificar autenticação admin
 */
function verificarAuth(request: NextRequest): boolean {
    const adminKey = process.env.ADMIN_SECRET_KEY;
    if (!adminKey) {
        console.error("ADMIN_SECRET_KEY não configurada");
        return false;
    }

    // 1. Cookie (Prioritário)
    const cookieStore = cookies();
    const cookieToken = cookieStore.get("admin_token")?.value;
    if (cookieToken === adminKey) return true;

    // 2. Header (Fallback)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        if (token === adminKey) return true;
    }

    return false;
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
 * GET - Listar consentimentos (SEMPRE DADOS FRESCOS)
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
        // Buscar parâmetros de paginação e filtros
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = (page - 1) * limit;

        const dataInicio = searchParams.get("dataInicio");
        const dataFim = searchParams.get("dataFim");
        const campaign = searchParams.get("campaign");

        console.log(`[CONSENTIMENTOS] Page ${page}, Inicio: ${dataInicio}, Fim: ${dataFim}, Campaign: ${campaign}`);

        // Query Base
        let query = supabase
            .from("consentimentos")
            .select("id, cpf, nome_fornecido, email_fornecido, telefone, aceitou_termos, ip, source_campaign, created_at", { count: "exact" });

        // Filtros
        if (dataInicio) {
            const start = new Date(dataInicio);
            start.setHours(0, 0, 0, 0);
            query = query.gte("created_at", start.toISOString());
        }

        if (dataFim) {
            const end = new Date(dataFim);
            end.setHours(23, 59, 59, 999);
            query = query.lte("created_at", end.toISOString());
        }

        if (campaign && campaign !== 'todos') {
            query = query.ilike("source_campaign", `%${campaign}%`);
        }

        // Executar query com paginação
        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        const total = count || 0;

        if (error) {
            console.error("Erro ao buscar consentimentos:", error);
            return NextResponse.json(
                { error: "Erro ao buscar consentimentos" },
                { status: 500 }
            );
        }

        console.log(`[CONSENTIMENTOS] Retornando ${data?.length || 0} registros`);

        return NextResponse.json({
            data: data || [],
            total: total || 0,
            page,
            limit,
            totalPages: Math.ceil((total || 0) / limit),
            _timestamp: Date.now() // Força navegador a ver como resposta única
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store'
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
