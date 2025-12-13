import { NextRequest, NextResponse } from "next/server";
import { validarEmail, validarNome, validarComprimento } from "@/lib/validations";
import { gravarConsentimento, verificarRateLimitPersistente, buscarCasoPorEmail, vincularConsentimentoAoCaso } from "@/lib/supabase";
import { extrairIP, extrairUserAgent, verificarRateLimit, TERMOS_HASH } from "@/lib/security";

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

// Rate limit config
const RATE_LIMIT_IP = 10; // 10 requests por hora por IP
const RATE_LIMIT_EMAIL = 5; // 5 requests por hora por Email
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora em ms

/**
 * POST /api/register
 * Endpoint para registrar consentimento e retornar número do processo
 * Campos: nome, email, telefone (sem CPF)
 */
export async function POST(request: NextRequest) {
    try {
        // Extrair dados do request
        const body = await request.json();
        const { nome, email, telefone, hcaptchaToken, campaign: campaignRaw } = body;

        // Sanitizar campaign
        let campaign: string | null = null;
        if (campaignRaw) {
            const sanitized = String(campaignRaw)
                .trim()
                .replace(/[^a-zA-Z0-9_-]/g, "")
                .substring(0, 50);
            campaign = sanitized.length > 0 ? sanitized : null;
        }

        // 1. VALIDAÇÕES DE ENTRADA

        // Validar campos obrigatórios
        if (!nome || !email || !telefone) {
            return NextResponse.json(
                { error: "Todos os campos são obrigatórios." },
                { status: 400 }
            );
        }

        // Validar comprimentos
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

        // Validar email
        if (!validarEmail(email)) {
            return NextResponse.json(
                { error: "E-mail inválido. Por favor, verifique." },
                { status: 400 }
            );
        }

        // Validar telefone (10 ou 11 dígitos)
        const telefoneLimpo = String(telefone).replace(/\D/g, "");
        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            return NextResponse.json(
                { error: "Telefone inválido. Use DDD + número." },
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

        // 3. VALIDAÇÃO DE IP
        const ip = extrairIP(request);

        if (!ip) {
            console.warn("⚠️ Request rejeitado: IP não identificado");
            return NextResponse.json(
                { error: "Não foi possível identificar sua origem. Por favor, tente novamente." },
                { status: 400 }
            );
        }

        // 4. RATE LIMITING

        // Rate limit por IP
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
            console.error("Erro no rate limiting persistente, usando fallback:", error);
            if (!verificarRateLimit(`ip:${ip}`, RATE_LIMIT_IP, RATE_LIMIT_WINDOW)) {
                return NextResponse.json(
                    { error: "Muitas tentativas deste IP. Por favor, aguarde 1 hora." },
                    { status: 429 }
                );
            }
        }

        // Rate limit por Email (substituindo CPF)
        const emailLower = email.trim().toLowerCase();
        try {
            const emailAllowed = await verificarRateLimitPersistente(
                `email:${emailLower}`,
                RATE_LIMIT_EMAIL,
                RATE_LIMIT_WINDOW
            );
            if (!emailAllowed) {
                return NextResponse.json(
                    { error: "Muitas tentativas com este e-mail. Por favor, aguarde 1 hora." },
                    { status: 429 }
                );
            }
        } catch (error) {
            console.error("Erro no rate limiting persistente, usando fallback:", error);
            if (!verificarRateLimit(`email:${emailLower}`, RATE_LIMIT_EMAIL, RATE_LIMIT_WINDOW)) {
                return NextResponse.json(
                    { error: "Muitas tentativas com este e-mail. Por favor, aguarde 1 hora." },
                    { status: 429 }
                );
            }
        }

        // 5. BUSCAR PROCESSO NO BANCO (POR EMAIL)
        let numeroProcesso: string | null = null;
        let casoEncontradoId: string | null = null;

        try {
            const caso = await buscarCasoPorEmail(emailLower);

            if (caso) {
                numeroProcesso = caso.NUMERO_PROCESSO;
                casoEncontradoId = caso.id;
                console.log("✅ Caso encontrado:", { id: caso.id, processo: numeroProcesso });
            }
        } catch (error) {
            console.error("Erro ao buscar caso:", error);
            // Não retornar erro ao usuário - continuar com null
        }

        // 6. GRAVAR CONSENTIMENTO
        const userAgent = extrairUserAgent(request);

        try {
            const consentimentoId = await gravarConsentimento({
                cpf: "", // Campo vazio, não pedimos mais CPF
                nome_fornecido: nome.trim(),
                email_fornecido: emailLower,
                telefone: telefoneLimpo,
                aceitou_termos: true,
                termos_hash: TERMOS_HASH,
                ip: ip,
                user_agent: userAgent,
                source_campaign: campaign || "direct",
            });

            console.log("✅ Consentimento gravado com sucesso. ID:", consentimentoId);

            // VINCULAR AO CASO SE ENCONTRADO
            if (casoEncontradoId) {
                await vincularConsentimentoAoCaso(casoEncontradoId, consentimentoId);
                console.log("✅ Consentimento vinculado ao caso:", casoEncontradoId);
            }

        } catch (error: any) {
            console.error("❌ Erro ao gravar consentimento:", error?.message);
            return NextResponse.json(
                { error: "Erro ao processar solicitação. Por favor, tente novamente." },
                { status: 500 }
            );
        }

        // 7. RETORNAR RESPOSTA
        const response = NextResponse.json({
            ok: true,
            numero_processo: numeroProcesso,
        });

        // Headers de segurança
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("X-Frame-Options", "DENY");
        response.headers.set("X-XSS-Protection", "1; mode=block");
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

        // CORS
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

// Método OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get("origin");

    const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        "http://localhost:3000",
        "https://localhost:3000",
    ].filter(Boolean) as string[];

    const isAllowedOrigin = origin && allowedOrigins.some(allowed =>
        origin === allowed || origin.startsWith(allowed)
    );

    const allowOrigin = isAllowedOrigin
        ? origin
        : (process.env.NODE_ENV === "development" && origin)
            ? origin
            : (process.env.NEXT_PUBLIC_APP_URL || null);

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
                "Access-Control-Max-Age": "86400",
            },
        }
    );
}
