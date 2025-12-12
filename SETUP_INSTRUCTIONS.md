# Instruções de Configuração Final

O projeto no Supabase foi criado com sucesso!

**Nome do Projeto**: Motta Advocacia (Backend)
**Nome no Site**: Wagner Chaves Advocacia
**Status**: Ativo

## 1. Configurar Variáveis de Ambiente

Crie um arquivo chamado `.env.local` na raiz do projeto e cole o seguinte conteúdo:

```env
# Supabase (Já configurado)
NEXT_PUBLIC_SUPABASE_URL=https://fitszafumzpsqmcnhnoj.supabase.co
# IMPORTANTE: Você precisa pegar esta chave no dashboard do Supabase!
# Vá em Project Settings > API > service_role key (secret)
SUPABASE_SERVICE_KEY=COLE_SUA_CHAVE_AQUI

# hCaptcha (Crie conta em hcaptcha.com)
NEXT_PUBLIC_HCAPTCHA_SITEKEY=sua-sitekey-aqui
HCAPTCHA_SECRET=seu-secret-aqui

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999

# Admin Security
ADMIN_SECRET_KEY=senha-secreta-admin

# Config
CAMPAIGN_NAME=wagner-chaves-launch
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Verificar Banco de Dados

As tabelas `processos` e `consentimentos` já foram criadas automaticamente.
Você pode verificar no dashboard do Supabase > Table Editor.

## 3. Próximos Passos

1. Obtenha a `SUPABASE_SERVICE_KEY`.
2. Configure o hCaptcha.
3. Rode `npm run dev` para testar.
