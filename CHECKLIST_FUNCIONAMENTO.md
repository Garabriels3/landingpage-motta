# ✅ Checklist: O que falta para o site funcionar

## 🔧 Correções Aplicadas

### ✅ 1. Redirecionamento com número do processo
**Status:** CORRIGIDO
- O formulário agora passa o número do processo na URL ao redirecionar
- Se não encontrar processo, passa "nao-encontrado"

---

## 📋 O que falta fazer

### 1. ⚙️ Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto com:

```env
# Supabase (Já conectado)
NEXT_PUBLIC_SUPABASE_URL=https://fitszafumzpsqmcnhnoj.supabase.co
SUPABASE_SERVICE_KEY=sua-service-key-aqui

# IMPORTANTE: Pegue a SERVICE_KEY no dashboard do Supabase:
# Project Settings > API > service_role key (secret)

# hCaptcha (Crie conta em https://hcaptcha.com)
NEXT_PUBLIC_HCAPTCHA_SITEKEY=sua-sitekey-aqui
HCAPTCHA_SECRET=seu-secret-aqui

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999

# Admin Security
ADMIN_SECRET_KEY=senha-secreta-forte-aqui

# Opcional
CAMPAIGN_NAME=campanha-inicial
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Como obter as chaves:**
- **Supabase Service Key**: Dashboard Supabase > Settings > API > `service_role` key (secret)
- **hCaptcha**: Crie conta em hcaptcha.com (free tier) > Adicione site > Copie Sitekey e Secret

---

### 2. 📊 Importar Dados de Processos no Banco

Você precisa importar a planilha de clientes com CPF e número de processo.

#### Opção A: Via Dashboard Supabase (Mais Simples)

1. Acesse o dashboard do Supabase
2. Vá em **Table Editor** > `processos`
3. Clique em **Insert** > **Import CSV**
4. Selecione seu arquivo CSV
5. Mapeie as colunas:
   - `cpf` → CPF (sem formatação, só números)
   - `numero_processo` → Número do Processo
   - `origem` → Origem (ex: "Planilha-2025-01-15")
6. Clique em **Import**

#### Opção B: Via Script PowerShell (Para muitos registros)

1. Prepare seu CSV no formato:
```csv
cpf,numero_processo,origem
12345678900,0012345-88.2023.8.26.0100,Planilha-2025-01-15
98765432100,0067890-12.2024.8.26.0200,Planilha-2025-01-15
```

**IMPORTANTE:** 
- CPF deve estar SEM formatação (sem pontos e traço)
- Apenas números: `12345678900` ✅ (não `123.456.789-00` ❌)

2. Coloque o CSV na pasta `db/` (substitua o `processos.csv` de exemplo)

3. Configure as variáveis de ambiente no PowerShell:
```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://fitszafumzpsqmcnhnoj.supabase.co"
$env:SUPABASE_SERVICE_KEY="sua-service-key-aqui"
```

4. Execute o script:
```powershell
cd db
.\import-csv.ps1
```

#### Opção C: Via SQL direto (Para poucos registros)

No SQL Editor do Supabase, execute:

```sql
INSERT INTO processos (cpf, numero_processo, origem)
VALUES 
  ('12345678900', '0012345-88.2023.8.26.0100', 'Planilha-2025-01-15'),
  ('98765432100', '0067890-12.2024.8.26.0200', 'Planilha-2025-01-15')
ON CONFLICT (cpf) DO UPDATE 
SET numero_processo = EXCLUDED.numero_processo,
    origem = EXCLUDED.origem;
```

---

### 3. 🧪 Testar o Fluxo Completo

Após configurar tudo:

1. **Inicie o servidor:**
```bash
npm run dev
```

2. **Teste o fluxo:**
   - Acesse `http://localhost:3000`
   - Preencha o formulário com um CPF que está no banco
   - Complete o hCaptcha
   - Submeta o formulário
   - Deve redirecionar para `/confirmacao` mostrando o número do processo

3. **Teste com CPF não cadastrado:**
   - Use um CPF que não está no banco
   - Deve mostrar mensagem de "não encontrado" mas ainda permitir contato

---

### 4. 🔒 Configurar hCaptcha (Obrigatório)

Sem hCaptcha, o formulário não funciona!

1. Acesse https://www.hcaptcha.com
2. Crie uma conta (free tier)
3. Adicione um novo site:
   - Domínio: `localhost` (para desenvolvimento)
   - Domínio: seu domínio (para produção)
4. Copie:
   - **Sitekey** → `NEXT_PUBLIC_HCAPTCHA_SITEKEY`
   - **Secret** → `HCAPTCHA_SECRET`

---

### 5. 📝 Criar Páginas de Termos e Privacidade (Opcional mas Recomendado)

Atualmente os links apontam para `#`. Crie:

- `/termos` - Página com Termos de Uso
- `/privacidade` - Página com Política de Privacidade

Ou atualize os links no formulário para apontar para páginas externas.

---

## ✅ O que já está funcionando

- ✅ Banco de dados criado e configurado
- ✅ Tabelas `processos` e `consentimentos` existem
- ✅ RLS (Row Level Security) habilitado
- ✅ Índices criados para performance
- ✅ API `/api/register` funcionando
- ✅ Validação de CPF completa (frontend + backend)
- ✅ Rate limiting configurado
- ✅ Gravação de consentimentos LGPD
- ✅ Busca de processos por CPF
- ✅ Página de confirmação
- ✅ Redirecionamento com número do processo (CORRIGIDO)

---

## 🚀 Próximos Passos

1. **Configurar `.env.local`** com todas as variáveis
2. **Importar dados de processos** no banco
3. **Configurar hCaptcha**
4. **Testar o fluxo completo**
5. **Deploy para produção** (Vercel/Netlify)

---

## 📞 Suporte

Se tiver dúvidas sobre:
- **Importação de dados**: Use a Opção A (Dashboard) para começar
- **Formato do CSV**: CPF sem formatação, apenas números
- **Erros**: Verifique os logs no console do navegador e do servidor


