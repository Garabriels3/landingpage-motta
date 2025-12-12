import { createClient } from "@supabase/supabase-js";

// Tipos
export interface Conteudo {
    id: string;
    chave: string;
    texto: string;
    pagina: string;
    tipo: string;
    descricao?: string;
    created_at?: string;
    updated_at?: string;
}

// Cache em memória (para evitar múltiplas chamadas)
let conteudosCache: Map<string, string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Função para obter cliente Supabase (lazy)
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
 * Buscar conteúdo do Supabase com fallback
 * @param chave - Chave do conteúdo (ex: "homepage.headline")
 * @param fallback - Texto padrão se não encontrar no banco
 * @returns Texto do conteúdo ou fallback
 */
export async function buscarConteudo(chave: string, fallback: string): Promise<string> {
    // Se estiver em build time, retornar fallback imediatamente
    if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
        // Durante build, não fazer chamadas ao Supabase
        return fallback;
    }

    try {
        // Verificar cache
        const now = Date.now();
        if (conteudosCache && (now - cacheTimestamp) < CACHE_TTL) {
            const cached = conteudosCache.get(chave);
            if (cached !== undefined) {
                return cached;
            }
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return fallback;
        }

        // Buscar do Supabase
        const { data, error } = await supabase
            .from("conteudos")
            .select("texto")
            .eq("chave", chave)
            .single();

        if (error || !data) {
            // Se não encontrar, retornar fallback
            return fallback;
        }

        // Atualizar cache
        if (!conteudosCache) {
            conteudosCache = new Map();
        }
        conteudosCache.set(chave, data.texto);
        cacheTimestamp = now;

        return data.texto;
    } catch (error) {
        // Em caso de erro, retornar fallback
        console.warn(`Erro ao buscar conteúdo "${chave}":`, error);
        return fallback;
    }
}

/**
 * Buscar múltiplos conteúdos de uma vez (otimizado)
 * @param chaves - Array de chaves para buscar
 * @param fallbacks - Objeto com fallbacks para cada chave
 * @returns Objeto com os conteúdos encontrados
 */
export async function buscarConteudos(
    chaves: string[],
    fallbacks: Record<string, string>
): Promise<Record<string, string>> {
    // Se estiver em build time, retornar fallbacks
    if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
        return fallbacks;
    }

    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            return fallbacks;
        }

        // Buscar todos de uma vez
        const { data, error } = await supabase
            .from("conteudos")
            .select("chave, texto")
            .in("chave", chaves);

        if (error || !data) {
            return fallbacks;
        }

        // Montar resultado
        const resultado: Record<string, string> = { ...fallbacks };
        data.forEach((item) => {
            resultado[item.chave] = item.texto;
        });

        // Atualizar cache
        if (!conteudosCache) {
            conteudosCache = new Map();
        }
        data.forEach((item) => {
            conteudosCache!.set(item.chave, item.texto);
        });
        cacheTimestamp = Date.now();

        return resultado;
    } catch (error) {
        console.warn("Erro ao buscar múltiplos conteúdos:", error);
        return fallbacks;
    }
}

/**
 * Limpar cache (útil após atualizações)
 */
export function limparCacheConteudos() {
    conteudosCache = null;
    cacheTimestamp = 0;
}

/**
 * Hook para uso em componentes React (client-side)
 * Retorna o conteúdo com fallback imediato e atualiza quando disponível
 */
export function useConteudo(chave: string, fallback: string): string {
    // Este hook será implementado em um componente separado
    // Por enquanto, retorna fallback para não quebrar build
    return fallback;
}

