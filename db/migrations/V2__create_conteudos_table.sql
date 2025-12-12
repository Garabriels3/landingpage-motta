-- ============================================
-- MIGRATION: Tabela de Conteúdos do Site
-- Sistema de CMS para gerenciar textos do site
-- ============================================

-- Tabela de conteúdos
CREATE TABLE IF NOT EXISTS conteudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  texto TEXT NOT NULL,
  pagina TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'texto',
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_conteudos_chave ON conteudos(chave);
CREATE INDEX IF NOT EXISTS idx_conteudos_pagina ON conteudos(pagina);
CREATE INDEX IF NOT EXISTS idx_conteudos_tipo ON conteudos(tipo);

-- Comentários
COMMENT ON TABLE conteudos IS 'Armazena textos editáveis do site (CMS)';
COMMENT ON COLUMN conteudos.chave IS 'Chave única para identificar o conteúdo (ex: homepage.headline)';
COMMENT ON COLUMN conteudos.texto IS 'Conteúdo do texto';
COMMENT ON COLUMN conteudos.pagina IS 'Página onde o conteúdo é usado (ex: home, confirmacao)';
COMMENT ON COLUMN conteudos.tipo IS 'Tipo do conteúdo (titulo, paragrafo, botao, badge, etc)';

-- Habilitar RLS
ALTER TABLE conteudos ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas service_role pode fazer tudo (escrita e leitura)
CREATE POLICY "Service role full access conteudos" ON conteudos
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Permitir leitura pública (para o site buscar conteúdos)
-- Mas apenas via service_role na prática (API usa service_role)
CREATE POLICY "Public read conteudos" ON conteudos
  FOR SELECT
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_conteudos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conteudos_updated_at
  BEFORE UPDATE ON conteudos
  FOR EACH ROW
  EXECUTE FUNCTION update_conteudos_updated_at();

-- ============================================
-- DADOS INICIAIS (Fallback caso não tenha no banco)
-- Estes serão os textos padrão se o sistema não encontrar no Supabase
-- ============================================

