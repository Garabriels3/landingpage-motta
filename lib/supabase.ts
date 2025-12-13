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
let _supabaseServer: SupabaseClient | null = null;
export const supabaseServer = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        if (!_supabaseServer) {
            _supabaseServer = getSupabaseClient();
        }
        return (_supabaseServer as any)[prop];
    },
});

// ============================================
// TIPOS
// ============================================

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
    telefone?: string;
    aceitou_termos: boolean;
    termos_hash: string;
    token_used?: boolean;
    ip: string | null;
    user_agent: string | null;
    source_campaign: string | null;
    created_at?: string;
}

export interface Caso {
    id: string;
    NUMERO_PROCESSO: string;
    REU: string;
    DOC_REU: string;
    EMAIL: string;
    TELEFONE?: string;
    CELULAR?: string;
    ENDERECO?: string;
    CIDADE?: string;
    ESTADO?: string;
    CEP?: string;
    DATA_NASCIMENTO?: string;
    NOME_MAE?: string;
    VALOR_CAUSA?: string;
    VARA?: string;
    COMARCA?: string;
    TIPO_ACAO?: string;
    STATUS_PROCESSO?: string;
    DATA_DISTRIBUICAO?: string;
    ADVOGADO?: string;
    OAB?: string;
    OBSERVACOES?: string;
    consentimento_id?: string;
    status_consentimento?: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: any; // Permite qualquer outra coluna
}

// ============================================
// FUNÇÕES: PROCESSOS (LEGADO)
// ============================================

export async function buscarProcessoPorCPF(cpf: string): Promise<Processo | null> {
    try {
        const { data, error } = await supabaseServer
            .from("processos")
            .select("*")
            .eq("cpf", cpf)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw error;
        }
        return data;
    } catch (error) {
        console.error("Erro ao buscar processo:", error);
        throw error;
    }
}

// ============================================
// FUNÇÕES: CONSENTIMENTOS
// ============================================

