-- ============================================
-- MIGRATION: Tabela de Logs de Auditoria Admin
-- Registra todas as alterações feitas no CMS
-- ============================================

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acao TEXT NOT NULL,  -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN_FAILED', 'LOGIN_SUCCESS'
  chave_conteudo TEXT,
  valor_anterior TEXT,
  valor_novo TEXT,
  ip TEXT,
  user_agent TEXT,
  detalhes JSONB,  -- Para dados extras como motivo de bloqueio
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_acao ON admin_audit_logs(acao);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_chave ON admin_audit_logs(chave_conteudo);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_ip ON admin_audit_logs(ip);

-- Comentários
COMMENT ON TABLE admin_audit_logs IS 'Logs de auditoria do painel admin (append-only)';
COMMENT ON COLUMN admin_audit_logs.acao IS 'Tipo de ação: CREATE, UPDATE, DELETE, LOGIN_FAILED, LOGIN_SUCCESS';
COMMENT ON COLUMN admin_audit_logs.chave_conteudo IS 'Chave do conteúdo afetado (quando aplicável)';
COMMENT ON COLUMN admin_audit_logs.valor_anterior IS 'Valor antes da alteração';
COMMENT ON COLUMN admin_audit_logs.valor_novo IS 'Valor após a alteração';
COMMENT ON COLUMN admin_audit_logs.detalhes IS 'Metadados adicionais em JSON';

-- Habilitar RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas service_role pode acessar
CREATE POLICY "Service role only access admin_audit_logs" ON admin_audit_logs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
