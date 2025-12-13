-- ============================================
-- MIGRATION: Adicionar Link do TJRJ aos Conteúdos
-- Permite edição do link do TJRJ através do painel admin
-- ============================================

-- Adicionar link do TJRJ aos conteúdos
INSERT INTO conteudos (chave, texto, pagina, tipo, descricao) VALUES
  ('confirmacao.tjrj.link', 'https://www.tjrj.jus.br/', 'confirmacao', 'link', 'URL do portal TJRJ para consulta de processos')
ON CONFLICT (chave) DO UPDATE SET
  texto = EXCLUDED.texto,
  updated_at = NOW();

-- Comentário para documentação
COMMENT ON COLUMN conteudos.texto IS 'Conteúdo do texto ou URL (quando tipo=link)';