export async function gravarConsentimento(consentimento: Consentimento): Promise<string> {
    try {
        console.log("📝 Tentando gravar consentimento:", {
            cpf: consentimento.cpf ? consentimento.cpf.substring(0, 3) + "***" : "(vazio)",
            nome: consentimento.nome_fornecido.substring(0, 3) + "***",
            email: consentimento.email_fornecido.substring(0, 3) + "***",
            telefone: consentimento.telefone ? "presente" : "ausente",
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
            console.error("❌ Erro do Supabase ao inserir:", error);
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

export async function listarConsentimentos(): Promise<Consentimento[]> {
    try {
        const { data, error } = await supabaseServer
            .from("consentimentos")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Erro ao listar consentimentos:", error);
        throw error;
    }
}

// ============================================
// FUNÇÕES: RATE LIMITING
// ============================================

export async function verificarRateLimitPersistente(
    key: string,
    maxRequests: number,
    windowMs: number
): Promise<boolean> {
    try {
        const now = new Date();
        const resetTime = new Date(now.getTime() + windowMs);

        const { data: existing, error: fetchError } = await supabaseServer
            .from("rate_limits")
            .select("*")
            .eq("key", key)
            .single();

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
                return true;
            }
            return true;
        }

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

        if (existing) {
            if (existing.count >= maxRequests) {
                return false;
            }

            const { error: updateError } = await supabaseServer
                .from("rate_limits")
                .update({
                    count: existing.count + 1,
                    updated_at: now.toISOString(),
                })
                .eq("key", key);

            if (updateError) {
                console.error("Erro ao atualizar rate limit:", updateError);
                return true;
            }
            return true;
        }

        return true;
    } catch (error) {
        console.error("Erro inesperado no rate limiting:", error);
        return true;
    }
}

// ============================================
// FUNÇÕES: CASOS
// ============================================

/**
 * Buscar caso por Email (nova função simplificada - sem CPF)
 */
export async function buscarCasoPorEmail(email: string): Promise<Caso | null> {
    if (!email) return null;

    try {
        const { data, error } = await supabaseServer
            .from("casos")
            .select("*")
            .eq("EMAIL", email.toLowerCase().trim())
            .limit(1)
            .single();

        if (data) return data;

        if (error && error.code !== "PGRST116") {
            console.error("Erro ao buscar caso por email:", error);
        }

        return null;
    } catch (error) {
        console.error("Erro geral na busca de casos por email:", error);
        return null;
    }
}

/**
 * Buscar caso por CPF ou Email (mantida para retrocompatibilidade)
 * @deprecated Use buscarCasoPorEmail
 */
export async function buscarCasoPorCPFOuEmail(cpf: string, email: string): Promise<Caso | null> {
    try {
        if (cpf) {
            const cpfNumerico = cpf.replace(/^0+/, "") || cpf;
            const { data, error } = await supabaseServer
                .from("casos")
                .select("*")
                .or(`DOC_REU.eq.${cpf},DOC_REU.eq.${cpfNumerico}`)
                .limit(1)
                .single();

            if (data) return data;
            if (error && error.code !== "PGRST116") {
                console.error("Erro ao buscar caso por CPF:", error);
            }
        }

        if (email) {
            const { data, error } = await supabaseServer
                .from("casos")
                .select("*")
                .eq("EMAIL", email)
                .limit(1)
                .single();

            if (data) return data;
        }

        return null;
    } catch (error) {
        console.error("Erro geral na busca de casos:", error);
        return null;
    }
}

/**
 * Vincula um consentimento a um caso existente
 */
export async function vincularConsentimentoAoCaso(
    casoId: string,
    consentimentoId: string
): Promise<boolean> {
    try {
        const { error } = await supabaseServer
            .from("casos")
            .update({ consentimento_id: consentimentoId })
            .eq("id", casoId);

        if (error) {
            console.error("Erro ao vincular consentimento ao caso:", error);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Erro exceção ao vincular:", error);
        return false;
    }
}

/**
 * Listar casos para o admin, com paginação e filtros
 */
export async function listarCasosAdmin(
    page = 0,
    limit = 50,
    termoBusca = "",
    filtroAdvogado: 'todos' | 'com_advogado' | 'sem_advogado' = 'todos',
    dataInicio = "",
    dataFim = ""
): Promise<{ data: Caso[]; count: number }> {
    try {
        let query = supabaseServer
            .from("casos")
            .select("*, consentimentos(id, created_at)", { count: "exact" });

        // Filtros de busca textual
        if (termoBusca) {
            const isNumeric = /^\d+$/.test(termoBusca);
            if (isNumeric) {
                const termoNum = termoBusca.replace(/^0+/, "") || termoBusca;
                query = query.or(`REU.ilike.%${termoBusca}%,EMAIL.ilike.%${termoBusca}%,DOC_REU.eq.${termoNum}`);
            } else {
                query = query.or(`REU.ilike.%${termoBusca}%,EMAIL.ilike.%${termoBusca}%`);
            }
        }

        // Filtro de Advogado
        if (filtroAdvogado === 'com_advogado') {
            // Considera com advogado se o campo não for nulo e não for vazio
            query = query.neq('ADVOGADO', null).neq('ADVOGADO', '');
        } else if (filtroAdvogado === 'sem_advogado') {
            // Considera sem advogado se for nulo ou vazio
            // Nota: Supabase OR syntax para null ou empty string é chato, vamos simplificar
            // verificando se é null. Se o banco tiver strings vazias, isso pode precisar de ajuste.
            // Tentativa de cobrir ambos: is null or eq ''
            query = query.or('ADVOGADO.is.null,ADVOGADO.eq.""');
        }

        // Filtro de Data
        if (dataInicio) {
            query = query.gte('DATA_DISTRIBUICAO', dataInicio);
        }
        if (dataFim) {
            query = query.lte('DATA_DISTRIBUICAO', dataFim);
        }

        const from = page * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query
            .range(from, to)
            .order("id", { ascending: true });

        if (error) throw error;

        return { data: data || [], count: count || 0 };
    } catch (error) {
        console.error("Erro ao listar casos admin:", error);
        return { data: [], count: 0 };
    }
}
