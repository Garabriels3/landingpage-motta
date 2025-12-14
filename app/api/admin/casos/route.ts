import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listarCasosAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Verificar Autenticação (Cookie ou Bearer)
        const adminSecret = process.env.ADMIN_SECRET_KEY;
        const cookieStore = cookies();
        const cookieToken = cookieStore.get("admin_token")?.value;
        const authHeader = request.headers.get("authorization");
        const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (cookieToken !== adminSecret && headerToken !== adminSecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "0");
        const limit = parseInt(searchParams.get("limit") || "50");
        const q = searchParams.get("q") || "";
        const filtroAdvogado = searchParams.get("advogado") as 'todos' | 'com_advogado' | 'sem_advogado' || 'todos';
        const filtroConsentimento = searchParams.get("consentimento") as 'todos' | 'com_consentimento' | 'sem_consentimento' || 'todos';
        const filtroTipoPessoa = searchParams.get("tipo_pessoa") as 'todos' | 'pessoa_fisica' | 'pessoa_juridica' || 'todos';
        const dataInicio = searchParams.get("data_inicio") || "";
        const dataFim = searchParams.get("data_fim") || "";

        const result = await listarCasosAdmin(page, limit, q, filtroAdvogado, filtroConsentimento, filtroTipoPessoa, dataInicio, dataFim);

        return NextResponse.json({
            data: result.data,
            total: result.count,
            page,
            limit
        }, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });

    } catch (error) {
        console.error("Erro na API de casos admin:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
