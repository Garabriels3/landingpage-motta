import { NextRequest, NextResponse } from "next/server";
import { listarConsentimentos } from "@/lib/supabase";

// Forçar renderização dinâmica (usa request.headers)
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/export
 * Endpoint protegido para exportar consentimentos (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        // Verificar autenticação
        const authHeader = request.headers.get("authorization");
        const adminSecret = process.env.ADMIN_SECRET_KEY;

        if (!adminSecret) {
            return NextResponse.json(
                { error: "Admin não configurado." },
                { status: 500 }
            );
        }

        const expectedAuth = `Bearer ${adminSecret}`;

        if (!authHeader || authHeader !== expectedAuth) {
            return NextResponse.json(
                { error: "Não autorizado." },
                { status: 401 }
            );
        }

        // Buscar consentimentos
        const consentimentos = await listarConsentimentos();

        // Gerar CSV
        const csvHeader = "ID,CPF_Mascarado,Nome,Email,Created_At,IP,Campaign\n";
        const csvRows = consentimentos.map((c) => {
            const cpfMascarado = c.cpf ? `***.***.***-${c.cpf.slice(-2)}` : "N/A";
            const created = c.created_at ? new Date(c.created_at).toISOString() : "";

            return [
                c.id,
                cpfMascarado,
                c.nome_fornecido,
                c.email_fornecido,
                created,
                c.ip || "",
                c.source_campaign || "",
            ]
                .map((field) => `"${String(field).replace(/"/g, '""')}"`)
                .join(",");
        });

        const csv = csvHeader + csvRows.join("\n");

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="consentimentos_${Date.now()}.csv"`,
            },
        });
    } catch (error) {
        console.error("Erro no endpoint /api/admin/export:", error);
        return NextResponse.json(
            { error: "Erro ao exportar dados." },
            { status: 500 }
        );
    }
}
