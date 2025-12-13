import { NextRequest, NextResponse } from "next/server";
import { listarCasosAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Verificar Autenticação (Bearer Token simplificado)
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        // Validação simples de senha env (mesma do resto do admin)
        if (token !== process.env.ADMIN_SECRET_KEY) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "0");
        const limit = parseInt(searchParams.get("limit") || "50");
        const q = searchParams.get("q") || "";

        const result = await listarCasosAdmin(page, limit, q);

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
