-- ============================================
-- MOTTA ADVOCACIA - DATABASE SCHEMA
-- Supabase PostgreSQL Database
-- ============================================

-- Tabela de processos (pré-populada offline pelos advogados)
CREATE TABLE IF NOT EXISTS processos (
  id SERIAL PRIMARY KEY,
  cpf TEXT NOT NULL UNIQUE,
  numero_processo TEXT NOT NULL,
  origem TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida por CPF
CREATE INDEX IF NOT EXISTS idx_processos_cpf ON processos(cpf);

-- Comentários
COMMENT ON TABLE processos IS 'Armazena o mapeamento de CPF para número de processo jurídico';
COMMENT ON COLUMN processos.cpf IS 'CPF sem formatação (somente números)';
COMMENT ON COLUMN processos.numero_processo IS 'Número do processo unificado no formato CNJ';
COMMENT ON COLUMN processos.origem IS 'Fonte dos dados (ex: JusBrasil-2025-11-30)';

-- ============================================

-- Tabela de consentimentos (append-only para auditoria LGPD)
CREATE TABLE IF NOT EXISTS consentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf TEXT NOT NULL,
  nome_fornecido TEXT,
  email_fornecido TEXT,
  aceitou_termos BOOLEAN NOT NULL DEFAULT true,
  termos_hash TEXT NOT NULL,
  token_used BOOLEAN DEFAULT false,
  ip TEXT,
  user_agent TEXT,
  source_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização e busca
CREATE INDEX IF NOT EXISTS idx_consentimentos_cpf ON consentimentos(cpf);
CREATE INDEX IF NOT EXISTS idx_consentimentos_created_at ON consentimentos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consentimentos_campaign ON consentimentos(source_campaign);

-- Comentários
COMMENT ON TABLE consentimentos IS 'Registro imutável de consentimentos LGPD (append-only)';
COMMENT ON COLUMN consentimentos.termos_hash IS 'Hash SHA-256 do texto dos termos apresentados no momento do consentimento';
COMMENT ON COLUMN consentimentos.ip IS 'Endereço IP do usuário para auditoria';
COMMENT ON COLUMN consentimentos.user_agent IS 'User-Agent do navegador para auditoria';
COMMENT ON COLUMN consentimentos.token_used IS 'Indica se foi usado token de invite (campanha de email)';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Opcional mas altamente recomendado para segurança adicional
-- ============================================

-- Habilitar RLS
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimentos ENABLE ROW LEVEL SECURITY;

-- Policy: apenas service role pode acessar processos
CREATE POLICY "Service role only access processos" ON processos
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: apenas service role pode acessar consentimentos
CREATE POLICY "Service role only access consentimentos" ON consentimentos
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL - PARA DESENVOLVIMENTO)
-- Remover em produção!
-- ============================================

-- Inserir processo de exemplo
INSERT INTO processos (cpf, numero_processo, origem)
VALUES 
  ('12345678900', '0012345-88.2023.8.26.0100', 'Exemplo-Dev'),
  ('98765432100', '0067890-12.2024.8.26.0200', 'Exemplo-Dev')
ON CONFLICT (cpf) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- Execute estas queries para verificar que tudo foi criado corretamente
-- ============================================

-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('processos', 'consentimentos');

-- Verificar índices
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('processos', 'consentimentos');

-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('processos', 'consentimentos');
