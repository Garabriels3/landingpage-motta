-- ============================================
-- CORREÇÃO DE POLICIES RLS PARA SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Service role only access processos" ON processos;
DROP POLICY IF EXISTS "Service role only access consentimentos" ON consentimentos;

-- 2. Criar novas policies que funcionam corretamente com service_role
-- Para processos: permitir tudo para service_role
CREATE POLICY "Service role full access processos" ON processos
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Para consentimentos: permitir INSERT para service_role
CREATE POLICY "Service role full access consentimentos" ON consentimentos
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 3. Verificar se as policies foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('processos', 'consentimentos')
ORDER BY tablename, policyname;

-- 4. Verificar se RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('processos', 'consentimentos');

-- ============================================
-- ALTERNATIVA: Se ainda não funcionar, desabilitar RLS temporariamente
-- (NÃO RECOMENDADO PARA PRODUÇÃO, apenas para debug)
-- ============================================
-- ALTER TABLE processos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE consentimentos DISABLE ROW LEVEL SECURITY;

