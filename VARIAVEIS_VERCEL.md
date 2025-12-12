# 🔐 Variáveis de Ambiente para Vercel

## Variáveis Obrigatórias

Adicione estas variáveis no Vercel: **Settings > Environment Variables**

---

### 1. `NEXT_PUBLIC_SUPABASE_URL`
**Onde pegar:**
- Dashboard Supabase → **Settings** → **API**
- Copie o campo **Project URL**
- Exemplo: `https://fitszafumzpsqmcnhnoj.supabase.co`

**Valor:** Cole a URL completa do seu projeto Supabase

---

### 2. `SUPABASE_SERVICE_KEY`
**Onde pegar:**
- Dashboard Supabase → **Settings** → **API**
- Role: **service_role** (não use a anon key!)
- Clique em **Reveal** para mostrar a chave
- Copie a chave completa (é longa, começa com `eyJ...`)

**Valor:** Cole a service_role key completa

⚠️ **IMPORTANTE:** Esta é uma chave secreta! Nunca exponha no frontend.

---

### 3. `NEXT_PUBLIC_HCAPTCHA_SITEKEY`
**Onde pegar:**
1. Acesse https://www.hcaptcha.com
2. Faça login (crie conta se necessário - free tier)
3. Vá em **Sites** → **Add New Site**
4. Configure:
   - **Label:** Nome do site (ex: "Motta Advocacia")
   - **Domains:** Adicione seu domínio (ex: `seu-site.vercel.app` e `www.seu-site.com`)
5. Clique em **Submit**
6. Copie o **Site Key** (começa com algo como `10000000-...`)

**Valor:** Cole a Site Key do hCaptcha

---

### 4. `HCAPTCHA_SECRET`
**Onde pegar:**
- No mesmo painel do hCaptcha onde você copiou a Site Key
- Procure por **Secret Key** (geralmente fica abaixo da Site Key)
- Clique em **Reveal** se necessário
- Copie a Secret Key completa

**Valor:** Cole a Secret Key do hCaptcha

---

### 5. `NEXT_PUBLIC_WHATSAPP_NUMBER`
**Onde pegar:**
- Número do WhatsApp do escritório
- Formato: código do país + DDD + número (sem espaços, sem caracteres especiais)
- Exemplo: `5511999999999` (Brasil: 55, SP: 11, número: 999999999)

**Valor:** Número do WhatsApp no formato internacional

---

### 6. `ADMIN_SECRET_KEY`
**Onde pegar:**
- **Você cria esta chave!** É uma senha secreta para acessar o endpoint de exportação
- Gere uma senha forte (ex: use um gerador de senhas)
- Exemplo: `admin_secret_2025_motta_advocacia_xyz123`

**Valor:** Uma senha secreta forte que você escolher

**Uso:** Para exportar consentimentos via `/api/admin/export`

---

## Variáveis Opcionais (mas recomendadas)

### 7. `NEXT_PUBLIC_CAMPAIGN_NAME` (Opcional)
**Onde pegar:**
- Você define o nome da campanha padrão
- Exemplo: `campanha-inicial-2025` ou `motta-advocacia-launch`

**Valor:** Nome da campanha padrão (se não usar parâmetro na URL)

---

### 8. `NEXT_PUBLIC_APP_URL` (Opcional)
**Onde pegar:**
- URL do seu site no Vercel
- Exemplo: `https://seu-site.vercel.app` ou `https://www.seu-dominio.com`

**Valor:** URL completa do site (com https://)

---

## 📋 Checklist de Configuração no Vercel

1. ✅ Acesse https://vercel.com
2. ✅ Vá no seu projeto
3. ✅ Clique em **Settings**
4. ✅ Clique em **Environment Variables**
5. ✅ Adicione cada variável acima:
   - **Name:** Nome exato da variável (copie e cole)
   - **Value:** Valor da variável
   - **Environment:** Selecione **Production**, **Preview** e **Development**
6. ✅ Clique em **Save**
7. ✅ Faça um novo deploy (ou aguarde o próximo)

---

## 🔍 Como Verificar se Está Funcionando

Após configurar e fazer deploy:

1. Acesse seu site no Vercel
2. Abra o console do navegador (F12)
3. Verifique se não há erros relacionados a:
   - Supabase (erro de conexão)
   - hCaptcha (erro de sitekey)
4. Teste o formulário completo

---

## ⚠️ Importante

- **NEXT_PUBLIC_*** = Variáveis que ficam expostas no frontend (podem ser vistas no código)
- **Sem NEXT_PUBLIC_** = Variáveis secretas (só no servidor)
- **SUPABASE_SERVICE_KEY** e **HCAPTCHA_SECRET** são SECRETAS - nunca exponha!
- Após adicionar variáveis, faça um novo deploy

---

## 🆘 Problemas Comuns

**Erro: "Missing Supabase environment variables"**
- Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_KEY` estão configuradas
- Certifique-se de que selecionou todos os ambientes (Production, Preview, Development)

**hCaptcha não aparece:**
- Verifique se `NEXT_PUBLIC_HCAPTCHA_SITEKEY` está configurada
- Verifique se o domínio está registrado no hCaptcha

**Erro ao buscar processo:**
- Verifique se `SUPABASE_SERVICE_KEY` é a **service_role** key (não a anon key)
- Verifique se as tabelas existem no Supabase


