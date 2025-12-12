import { NextRequest, NextResponse } from "next/server";
import { validarCPF, validarEmail, validarNome, validarComprimento, limparCPF } from "@/lib/validations";
import { buscarProcessoPorCPF, gravarConsentimento } from "@/lib/supabase";
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
        const { nome, cpf, email, hcaptchaToken, campaign } = body;

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

        // 3. RATE LIMITING

        const ip = extrairIP(request) || "unknown";

        // Rate limit por IP
        if (!verificarRateLimit(`ip:${ip}`, RATE_LIMIT_IP, RATE_LIMIT_WINDOW)) {
            return NextResponse.json(
                { error: "Muitas tentativas deste IP. Por favor, aguarde 1 hora." },
                { status: 429 }
            );
        }

        // Rate limit por CPF
        if (!verificarRateLimit(`cpf:${cpfLimpo}`, RATE_LIMIT_CPF, RATE_LIMIT_WINDOW)) {
            return NextResponse.json(
                { error: "Muitas tentativas com este CPF. Por favor, aguarde 1 hora." },
                { status: 429 }
            );
        }

        // 4. BUSCAR PROCESSO NO BANCO

        let numeroProcesso: string | null = null;

        try {
            const processo = await buscarProcessoPorCPF(cpfLimpo);
            numeroProcesso = processo ? processo.numero_processo : null;
        } catch (error) {
            console.error("Erro ao buscar processo:", error);
            // Não retornar erro ao usuário - continuar com null
        }

        // 5. GRAVAR CONSENTIMENTO (APPEND-ONLY)

        const userAgent = extrairUserAgent(request);

        try {
            await gravarConsentimento({
                cpf: cpfLimpo,
                nome_fornecido: nome.trim(),
                email_fornecido: email.trim().toLowerCase(),
                aceitou_termos: true,
                termos_hash: TERMOS_HASH,
                ip: ip,
                user_agent: userAgent,
                source_campaign: campaign || "direct",
            });
        } catch (error) {
            console.error("Erro ao gravar consentimento:", error);
            return NextResponse.json(
                { error: "Erro ao processar solicitação. Por favor, tente novamente." },
                { status: 500 }
            );
        }

        // 6. RETORNAR RESPOSTA

        return NextResponse.json({
            ok: true,
            numero_processo: numeroProcesso,
        });

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
    return NextResponse.json(
        {},
        {
            headers: {
                "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        }
    );
}
