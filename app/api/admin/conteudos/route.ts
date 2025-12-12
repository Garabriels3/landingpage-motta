import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

// Configurações de Rate Limiting
const RATE_LIMIT_MAX_ATTEMPTS = 5; // Máximo de tentativas
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Obter IP do request
 */
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    return forwarded?.split(",")[0]?.trim() || realIP || "unknown";
}

/**
 * Obter User-Agent do request
 */
function getUserAgent(request: NextRequest): string {
    return request.headers.get("user-agent") || "unknown";
}

/**
 * Obter cliente Supabase
 */
function getSupabaseClient(): SupabaseClient | null {
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
 * Verificar rate limit usando tabela existente
 */
async function verificarRateLimitAdmin(
    supabase: SupabaseClient,
    ip: string
): Promise<{ permitido: boolean; tentativasRestantes: number }> {
    try {
        const key = `admin_login:${ip}`;
        const now = new Date();
        const resetTime = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

        // Buscar registro existente
        const { data: existing, error: fetchError } = await supabase
            .from("rate_limits")
            .select("*")
            .eq("key", key)
            .single();

        // Se não existe, criar novo
        if (fetchError && fetchError.code === "PGRST116") {
            await supabase.from("rate_limits").insert([{
                key,
                count: 1,
                reset_time: resetTime.toISOString(),
            }]);
            return { permitido: true, tentativasRestantes: RATE_LIMIT_MAX_ATTEMPTS - 1 };
        }

        // Se existe mas expirou, resetar
        if (existing && new Date(existing.reset_time) < now) {
            await supabase
                .from("rate_limits")
                .update({
                    count: 1,
                    reset_time: resetTime.toISOString(),
                    updated_at: now.toISOString(),
                })
                .eq("key", key);
            return { permitido: true, tentativasRestantes: RATE_LIMIT_MAX_ATTEMPTS - 1 };
        }

        // Se existe e não expirou, verificar limite
        if (existing) {
            if (existing.count >= RATE_LIMIT_MAX_ATTEMPTS) {
                return { permitido: false, tentativasRestantes: 0 };
            }

            // Incrementar contador
            await supabase
                .from("rate_limits")
                .update({
                    count: existing.count + 1,
                    updated_at: now.toISOString(),
                })
                .eq("key", key);

            return {
                permitido: true,
                tentativasRestantes: RATE_LIMIT_MAX_ATTEMPTS - existing.count - 1
            };
        }

        return { permitido: true, tentativasRestantes: RATE_LIMIT_MAX_ATTEMPTS };
    } catch (error) {
        console.error("Erro ao verificar rate limit:", error);
        // Fail-open: permitir se houver erro
        return { permitido: true, tentativasRestantes: RATE_LIMIT_MAX_ATTEMPTS };
    }
}

/**
 * Resetar rate limit após login bem-sucedido
 */
async function resetarRateLimitAdmin(supabase: SupabaseClient, ip: string): Promise<void> {
    try {
        const key = `admin_login:${ip}`;
        await supabase.from("rate_limits").delete().eq("key", key);
    } catch (error) {
        console.error("Erro ao resetar rate limit:", error);
    }
}

/**
 * Registrar log de auditoria
 */
async function registrarAuditLog(
    supabase: SupabaseClient,
    acao: "CREATE" | "UPDATE" | "DELETE" | "LOGIN_FAILED" | "LOGIN_SUCCESS" | "LOGIN_BLOCKED",
    ip: string,
    userAgent: string,
    chaveConteudo?: string,
    valorAnterior?: string,
    valorNovo?: string,
    detalhes?: Record<string, any>
): Promise<void> {
    try {
        await supabase.from("admin_audit_logs").insert([{
            acao,
            chave_conteudo: chaveConteudo || null,
            valor_anterior: valorAnterior || null,
            valor_novo: valorNovo || null,
            ip,
            user_agent: userAgent,
            detalhes: detalhes || null,
        }]);
    } catch (error) {
        // Log de auditoria não deve bloquear a operação principal
        console.error("Erro ao registrar log de auditoria:", error);
    }
}

/**
 * Verificar autenticação admin com rate limiting
 */
async function verificarAuthComRateLimit(
    request: NextRequest,
    supabase: SupabaseClient
): Promise<{
    autorizado: boolean;
    erro?: string;
    status?: number;
    ip: string;
    userAgent: string;
}> {
    const ip = getClientIP(request);
    const userAgent = getUserAgent(request);
    const authHeader = request.headers.get("authorization");
    const adminSecret = process.env.ADMIN_SECRET_KEY;

    // Verificar se admin secret está configurado
    if (!adminSecret) {
        return {
            autorizado: false,
            erro: "Configuração de admin ausente",
            status: 503,
            ip,
            userAgent
        };
    }

    // Verificar rate limit antes de validar senha
    const { permitido, tentativasRestantes } = await verificarRateLimitAdmin(supabase, ip);

    if (!permitido) {
        // Registrar tentativa bloqueada
        await registrarAuditLog(
            supabase,
            "LOGIN_BLOCKED",
            ip,
            userAgent,
            undefined,
            undefined,
            undefined,
            { motivo: "Rate limit excedido" }
        );

        return {
            autorizado: false,
            erro: `Muitas tentativas. Aguarde 15 minutos. (IP: ${ip.substring(0, 8)}...)`,
            status: 429,
            ip,
            userAgent
        };
    }

    // Verificar credenciais
    const expectedAuth = `Bearer ${adminSecret}`;
    const credenciaisCorretas = authHeader === expectedAuth;

    if (!credenciaisCorretas) {
        // Registrar tentativa falha
        await registrarAuditLog(
            supabase,
            "LOGIN_FAILED",
            ip,
            userAgent,
            undefined,
            undefined,
            undefined,
            { tentativasRestantes }
        );

        return {
            autorizado: false,
            erro: tentativasRestantes > 0
                ? `Senha incorreta. Tentativas restantes: ${tentativasRestantes}`
                : "Senha incorreta. Última tentativa!",
            status: 401,
            ip,
            userAgent
        };
    }

    // Login bem-sucedido - resetar rate limit
    await resetarRateLimitAdmin(supabase, ip);

    // Registrar login bem-sucedido (apenas uma vez por sessão seria ideal, mas simplificando)
    // Comentado para não poluir logs: await registrarAuditLog(supabase, "LOGIN_SUCCESS", ip, userAgent);

    return { autorizado: true, ip, userAgent };
}

/**
 * GET /api/admin/conteudos
 * Listar todos os conteúdos (admin only)
 */
export async function GET(request: NextRequest) {
    const supabase = getSupabaseClient();

    if (!supabase) {
        return NextResponse.json(
            { error: "Supabase não configurado" },
            { status: 503 }
        );
    }

    const auth = await verificarAuthComRateLimit(request, supabase);

    if (!auth.autorizado) {
        return NextResponse.json(
            { error: auth.erro },
            { status: auth.status || 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const pagina = searchParams.get("pagina");

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
    const supabase = getSupabaseClient();

    if (!supabase) {
        return NextResponse.json(
            { error: "Supabase não configurado" },
            { status: 503 }
        );
    }

    const auth = await verificarAuthComRateLimit(request, supabase);

    if (!auth.autorizado) {
        return NextResponse.json(
            { error: auth.erro },
            { status: auth.status || 401 }
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

        // Registrar criação no log de auditoria
        await registrarAuditLog(
            supabase,
            "CREATE",
            auth.ip,
            auth.userAgent,
            chave,
            undefined,
            texto.trim().substring(0, 500) // Limitar tamanho no log
        );

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
    const supabase = getSupabaseClient();

    if (!supabase) {
        return NextResponse.json(
            { error: "Supabase não configurado" },
            { status: 503 }
        );
    }

    const auth = await verificarAuthComRateLimit(request, supabase);

    if (!auth.autorizado) {
        return NextResponse.json(
            { error: auth.erro },
            { status: auth.status || 401 }
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

        // Buscar valor anterior para o log
        const { data: anterior } = await supabase
            .from("conteudos")
            .select("texto")
            .eq("chave", chave)
            .single();

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

        // Registrar atualização no log de auditoria
        await registrarAuditLog(
            supabase,
            "UPDATE",
            auth.ip,
            auth.userAgent,
            chave,
            anterior?.texto?.substring(0, 500),
            texto?.trim()?.substring(0, 500)
        );

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
    const supabase = getSupabaseClient();

    if (!supabase) {
        return NextResponse.json(
            { error: "Supabase não configurado" },
            { status: 503 }
        );
    }

    const auth = await verificarAuthComRateLimit(request, supabase);

    if (!auth.autorizado) {
        return NextResponse.json(
            { error: auth.erro },
            { status: auth.status || 401 }
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

        // Buscar valor anterior para o log
        const { data: anterior } = await supabase
            .from("conteudos")
            .select("texto")
            .eq("chave", chave)
            .single();

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

        // Registrar deleção no log de auditoria
        await registrarAuditLog(
            supabase,
            "DELETE",
            auth.ip,
            auth.userAgent,
            chave,
            anterior?.texto?.substring(0, 500),
            undefined
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro inesperado:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
