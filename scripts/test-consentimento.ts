/**
 * Script para testar a inserção de um consentimento no Supabase
 * Execute com: npx tsx scripts/test-consentimento.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { TERMOS_HASH } from "../lib/security";

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Erro: Variáveis de ambiente não configuradas!");
    console.error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_KEY no arquivo .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function testarInsercao() {
    console.log("🧪 Testando inserção de consentimento...\n");
    console.log(`📡 URL: ${supabaseUrl}\n`);

    // Dados de teste
    const consentimentoTeste = {
        cpf: "12345678900",
        nome_fornecido: "Teste Usuario",
        email_fornecido: "teste@example.com",
        aceitou_termos: true,
        termos_hash: TERMOS_HASH,
        ip: "127.0.0.1",
        user_agent: "Test Script",
        source_campaign: "teste-script",
    };

    console.log("📝 Dados que serão inseridos:");
    console.log(JSON.stringify(consentimentoTeste, null, 2));
    console.log("\n");

    try {
        // Tentar inserir
        console.log("🔄 Tentando inserir...");
        const { data, error } = await supabase
            .from("consentimentos")
            .insert([consentimentoTeste])
            .select("id")
            .single();

        if (error) {
            console.error("❌ Erro ao inserir:");
            console.error("   Mensagem:", error.message);
            console.error("   Código:", error.code);
            console.error("   Detalhes:", error.details);
            console.error("   Hint:", error.hint);
            
            // Verificar se é erro de RLS
            if (error.code === "42501" || error.message.includes("permission denied") || error.message.includes("row-level security")) {
                console.error("\n⚠️  PROBLEMA IDENTIFICADO: Row Level Security (RLS) está bloqueando a inserção!");
                console.error("   Mesmo usando service_role key, o RLS pode estar bloqueando.");
                console.error("   Verifique as policies no Supabase Dashboard:");
                console.error("   - Authentication > Policies > consentimentos");
                console.error("\n   Solução: A policy deve permitir service_role:");
                console.error("   CREATE POLICY \"Service role can insert\" ON consentimentos");
                console.error("   FOR INSERT WITH CHECK (auth.role() = 'service_role');");
            }
            
            process.exit(1);
        }

        if (!data || !data.id) {
            console.error("❌ Inserção retornou sem ID!");
            process.exit(1);
        }

        console.log("✅ Consentimento inserido com sucesso!");
        console.log("   ID:", data.id);
        console.log("\n");

        // Verificar se realmente foi salvo
        console.log("🔍 Verificando se o registro foi salvo...");
        const { data: verificado, error: errorVerificacao } = await supabase
            .from("consentimentos")
            .select("*")
            .eq("id", data.id)
            .single();

        if (errorVerificacao) {
            console.error("❌ Erro ao verificar registro:", errorVerificacao.message);
            process.exit(1);
        }

        if (verificado) {
            console.log("✅ Registro encontrado no banco!");
            console.log("   CPF:", verificado.cpf);
            console.log("   Nome:", verificado.nome_fornecido);
            console.log("   Email:", verificado.email_fornecido);
            console.log("   Criado em:", verificado.created_at);
        } else {
            console.error("❌ Registro não encontrado após inserção!");
            process.exit(1);
        }

        // Limpar o registro de teste
        console.log("\n🧹 Removendo registro de teste...");
        const { error: errorDelete } = await supabase
            .from("consentimentos")
            .delete()
            .eq("id", data.id);

        if (errorDelete) {
            console.error("⚠️  Aviso: Não foi possível remover o registro de teste:", errorDelete.message);
        } else {
            console.log("✅ Registro de teste removido.");
        }

        console.log("\n✅ Teste concluído com sucesso!");

    } catch (error: any) {
        console.error("\n❌ Erro inesperado:", error.message);
        console.error(error);
        process.exit(1);
    }
}

testarInsercao();

