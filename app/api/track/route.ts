import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { extrairIP, extrairUserAgent } from "@/lib/security";

export const dynamic = 'force-dynamic';

/**
 * POST /api/track
 * Endpoint para registrar eventos de tracking
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            evento_tipo, 
            evento_nome, 
            usuario_id, 
            pagina, 
            metadata 
        } = body;

        // Validações básicas
        if (!evento_tipo || !evento_nome) {
            return NextResponse.json(
                { error: "evento_tipo e evento_nome são obrigatórios" },
                { status: 400 }
            );
        }

        // Sanitizar dados
        const ip = extrairIP(request);
        const userAgent = extrairUserAgent(request);

        // Inserir evento
        const { data, error } = await supabaseServer
            .from("eventos")
            .insert([{
                evento_tipo: String(evento_tipo).substring(0, 50),
                evento_nome: String(evento_nome).substring(0, 100),
                usuario_id: usuario_id ? String(usuario_id).substring(0, 100) : null,
                pagina: pagina ? String(pagina).substring(0, 200) : null,
                metadata: metadata || null,
                ip: ip,
                user_agent: userAgent,
            }])
            .select("id")
            .single();

        if (error) {
            console.error("Erro ao registrar evento:", error);
            return NextResponse.json(
                { error: "Erro ao registrar evento" },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            ok: true, 
            id: data.id 
        });

    } catch (error) {
        console.error("Erro no endpoint /api/track:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

