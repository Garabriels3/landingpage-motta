# Motta Advocacia - Landing Page Segura

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Supabase](https://img.shields.io/badge/Supabase-Postgres-green) ![License](https://img.shields.io/badge/License-Private-red)

Sistema completo de landing page para escritório de advocacia com backend serverless seguro, registro de consentimento LGPD, e custo zero (free tiers).

## 📋 Visão Geral

Este projeto implementa uma landing page que:
- ✅ Recebe tráfego de campanhas por email (mala direta)
- ✅ Coleta dados do usuário (nome, CPF, email) com consentimento explícito
- ✅ Retorna número de processo jurídico após validação
- ✅ Registra consentimento imut ável para compliance LGPD
- ✅ Protege dados sensíveis (CPF não exposto no frontend)
- ✅ Implementa rate limiting e CAPTCHA anti-abuse
- ✅ 100% gratuito (Vercel + Supabase free tiers)

## 🏗️ Arquitetura

```mermaid
graph TD
    A[Email Campaign] -->|Link com token| B[Landing Page]
    B --> C{Formulário}
    C -->|Nome, CPF, Email| D[hCaptcha]
    D --> E[API /register]
    E --> F{Validações}
    F --> G[Rate Limit]
    G --> H[Supabase Lookup]
    H --> I[Grava Consentimento]
    I --> J{CPF encontrado?}
    J -->|Sim| K[Página Confirmação c/ Número]
    J -->|Não| L[Página Confirmação s/ Número]
    K --> M[WhatsApp CTA]
    L --> M
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+ instalado
- Conta Supabase (free tier)
- Conta hCaptcha (free tier)
- Conta Vercel (free tier)

### 1. Clone e Instale

```bash
git clone <repository-url>
cd landingpage-motta
npm install
```

### 2. Configure Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha as variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-service-key-aqui

# hCaptcha
NEXT_PUBLIC_HCAPTCHA_SITEKEY=sua-sitekey
HCAPTCHA_SECRET=seu-secret

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999

# Admin
ADMIN_SECRET_KEY=sua-chave-forte-aqui

# Opcional
CAMPAIGN_NAME=campanha-nov-2025
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure Supabase

**3.1. Crie um projeto Supabase:**
- Acesse [supabase.com](https://supabase.com)
- Crie novo projeto (escolha região mais próxima)
- Aguarde provisionamento (~2 minutos)

**3.2. Execute o schema SQL:**
- No dashboard Supabase, vá em "SQL Editor"
- Abra o arquivo `db/schema.sql` deste repositório
- Cole todo o conteúdo e clique "Run"
- Verifique que as tabelas `processos` e `consentimentos` foram criadas

**3.3. Importe os dados de processos:**

**Opção A - Via Dashboard (simples):**
- Vá em "Table Editor" → `processos`
- Clique "Insert" → "Import CSV"
- Selecione `db/processos.csv`
- Mapeie as colunas (cpf, numero_processo, origem)
- Importe

**Opção B - Via Script (recomendado para muitos registros):**

Windows (PowerShell):
```powershell
cd db
.\import-csv.ps1
```

Linux/Mac (Bash):
```bash
cd db
chmod +x import-csv.sh
./import-csv.sh
```

### 4. Configure hCaptcha

- Acesse [hcaptcha.com](https://www.hcaptcha.com)
- Crie uma conta (free tier)
- Adicione um novo site
- Copie a **Sitekey** para `NEXT_PUBLIC_HCAPTCHA_SITEKEY`
- Copie o **Secret** para `HCAPTCHA_SECRET`

### 5. Execute Localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📦 Deploy para Produção

### Deploy no Vercel

**1. Conecte seu repositório:**
- Acesse [vercel.com](https://vercel.com)
- Clique "New Project"
- Importe o repositório Git
- Framework: Next.js (detectado automaticamente)

**2. Configure Environment Variables:**

No painel da Vercel, adicione todas as variáveis de `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_HCAPTCHA_SITEKEY`
- `HCAPTCHA_SECRET`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `ADMIN_SECRET_KEY`
- `CAMPAIGN_NAME` (opcional)

**3. Deploy:**
- Clique "Deploy"
- Aguarde build (~2 minutos)
- Acesse a URL gerada (ex: `https://seu-app.vercel.app`)

**4. Domínio Customizado (opcional):**
- Settings → Domains
- Adicione seu domínio
- Configure DNS conforme instruções da Vercel

## 🔒 Segurança

### Checklist de Segurança

- ✅ **HTTPS obrigatório** (automático via Vercel)
- ✅ **Lookup server-side** (CPF nunca exposto no bundle)
- ✅ **Rate limiting** por IP (10 req/hora) e CPF (3 req/hora)
- ✅ **hCaptcha** para prevenir bots
- ✅ **Validação server-side** de todos os campos
- ✅ **RLS (Row Level Security)** no Supabase
- ✅ **Service Key** nunca exposta no frontend
- ✅ **Logs imutáveis** (append-only) para auditoria

### Variáveis Sensíveis

⚠️ **NUNCA commite estas variáveis:**
- `SUPABASE_SERVICE_KEY`
- `HCAPTCHA_SECRET`
- `ADMIN_SECRET_KEY`

Certifique-se de que `.env.local` está no `.gitignore`.

## 📊 Exportar Consentimentos (Admin)

Para exportar os consentimentos registrados:

```bash
curl -H "Authorization: Bearer sua-admin-secret-key" \
  https://seu-app.vercel.app/api/admin/export \
  -o consentimentos.csv
```

O CSV conterá CPF mascarado (últimos 2 dígitos apenas) para proteção de dados.

## 🧪 Testes

### Executar Testes

```bash
npm test
```

### Testes Incluídos

- ✅ Validação de CPF (algoritmo verificador)
- ✅ Validação de email (regex)
- ✅ Endpoint `/api/register` (mock Supabase)
- ✅ Rate limiting

## 📖 Estrutura do Projeto

```
landingpage-motta/
├── app/
│   ├── page.tsx                 # Landing page principal
│   ├── confirmacao/page.tsx     # Página de confirmação
│   ├── layout.tsx               # Layout raiz
│   ├── globals.css              # Estilos globais
│   └── api/
│       ├── register/route.ts    # Endpoint de registro
│       └── admin/export/route.ts # Endpoint admin
├── components/
│   ├── Header.tsx               # Cabeçalho
│   ├── Footer.tsx               # Rodapé
│   └── FormularioConfirmacao.tsx # Formulário principal
├── lib/
│   ├── validations.ts           # Funções de validação
│   ├── supabase.ts              # Cliente Supabase
│   └── security.ts              # Funções de segurança
├── db/
│   ├── schema.sql               # Schema PostgreSQL
│   ├── import-csv.sh            # Script import (bash)
│   ├── import-csv.ps1           # Script import (PowerShell)
│   └── processos.csv            # Dados de exemplo
└── README.md                    # Este arquivo
```

## 🔍 Monitoramento

### Vercel
- **Analytics**: Dashboard → Analytics
- **Logs**: Dashboard → Logs (real-time)
- **Performance**: Dashboard → Speed Insights

### Supabase
- **Database**: Table Editor (visualizar dados)
- **API Logs**: Logs & Reports
- **Usage**: Settings → Usage (monitorar free tier limits)

## 📝 LGPD & Compliance

⚠️ **IMPORTANTE**: Este sistema implementa boas práticas, mas **deve ser revisado por um advogado especializado em LGPD antes de uso comercial**.

Ver `LGPD.md` para detalhes sobre:
- Dados coletados e finalidade
- Base legal do tratamento
- Direitos dos titulares
- Retenção e exclusão de dados
- Processo de resposta a solicitações

## 🆘 Troubleshooting

### Erro: "Cannot find module 'react'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: CPF válido rejeitado
Verifique que está usando CPF sem formatação no banco de dados (somente números).

### hCaptcha não aparece
Verifique que `NEXT_PUBLIC_HCAPTCHA_SITEKEY` está correta e que o domínio está registrado no hCaptcha.

### Rate limit muito restritivo em dev
Edite `lib/security.ts` e ajuste `RATE_LIMIT_IP` e `RATE_LIMIT_CPF` para valores maiores durante desenvolvimento.

## 📚 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [hCaptcha Docs](https://docs.hcaptcha.com)
- [Vercel Deployment](https://vercel.com/docs)
- [LGPD - Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

## 📜 Licença

Este projeto é privado e de uso exclusivo de Motta Advocacia.

## 👥 Suporte

Para dúvidas técnicas ou suporte, entre em contato com a equipe de desenvolvimento.

---

**Motta Advocacia** | Advocacia Especializada
