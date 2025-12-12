import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Função para obter o cliente Supabase (lazy para não quebrar build)
function getSupabaseClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Client com service role key (apenas server-side!)
// Usa getter para inicialização lazy
let _supabaseServer: SupabaseClient | null = null;
export const supabaseServer = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        if (!_supabaseServer) {
            _supabaseServer = getSupabaseClient();
        }
        return (_supabaseServer as any)[prop];
    },
});

// Tipos
export interface Processo {
    id: number;
    cpf: string;
    numero_processo: string;
    origem: string | null;
    created_at: string;
}

export interface Consentimento {
    id?: string;
    cpf: string;
    nome_fornecido: string;
    email_fornecido: string;
    aceitou_termos: boolean;
    termos_hash: string;
    token_used?: boolean;
    ip: string | null;
    user_agent: string | null;
    source_campaign: string | null;
    created_at?: string;
}

/**
 * Buscar processo por CPF
 * @param cpf - CPF limpo (somente números)
 * @returns Processo ou null
 */
export async function buscarProcessoPorCPF(
    cpf: string
): Promise<Processo | null> {
    try {
        const { data, error } = await supabaseServer
            .from("processos")
            .select("*")
            .eq("cpf", cpf)
            .single();

        if (error) {
            // Se não encontrar, retornar null (não é erro de sistema)
            if (error.code === "PGRST116") {
                return null;
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Erro ao buscar processo:", error);
        throw error;
    }
}

/**
 * Gravar consentimento na tabela append-only
 * @param consentimento - dados do consentimento
 * @returns ID do registro criado
 */
export async function gravarConsentimento(
    consentimento: Consentimento
): Promise<string> {
    try {
        // Log dos dados que serão inseridos (sem dados sensíveis completos)
        console.log("📝 Tentando gravar consentimento:", {
            cpf: consentimento.cpf.substring(0, 3) + "***",
            nome: consentimento.nome_fornecido.substring(0, 3) + "***",
            email: consentimento.email_fornecido.substring(0, 3) + "***",
            termos_hash: consentimento.termos_hash.substring(0, 10) + "...",
            ip: consentimento.ip,
            campaign: consentimento.source_campaign
        });

        const { data, error } = await supabaseServer
            .from("consentimentos")
            .insert([consentimento])
            .select("id")
            .single();

        if (error) {
            console.error("❌ Erro do Supabase ao inserir:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            throw error;
        }

        if (!data || !data.id) {
            throw new Error("Inserção bem-sucedida mas nenhum ID retornado");
        }

        console.log("✅ Consentimento inserido com sucesso. ID:", data.id);
        return data.id;
    } catch (error: any) {
        console.error("❌ Erro ao gravar consentimento:", error);
        throw error;
    }
}

/**
 * Buscar todos os consentimentos (admin only)
 * @returns Array de consentimentos
 */
export async function listarConsentimentos(): Promise<Consentimento[]> {
    try {
        const { data, error } = await supabaseServer
            .from("consentimentos")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error("Erro ao listar consentimentos:", error);
        throw error;
    }
}

/**
 * Rate limiting persistente usando Supabase
 * @param key - chave única (ip:xxx ou cpf:xxx)
 * @param maxRequests - número máximo de requests
 * @param windowMs - janela de tempo em ms
 * @returns true se dentro do limite, false se excedido
 */
export async function verificarRateLimitPersistente(
    key: string,
    maxRequests: number,
    windowMs: number
): Promise<boolean> {
    try {
        const now = new Date();
        const resetTime = new Date(now.getTime() + windowMs);

        // Buscar ou criar registro
        const { data: existing, error: fetchError } = await supabaseServer
            .from("rate_limits")
            .select("*")
            .eq("key", key)
            .single();

        // Se não existe, criar novo
        if (fetchError && fetchError.code === "PGRST116") {
            const { error: insertError } = await supabaseServer
                .from("rate_limits")
                .insert([{
                    key,
                    count: 1,
                    reset_time: resetTime.toISOString(),
                }]);

            if (insertError) {
                console.error("Erro ao criar rate limit:", insertError);
                // Fallback: permitir se houver erro
                return true;
            }

            return true;
        }

        // Se existe mas expirou, resetar
        if (existing && new Date(existing.reset_time) < now) {
            const { error: updateError } = await supabaseServer
                .from("rate_limits")
                .update({
                    count: 1,
                    reset_time: resetTime.toISOString(),
                    updated_at: now.toISOString(),
                })
                .eq("key", key);

            if (updateError) {
                console.error("Erro ao resetar rate limit:", updateError);
                return true;
            }

            return true;
        }

        // Se existe e não expirou, verificar limite
        if (existing) {
            if (existing.count >= maxRequests) {
                return false;
            }

            // Incrementar contador
            const { error: updateError } = await supabaseServer
                .from("rate_limits")
                .update({
                    count: existing.count + 1,
                    updated_at: now.toISOString(),
                })
                .eq("key", key);

            if (updateError) {
                console.error("Erro ao atualizar rate limit:", updateError);
                // Se houver erro, permitir (fail-open para não bloquear usuários legítimos)
                return true;
            }

            return true;
        }

        // Fallback: permitir se algo der errado
        return true;
    } catch (error) {
        console.error("Erro inesperado no rate limiting:", error);
        // Fail-open: permitir se houver erro crítico
        return true;
    }
}
