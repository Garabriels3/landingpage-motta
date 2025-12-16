import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/casos/[id]
 * Atualiza campos específicos de um caso
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // 1. Autenticação Admin
        const adminSecret = process.env.ADMIN_SECRET_KEY;
        const cookieStore = cookies();
        const cookieToken = cookieStore.get("admin_token")?.value;
        const authHeader = request.headers.get("authorization");
        const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (cookieToken !== adminSecret && headerToken !== adminSecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Setup Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 3. Parse Body
        const body = await request.json();
        const { ADVOGADO_REU } = body;

        // Por enquanto, só permitimos atualizar ADVOGADO_REU, mas pode ser expandido
        const updateData: any = {};

        if (typeof ADVOGADO_REU !== 'undefined') {
            updateData.ADVOGADO_REU = ADVOGADO_REU;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        // 4. Update Database
        const { data, error } = await supabase
            .from("casos")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Erro ao atualizar caso:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error("Erro na API de update:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
