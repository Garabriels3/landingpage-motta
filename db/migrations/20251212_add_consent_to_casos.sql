-- =================================================================
-- MIGRATION: Add consentimento_id to casos table
-- =================================================================

-- 1. Adicionar coluna de relacionamento (link com tabela de consentimentos)
-- Usando minúsculo para consentimento_id pois é padrão novo
ALTER TABLE casos 
ADD COLUMN IF NOT EXISTS consentimento_id UUID REFERENCES consentimentos(id);

-- 2. Criar índices para busca rápida (performance crítica no login/admin)
-- ATENÇÃO: Colunas originais estão em MAIÚSCULO, precisa de aspas duplas no Postgres
CREATE INDEX IF NOT EXISTS idx_casos_doc_reu ON casos("DOC_REU");

-- Índice para buscar pelo Email
CREATE INDEX IF NOT EXISTS idx_casos_email ON casos("EMAIL");

-- Índice para filtrar casos que já têm consentimento
CREATE INDEX IF NOT EXISTS idx_casos_consentimento_id ON casos(consentimento_id);

-- 3. Comentários para documentação
COMMENT ON COLUMN casos.consentimento_id IS 'Link para o registro de consentimento (se houver)';