-- Homepage
INSERT INTO conteudos (chave, texto, pagina, tipo, descricao) VALUES
  ('homepage.badge', 'Processo Identificado', 'home', 'badge', 'Badge no topo da página inicial'),
  ('homepage.headline', 'Identificamos um direito a seu favor.', 'home', 'titulo', 'Título principal da homepage'),
  ('homepage.subheadline', 'Nossa equipe de inteligência jurídica detectou uma oportunidade de restituição em seu nome. Confirme seus dados para que possamos dar andamento ao processo com total segurança.', 'home', 'paragrafo', 'Subtítulo da homepage'),
  ('homepage.card1.titulo', 'Dados Protegidos', 'home', 'titulo', 'Título do card de segurança'),
  ('homepage.card1.texto', 'Seus dados são criptografados e seguem estritamente a LGPD.', 'home', 'paragrafo', 'Texto do card de segurança'),
  ('homepage.card2.titulo', 'Equipe Especializada', 'home', 'titulo', 'Título do card de equipe'),
  ('homepage.card2.texto', 'Advogados com mais de 20 anos de experiência em restituições.', 'home', 'paragrafo', 'Texto do card de equipe'),
  ('homepage.social.titulo', 'Assessoria Jurídica Ativa', 'home', 'titulo', 'Título do social proof'),
  ('homepage.social.avaliacao', '4.9/5 de satisfação dos clientes', 'home', 'texto', 'Texto de avaliação'),
  
  -- Formulário
  ('form.titulo', 'Confirmação de Interesse', 'home', 'titulo', 'Título do formulário'),
  ('form.subtitulo', 'Preencha o formulário abaixo para validar seu direito.', 'home', 'paragrafo', 'Subtítulo do formulário'),
  ('form.nome.label', 'Nome Completo', 'home', 'label', 'Label do campo nome'),
  ('form.nome.placeholder', 'Digite seu nome completo', 'home', 'placeholder', 'Placeholder do campo nome'),
  ('form.cpf.label', 'CPF', 'home', 'label', 'Label do campo CPF'),
  ('form.cpf.placeholder', '000.000.000-00', 'home', 'placeholder', 'Placeholder do campo CPF'),
  ('form.email.label', 'E-mail para contato', 'home', 'label', 'Label do campo email'),
  ('form.email.placeholder', 'seu@email.com', 'home', 'placeholder', 'Placeholder do campo email'),
  ('form.termos.texto', 'Declaro que li e aceito os Termos de Uso e a Política de Privacidade.', 'home', 'texto', 'Texto do checkbox de termos'),
  ('form.botao', 'Confirmar Interesse', 'home', 'botao', 'Texto do botão de submit'),
  ('form.botao.processando', 'Processando...', 'home', 'botao', 'Texto do botão durante processamento'),
  
  -- Confirmação
  ('confirmacao.titulo', 'Interesse Confirmado', 'confirmacao', 'titulo', 'Título da página de confirmação'),
  ('confirmacao.subtitulo.encontrado', 'Recebemos sua solicitação. Identificamos um processo jurídico em seu nome com status ativo. Confira os dados oficiais abaixo.', 'confirmacao', 'paragrafo', 'Subtítulo quando processo foi encontrado'),
  ('confirmacao.subtitulo.nao_encontrado', 'Recebemos sua solicitação. Não encontramos um processo ativo no momento, mas nossa equipe pode analisar outras oportunidades.', 'confirmacao', 'paragrafo', 'Subtítulo quando processo não foi encontrado'),
  ('confirmacao.processo.label', 'Número do Processo Unificado', 'confirmacao', 'label', 'Label do número do processo'),
  ('confirmacao.processo.copiar', 'Copiar Número', 'confirmacao', 'botao', 'Texto do botão copiar'),
  ('confirmacao.processo.copiado', 'Copiado!', 'confirmacao', 'botao', 'Texto quando copiado'),
  ('confirmacao.processo.protegido', 'Dados protegidos por sigilo profissional e LGPD.', 'confirmacao', 'texto', 'Texto de proteção de dados'),
  ('confirmacao.nao_encontrado.texto1', 'Não localizamos um processo ativo neste momento, mas isso não significa que você não tenha direitos a receber.', 'confirmacao', 'paragrafo', 'Texto quando não encontrado - parte 1'),
  ('confirmacao.nao_encontrado.texto2', 'Nossa equipe pode realizar uma análise mais detalhada e identificar outras oportunidades de restituição.', 'confirmacao', 'paragrafo', 'Texto quando não encontrado - parte 2'),
  ('confirmacao.consulta.titulo', 'Como consultar seu processo:', 'confirmacao', 'titulo', 'Título da seção de instruções'),
  ('confirmacao.consulta.passo1.titulo', 'Copie o número', 'confirmacao', 'titulo', 'Título do passo 1'),
  ('confirmacao.consulta.passo1.texto', 'Utilize o botão "Copiar" no cartão acima.', 'confirmacao', 'paragrafo', 'Texto do passo 1'),
  ('confirmacao.consulta.passo2.titulo', 'Acesse o portal de consultas', 'confirmacao', 'titulo', 'Título do passo 2'),
  ('confirmacao.consulta.passo2.texto', 'Recomendamos o site JusBrasil.', 'confirmacao', 'paragrafo', 'Texto do passo 2'),
  ('confirmacao.consulta.passo3.titulo', 'Cole na barra de busca', 'confirmacao', 'titulo', 'Título do passo 3'),
  ('confirmacao.consulta.passo3.texto', 'No campo de pesquisa, cole o número para visualizar as movimentações.', 'confirmacao', 'paragrafo', 'Texto do passo 3'),
  ('confirmacao.whatsapp.titulo', 'Precisa de orientação especializada?', 'confirmacao', 'titulo', 'Título do CTA WhatsApp'),
  ('confirmacao.whatsapp.texto', 'Nossa equipe já analisou seu caso e pode explicar os próximos passos.', 'confirmacao', 'paragrafo', 'Texto do CTA WhatsApp'),
  ('confirmacao.whatsapp.botao', 'Falar no WhatsApp', 'confirmacao', 'botao', 'Texto do botão WhatsApp'),
  ('confirmacao.whatsapp.resposta', 'Resposta em 5min', 'confirmacao', 'texto', 'Texto de tempo de resposta'),
  ('confirmacao.whatsapp.badge1', 'Advogados Especializados', 'confirmacao', 'badge', 'Badge 1 do WhatsApp'),
  ('confirmacao.whatsapp.badge2', 'Atendimento Rápido', 'confirmacao', 'badge', 'Badge 2 do WhatsApp'),
  ('confirmacao.voltar', 'Voltar para o início', 'confirmacao', 'botao', 'Texto do botão voltar'),
  
  -- Header
  ('header.logo.nome', 'Wagner Chaves', 'header', 'titulo', 'Nome no header'),
  ('header.logo.subtitulo', 'Advocacia Especializada', 'header', 'texto', 'Subtítulo no header'),
  ('header.badge', 'Ambiente Seguro', 'header', 'badge', 'Badge de segurança no header')
ON CONFLICT (chave) DO NOTHING;

