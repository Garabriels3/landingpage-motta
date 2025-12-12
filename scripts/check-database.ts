/**
 * Script para verificar se as tabelas do banco de dados estão criadas
 * Execute com: npx tsx scripts/check-database.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Erro: Variáveis de ambiente não configuradas!");
    console.error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_KEY no arquivo .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verificarTabelas() {
    console.log("🔍 Verificando banco de dados Supabase...\n");
    console.log(`📡 URL: ${supabaseUrl}\n`);

    try {
        // Verificar tabela 'processos'
        console.log("1️⃣ Verificando tabela 'processos'...");
        const { data: processos, error: errorProcessos } = await supabase
            .from("processos")
            .select("id", { count: "exact", head: true });

        if (errorProcessos) {
            if (errorProcessos.code === "42P01") {
                console.log("   ❌ Tabela 'processos' NÃO existe!");
            } else {
                console.log(`   ⚠️  Erro ao verificar: ${errorProcessos.message}`);
            }
        } else {
            console.log(`   ✅ Tabela 'processos' existe!`);
            console.log(`   📊 Total de registros: ${processos?.length || 0}`);
        }

        // Verificar tabela 'consentimentos'
        console.log("\n2️⃣ Verificando tabela 'consentimentos'...");
        const { data: consentimentos, error: errorConsentimentos } = await supabase
            .from("consentimentos")
            .select("id", { count: "exact", head: true });

        if (errorConsentimentos) {
            if (errorConsentimentos.code === "42P01") {
                console.log("   ❌ Tabela 'consentimentos' NÃO existe!");
            } else {
                console.log(`   ⚠️  Erro ao verificar: ${errorConsentimentos.message}`);
            }
        } else {
            console.log(`   ✅ Tabela 'consentimentos' existe!`);
            console.log(`   📊 Total de registros: ${consentimentos?.length || 0}`);
        }

        // Verificar estrutura da tabela processos
        console.log("\n3️⃣ Verificando estrutura da tabela 'processos'...");
        const { data: sampleProcesso, error: errorSample } = await supabase
            .from("processos")
            .select("*")
            .limit(1)
            .single();

        if (!errorSample && sampleProcesso) {
            console.log("   ✅ Estrutura correta!");
            console.log("   📋 Colunas encontradas:", Object.keys(sampleProcesso).join(", "));
        } else if (errorSample && errorSample.code !== "PGRST116") {
            console.log(`   ⚠️  Erro: ${errorSample.message}`);
        }

        // Verificar estrutura da tabela consentimentos
        console.log("\n4️⃣ Verificando estrutura da tabela 'consentimentos'...");
        const { data: sampleConsentimento, error: errorSampleCons } = await supabase
            .from("consentimentos")
            .select("*")
            .limit(1)
            .single();

        if (!errorSampleCons && sampleConsentimento) {
            console.log("   ✅ Estrutura correta!");
            console.log("   📋 Colunas encontradas:", Object.keys(sampleConsentimento).join(", "));
        } else if (errorSampleCons && errorSampleCons.code !== "PGRST116") {
            console.log(`   ⚠️  Erro: ${errorSampleCons.message}`);
        }

        console.log("\n✅ Verificação concluída!");

    } catch (error: any) {
        console.error("\n❌ Erro ao verificar banco de dados:", error.message);
        process.exit(1);
    }
}

verificarTabelas();


