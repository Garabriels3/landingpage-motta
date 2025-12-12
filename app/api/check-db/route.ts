import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// Forçar renderização dinâmica (usa Supabase)
export const dynamic = 'force-dynamic';

/**
 * GET /api/check-db
 * Rota temporária para verificar se as tabelas do banco estão criadas
 */
export async function GET() {
    try {
        const resultados: any = {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL || "Não configurado",
            tabelas: {},
            status: "ok"
        };

        // Verificar tabela 'processos'
        try {
            const { data: processos, error, count } = await supabaseServer
                .from("processos")
                .select("id", { count: "exact", head: true });

            if (error) {
                if (error.code === "42P01") {
                    resultados.tabelas.processos = {
                        existe: false,
                        erro: "Tabela não encontrada"
                    };
                } else {
                    resultados.tabelas.processos = {
                        existe: false,
                        erro: error.message
                    };
                }
            } else {
                resultados.tabelas.processos = {
                    existe: true,
                    totalRegistros: count || 0
                };
            }
        } catch (error: any) {
            resultados.tabelas.processos = {
                existe: false,
                erro: error.message
            };
        }

        // Verificar tabela 'consentimentos'
        try {
            const { data: consentimentos, error, count } = await supabaseServer
                .from("consentimentos")
                .select("id", { count: "exact", head: true });

            if (error) {
                if (error.code === "42P01") {
                    resultados.tabelas.consentimentos = {
                        existe: false,
                        erro: "Tabela não encontrada"
                    };
                } else {
                    resultados.tabelas.consentimentos = {
                        existe: false,
                        erro: error.message
                    };
                }
            } else {
                resultados.tabelas.consentimentos = {
                    existe: true,
                    totalRegistros: count || 0
                };
            }
        } catch (error: any) {
            resultados.tabelas.consentimentos = {
                existe: false,
                erro: error.message
            };
        }

        // Verificar estrutura (pegar uma amostra)
        if (resultados.tabelas.processos.existe) {
            try {
                const { data: sample } = await supabaseServer
                    .from("processos")
                    .select("*")
                    .limit(1)
                    .single();

                if (sample) {
                    resultados.tabelas.processos.colunas = Object.keys(sample);
                }
            } catch (error) {
                // Ignorar erro se não houver registros
            }
        }

        if (resultados.tabelas.consentimentos.existe) {
            try {
                const { data: sample } = await supabaseServer
                    .from("consentimentos")
                    .select("*")
                    .limit(1)
                    .single();

                if (sample) {
                    resultados.tabelas.consentimentos.colunas = Object.keys(sample);
                }
            } catch (error) {
                // Ignorar erro se não houver registros
            }
        }

        return NextResponse.json(resultados, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            {
                status: "erro",
                mensagem: error.message,
                url: process.env.NEXT_PUBLIC_SUPABASE_URL || "Não configurado"
            },
            { status: 500 }
        );
    }
}

