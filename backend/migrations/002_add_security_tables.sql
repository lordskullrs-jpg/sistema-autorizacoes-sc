-- Migração 002: Adicionar tabelas de segurança e configurações
-- Data: 2025-11-17
-- Descrição: Tabelas para configurações, tokens de redefinição e logs

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT DEFAULT 'string', -- string, number, boolean
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_por TEXT
);

-- Inserir configurações iniciais
INSERT OR IGNORE INTO configuracoes (chave, valor, descricao, tipo) VALUES
  ('limite_solicitacoes_semanal', '5', 'Máximo de solicitações por atleta por semana', 'number'),
  ('expiracao_link_pais_dias', '7', 'Dias até expiração do link dos pais', 'number'),
  ('expiracao_token_redefinicao_horas', '1', 'Horas até expiração do token de redefinição de senha', 'number'),
  ('email_atleta', 'atleta@inter.com', 'Email compartilhado dos atletas', 'string'),
  ('formulario_atleta_ativo', 'true', 'Habilitar/desabilitar formulário de atletas', 'boolean');

-- Tabela de tokens de redefinição de senha
CREATE TABLE IF NOT EXISTS tokens_redefinicao (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  usuario_email TEXT NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  expira_em DATETIME NOT NULL,
  usado_em DATETIME,
  usado BOOLEAN DEFAULT 0,
  criado_por TEXT,
  ip_origem TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Índice para buscar tokens não expirados
CREATE INDEX IF NOT EXISTS idx_tokens_expiracao ON tokens_redefinicao(expira_em, usado);
CREATE INDEX IF NOT EXISTS idx_tokens_usuario ON tokens_redefinicao(usuario_email);

-- Tabela de log de alterações (auditoria)
CREATE TABLE IF NOT EXISTS log_alteracoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL, -- 'usuario_criado', 'usuario_editado', 'senha_alterada', 'config_alterada', 'token_gerado'
  usuario_afetado TEXT,
  detalhes TEXT, -- JSON com informações adicionais
  realizado_por TEXT NOT NULL,
  ip_origem TEXT,
  realizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índice para consultas de log
CREATE INDEX IF NOT EXISTS idx_log_tipo ON log_alteracoes(tipo);
CREATE INDEX IF NOT EXISTS idx_log_data ON log_alteracoes(realizado_em DESC);
CREATE INDEX IF NOT EXISTS idx_log_usuario ON log_alteracoes(usuario_afetado);

-- Adicionar campo para rastrear último login
ALTER TABLE usuarios ADD COLUMN ultimo_login DATETIME;
ALTER TABLE usuarios ADD COLUMN tentativas_login_falhas INTEGER DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN bloqueado_ate DATETIME;

-- Criar usuário atleta compartilhado se não existir
INSERT OR IGNORE INTO usuarios (email, senha, perfil, nome, ativo) 
VALUES (
  'atleta@inter.com',
  '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', -- Senha: atleta123
  'atleta',
  'Atletas SC Internacional',
  1
);
