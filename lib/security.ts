import { createHash } from "crypto";

/**
 * Gerar hash SHA-256 dos termos de uso
 * @param textoTermos - texto completo dos termos
 * @returns hash hexadecimal
 */
export function hashTermos(textoTermos: string): string {
    return createHash("sha256").update(textoTermos, "utf8").digest("hex");
}

/**
 * Extrair IP do request (Vercel, Netlify, CloudFlare)
 * @param request - Next.js Request object
 * @returns IP address ou null
 */
export function extrairIP(request: Request): string | null {
    const headers = request.headers;

    // Tentar headers comuns de proxies/CDNs
    const forwardedFor = headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    const realIP = headers.get("x-real-ip");
    if (realIP) {
        return realIP;
    }

    const cfConnectingIP = headers.get("cf-connecting-ip");
    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    return null;
}

/**
 * Extrair User-Agent do request
 * @param request - Next.js Request object
 * @returns User-Agent string ou "unknown"
 */
export function extrairUserAgent(request: Request): string {
    return request.headers.get("user-agent") || "unknown";
}

// Rate limiting in-memory cache
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitCache = new Map<string, RateLimitEntry>();

// Limpar cache periodicamente (evitar memory leak)
setInterval(() => {
    const now = Date.now();
    // Convert to array to avoid TS downlevelIteration issue
    Array.from(rateLimitCache.entries()).forEach(([key, entry]) => {
        if (entry.resetTime < now) {
            rateLimitCache.delete(key);
        }
    });
}, 60000); // Limpar a cada minuto

/**
 * Verificar rate limit por chave (IP ou CPF)
 * @param key - chave única (ip:xxx ou cpf:xxx)
 * @param maxRequests - número máximo de requests
 * @param windowMs - janela de tempo em ms
 * @returns true se dentro do limite, false se excedido
 */
export function verificarRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
): boolean {
    const now = Date.now();
    const entry = rateLimitCache.get(key);

    if (!entry || entry.resetTime < now) {
        // Nova entrada ou expirou
        rateLimitCache.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });
        return true;
    }

    if (entry.count >= maxRequests) {
        return false;
    }

    entry.count++;
    return true;
}

/**
 * Texto dos Termos de Uso (para hash e consentimento)
 */
export const TEXTO_TERMOS = `
TERMOS DE USO E CONSENTIMENTO

Ao preencher este formulário, você declara estar de acordo com os seguintes termos:

1. COLETA DE DADOS: Coletamos seu nome completo, CPF e e-mail para verificar a existência de processos jurídicos em seu nome e para comunicações relacionadas.

2. FINALIDADE: Os dados serão utilizados exclusivamente para identificar oportunidades de restituição ou processos jurídicos em seu favor e entrar em contato sobre os próximos passos.

3. CONSENTIMENTO: Ao marcar esta caixa e clicar em "Confirmar Interesse", você consente expressamente com o tratamento dos seus dados pessoais conforme descrito.

4. DIREITOS LGPD: Você possui o direito de acessar, corrigir, excluir ou solicitar a portabilidade dos seus dados, conforme Lei Geral de Proteção de Dados (Lei 13.709/2018).

5. ARMAZENAMENTO: Seus dados serão armazenados de forma segura e criptografada, com registro de data, hora e IP de acesso para fins de auditoria.

6. COMPARTILHAMENTO: Seus dados não serão compartilhados com terceiros sem sua autorização prévia, exceto quando exigido por lei.

Para exercer seus direitos ou esclarecer dúvidas, entre em contato através dos canais oficiais de Wagner Chaves Advocacia.

Versão: 1.0 | Data: 2025-01-01
`.trim();

export const TERMOS_HASH = hashTermos(TEXTO_TERMOS);
