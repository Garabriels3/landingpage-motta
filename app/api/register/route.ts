import { NextRequest, NextResponse } from "next/server";
import { validarCPF, validarEmail, validarNome, validarComprimento, limparCPF } from "@/lib/validations";
import { buscarProcessoPorCPF, gravarConsentimento, verificarRateLimitPersistente } from "@/lib/supabase";
import { extrairIP, extrairUserAgent, verificarRateLimit, TERMOS_HASH } from "@/lib/security";

// Forçar renderização dinâmica (usa request.headers e request.json)
export const dynamic = 'force-dynamic';

// Rate limit config
const RATE_LIMIT_IP = 10; // 10 requests por hora por IP
const RATE_LIMIT_CPF = 3; // 3 requests por hora por CPF
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora em ms

/**
 * POST /api/register
 * Endpoint para registrar consentimento e retornar número do processo
 */
export async function POST(request: NextRequest) {
    try {
        // Extrair dados do request
        const body = await request.json();
        const { nome, cpf, email, hcaptchaToken, campaign: campaignRaw } = body;
        
        // Sanitizar e validar campaign (prevenção de injection)
        let campaign: string | null = null;
        if (campaignRaw) {
            // Permitir apenas letras, números, hífens e underscores, máximo 50 caracteres
            const sanitized = String(campaignRaw)
                .trim()
                .replace(/[^a-zA-Z0-9_-]/g, "")
                .substring(0, 50);
            campaign = sanitized.length > 0 ? sanitized : null;
        }

        // 1. VALIDAÇÕES DE ENTRADA

        // Validar campos obrigatórios
        if (!nome || !cpf || !email) {
            return NextResponse.json(
                { error: "Todos os campos são obrigatórios." },
                { status: 400 }
            );
        }

        // Validar comprimentos (prevenção de injection)
        if (!validarComprimento(nome, 100) || !validarComprimento(email, 100)) {
            return NextResponse.json(
                { error: "Dados fornecidos excedem o tamanho permitido." },
                { status: 400 }
            );
        }

        // Validar nome
        if (!validarNome(nome)) {
            return NextResponse.json(
                { error: "Nome inválido. Por favor, verifique." },
                { status: 400 }
            );
        }

        // Validar CPF
        const cpfLimpo = limparCPF(cpf);
        if (!validarCPF(cpfLimpo)) {
            return NextResponse.json(
                { error: "CPF inválido. Verifique os números digitados." },
                { status: 400 }
            );
        }

        // Validar email
        if (!validarEmail(email)) {
            return NextResponse.json(
                { error: "E-mail inválido. Por favor, verifique." },
                { status: 400 }
            );
        }

        // 2. VERIFICAR HCAPTCHA
        if (!hcaptchaToken) {
            return NextResponse.json(
                { error: "Verificação de segurança não completada." },
                { status: 400 }
            );
        }

        const hcaptchaSecret = process.env.HCAPTCHA_SECRET;
        if (!hcaptchaSecret) {
            console.error("HCAPTCHA_SECRET não configurado");
            return NextResponse.json(
                { error: "Erro de configuração do servidor." },
                { status: 500 }
            );
        }

        // Verificar token do hCaptcha
        const hcaptchaResponse = await fetch("https://hcaptcha.com/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `response=${hcaptchaToken}&secret=${hcaptchaSecret}`,
        });

        const hcaptchaData = await hcaptchaResponse.json();

        if (!hcaptchaData.success) {
            return NextResponse.json(
                { error: "Verificação de segurança falhou. Por favor, tente novamente." },
                { status: 400 }
            );
        }

        // 3. VALIDAÇÃO DE IP (SEGURANÇA)

        const ip = extrairIP(request);
        
        // Rejeitar requests sem IP válido (proteção contra bots)
        if (!ip) {
            console.warn("⚠️ Request rejeitado: IP não identificado", {
                headers: Object.fromEntries(request.headers.entries())
            });
            return NextResponse.json(
                { error: "Não foi possível identificar sua origem. Por favor, tente novamente." },
                { status: 400 }
            );
        }

        // 4. RATE LIMITING (PERSISTENTE)

        // Rate limit por IP (persistente no banco)
        try {
            const ipAllowed = await verificarRateLimitPersistente(
                `ip:${ip}`,
                RATE_LIMIT_IP,
                RATE_LIMIT_WINDOW
            );
            
            if (!ipAllowed) {
                return NextResponse.json(
                    { error: "Muitas tentativas deste IP. Por favor, aguarde 1 hora." },
                    { status: 429 }
                );
            }
        } catch (error) {
            // Fallback para rate limiting em memória se persistente falhar
            console.error("Erro no rate limiting persistente, usando fallback:", error);
            if (!verificarRateLimit(`ip:${ip}`, RATE_LIMIT_IP, RATE_LIMIT_WINDOW)) {
                return NextResponse.json(
                    { error: "Muitas tentativas deste IP. Por favor, aguarde 1 hora." },
                    { status: 429 }
                );
            }
        }

        // Rate limit por CPF (persistente no banco)
        try {
            const cpfAllowed = await verificarRateLimitPersistente(
                `cpf:${cpfLimpo}`,
                RATE_LIMIT_CPF,
                RATE_LIMIT_WINDOW
            );
            
            if (!cpfAllowed) {
                return NextResponse.json(
                    { error: "Muitas tentativas com este CPF. Por favor, aguarde 1 hora." },
                    { status: 429 }
                );
            }
        } catch (error) {
            // Fallback para rate limiting em memória se persistente falhar
            console.error("Erro no rate limiting persistente, usando fallback:", error);
            if (!verificarRateLimit(`cpf:${cpfLimpo}`, RATE_LIMIT_CPF, RATE_LIMIT_WINDOW)) {
                return NextResponse.json(
                    { error: "Muitas tentativas com este CPF. Por favor, aguarde 1 hora." },
                    { status: 429 }
                );
            }
        }

        // 5. BUSCAR PROCESSO NO BANCO

        let numeroProcesso: string | null = null;

        try {
            const processo = await buscarProcessoPorCPF(cpfLimpo);
            numeroProcesso = processo ? processo.numero_processo : null;
        } catch (error) {
            console.error("Erro ao buscar processo:", error);
            // Não retornar erro ao usuário - continuar com null
        }

        // 6. GRAVAR CONSENTIMENTO (APPEND-ONLY)

        const userAgent = extrairUserAgent(request);

        try {
            const consentimentoId = await gravarConsentimento({
                cpf: cpfLimpo,
                nome_fornecido: nome.trim(),
                email_fornecido: email.trim().toLowerCase(),
                aceitou_termos: true,
                termos_hash: TERMOS_HASH,
                ip: ip,
                user_agent: userAgent,
                source_campaign: campaign || "direct",
            });
            
            // Log de sucesso para debug
            console.log("✅ Consentimento gravado com sucesso. ID:", consentimentoId);
        } catch (error: any) {
            // Log detalhado do erro
            console.error("❌ Erro ao gravar consentimento:");
            console.error("   Mensagem:", error?.message);
            console.error("   Código:", error?.code);
            console.error("   Detalhes:", error?.details);
            console.error("   Hint:", error?.hint);
            console.error("   Erro completo:", JSON.stringify(error, null, 2));
            
            return NextResponse.json(
                { 
                    error: "Erro ao processar solicitação. Por favor, tente novamente.",
                    debug: process.env.NODE_ENV === "development" ? {
                        message: error?.message,
                        code: error?.code,
                        details: error?.details
                    } : undefined
                },
                { status: 500 }
            );
        }

        // 7. RETORNAR RESPOSTA

        // Adicionar headers de segurança na resposta
        const response = NextResponse.json({
            ok: true,
            numero_processo: numeroProcesso,
        });

        // Headers de segurança
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("X-Frame-Options", "DENY");
        response.headers.set("X-XSS-Protection", "1; mode=block");
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

        // CORS apenas para origem permitida
        const origin = request.headers.get("origin");
        const allowedOrigins = [
            process.env.NEXT_PUBLIC_APP_URL,
            "http://localhost:3000",
            "https://localhost:3000",
        ].filter(Boolean) as string[];

        const isAllowedOrigin = origin && allowedOrigins.some(allowed => 
            origin === allowed || origin.startsWith(allowed)
        );

        if (isAllowedOrigin) {
            response.headers.set("Access-Control-Allow-Origin", origin);
        }

        return response;

    } catch (error) {
        console.error("Erro no endpoint /api/register:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor." },
            { status: 500 }
        );
    }
}

// Método OPTIONS para CORS (se necessário)
export async function OPTIONS(request: NextRequest) {
    // Obter origem da requisição
    const origin = request.headers.get("origin");
    
    // Lista de origens permitidas
    const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        "http://localhost:3000",
        "https://localhost:3000",
    ].filter(Boolean) as string[];

    // Verificar se a origem é permitida
    const isAllowedOrigin = origin && allowedOrigins.some(allowed => 
        origin === allowed || origin.startsWith(allowed)
    );

    // Se não houver NEXT_PUBLIC_APP_URL configurado, usar origem da requisição (apenas em dev)
    const allowOrigin = isAllowedOrigin 
        ? origin 
        : (process.env.NODE_ENV === "development" && origin)
            ? origin
            : (process.env.NEXT_PUBLIC_APP_URL || null);

    // Se nenhuma origem permitida, não retornar header CORS (bloqueia requisições cross-origin)
    if (!allowOrigin) {
        return NextResponse.json(
            { error: "CORS não configurado" },
            { status: 403 }
        );
    }

    return NextResponse.json(
        {},
        {
            headers: {
                "Access-Control-Allow-Origin": allowOrigin,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400", // 24 horas
            },
        }
    );
}
