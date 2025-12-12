import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
}

// Client com service role key (apenas server-side!)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
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
        const { data, error } = await supabaseServer
            .from("consentimentos")
            .insert([consentimento])
            .select("id")
            .single();

        if (error) {
            throw error;
        }

        return data.id;
    } catch (error) {
        console.error("Erro ao gravar consentimento:", error);
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
