# 🔍 Diagnóstico: Consentimentos não sendo salvos

## Problema Identificado

Os consentimentos podem não estar sendo salvos no Supabase devido a problemas com **Row Level Security (RLS)**.

## Como Diagnosticar

### 1. Execute o script de teste

```bash
npx tsx scripts/test-consentimento.ts
```

Este script vai:
- Tentar inserir um consentimento de teste
- Mostrar erros detalhados se houver
- Verificar se o registro foi realmente salvo
- Limpar o registro de teste ao final

### 2. Verifique os logs do servidor

Quando você submeter o formulário, verifique o console do servidor (terminal onde o Next.js está rodando). Agora ele mostra:
- ✅ Logs de sucesso quando o consentimento é gravado
- ❌ Logs detalhados de erro com código, mensagem e detalhes

### 3. Acesse a rota de debug (apenas desenvolvimento)

```
http://localhost:3000/api/debug/consentimentos
```

Esta rota mostra os últimos 10 consentimentos salvos.

## Possíveis Causas e Soluções

### Causa 1: RLS bloqueando inserções

**Sintoma:** Erro `42501` ou mensagem sobre "permission denied" ou "row-level security"

**Solução:**

1. Acesse o Supabase Dashboard
2. Vá em **Authentication > Policies**
3. Selecione a tabela `consentimentos`
4. Verifique se existe uma policy que permite `service_role`
5. Se não existir ou estiver incorreta, execute o script `db/fix-rls-policies.sql` no SQL Editor do Supabase

### Causa 2: Variáveis de ambiente incorretas

**Sintoma:** Erro sobre "Missing Supabase environment variables"

**Solução:**

1. Verifique se o arquivo `.env.local` existe
2. Verifique se contém:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_SERVICE_KEY=sua-service-role-key
   ```
3. **IMPORTANTE:** Use a `service_role` key (não a `anon` key!)
   - Dashboard Supabase > Settings > API > `service_role` key (secret)

### Causa 3: Tabela não existe

**Sintoma:** Erro `42P01` (tabela não encontrada)

**Solução:**

1. Execute o script `db/schema.sql` no SQL Editor do Supabase
2. Ou verifique se as tabelas existem:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('processos', 'consentimentos');
   ```

### Causa 4: Estrutura da tabela incorreta

**Sintoma:** Erro sobre colunas não encontradas ou tipos incompatíveis

**Solução:**

1. Verifique se a estrutura da tabela está correta:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'consentimentos'
   ORDER BY ordinal_position;
   ```

2. Compare com o schema em `db/schema.sql`

## Verificação Rápida

Execute estas queries no SQL Editor do Supabase:

```sql
-- 1. Verificar se a tabela existe
SELECT COUNT(*) FROM consentimentos;

-- 2. Verificar últimos registros
SELECT id, cpf, nome_fornecido, email_fornecido, created_at 
FROM consentimentos 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Verificar policies RLS
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'consentimentos';
```

## Próximos Passos

1. ✅ Execute `npx tsx scripts/test-consentimento.ts`
2. ✅ Verifique os logs do servidor ao submeter o formulário
3. ✅ Se houver erro de RLS, execute `db/fix-rls-policies.sql`
4. ✅ Teste novamente o formulário
5. ✅ Verifique os dados no Supabase Dashboard > Table Editor > consentimentos

## Melhorias Implementadas

- ✅ Logs detalhados de erro na rota `/api/register`
- ✅ Logs de sucesso quando o consentimento é gravado
- ✅ Script de teste para diagnosticar problemas
- ✅ Rota de debug para verificar consentimentos salvos
- ✅ Documentação completa do problema e soluções

