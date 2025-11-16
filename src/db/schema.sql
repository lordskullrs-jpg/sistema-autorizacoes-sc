-- Schema do Banco de Dados - Sistema de Autorizações SC Internacional
-- Versão 2.0 - Com código único para atletas (sem login)

-- Tabela de usuários (apenas staff: supervisores, serviço social, monitor, admin)
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK(perfil IN ('supervisor', 'servicosocial', 'monitor', 'admin')),
  categoria TEXT CHECK(categoria IN ('Sub14', 'Sub15', 'Sub16', 'Sub17', 'Sub20')),
  ativo INTEGER DEFAULT 1,
  criado_em TEXT DEFAULT (datetime('now')),
  atualizado_em TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON usuarios(perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_categoria ON usuarios(categoria);

-- Tabela de solicitações (criadas por atletas sem login - acesso público)
CREATE TABLE IF NOT EXISTS solicitacoes (
  id TEXT PRIMARY KEY,
  codigo_unico TEXT UNIQUE NOT NULL,
  
  -- Dados do atleta
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  data_nascimento TEXT NOT NULL,
  telefone TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK(categoria IN ('Sub14', 'Sub15', 'Sub16', 'Sub17', 'Sub20')),
  
  -- Dados da saída
  data_saida TEXT NOT NULL,
  horario_saida TEXT NOT NULL,
  data_retorno TEXT NOT NULL,
  horario_retorno TEXT NOT NULL,
  motivo_destino TEXT NOT NULL,
  
  -- Dados do responsável
  nome_responsavel TEXT NOT NULL,
  telefone_responsavel TEXT NOT NULL,
  
  -- Aprovação do Supervisor (por categoria)
  status_supervisor TEXT DEFAULT 'Pendente' CHECK(status_supervisor IN ('Pendente', 'Aprovado', 'Reprovado')),
  observacao_supervisor TEXT,
  aprovado_supervisor_em TEXT,
  aprovado_supervisor_por TEXT,
  
  -- Aprovação dos Pais/Responsáveis
  status_pais TEXT DEFAULT 'Pendente' CHECK(status_pais IN ('Pendente', 'Aprovado', 'Reprovado')),
  observacao_pais TEXT,
  aprovado_pais_em TEXT,
  link_aprovacao_pais TEXT,
  token_pais TEXT,
  token_pais_expira_em TEXT,
  
  -- Aprovação do Serviço Social
  status_servico_social TEXT DEFAULT 'Pendente' CHECK(status_servico_social IN ('Pendente', 'Aprovado', 'Reprovado')),
  observacao_servico_social TEXT,
  aprovado_servico_social_em TEXT,
  aprovado_servico_social_por TEXT,
  
  -- Controle do Monitor
  status_monitor TEXT DEFAULT 'Pendente' CHECK(status_monitor IN ('Pendente', 'Saiu', 'Retornou', 'Arquivado')),
  observacao_monitor TEXT,
  saida_confirmada_em TEXT,
  retorno_confirmado_em TEXT,
  arquivado_em TEXT,
  
  -- Status geral
  status_geral TEXT DEFAULT 'Aguardando Supervisor',
  status_final TEXT DEFAULT 'Em Análise' CHECK(status_final IN ('Em Análise', 'Aprovado', 'Reprovado', 'Arquivado')),
  
  -- Auditoria
  dispositivo_info TEXT,
  criado_em TEXT DEFAULT (datetime('now')),
  atualizado_em TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_codigo ON solicitacoes(codigo_unico);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_categoria ON solicitacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status_supervisor ON solicitacoes(status_supervisor);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status_pais ON solicitacoes(status_pais);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status_servico_social ON solicitacoes(status_servico_social);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status_monitor ON solicitacoes(status_monitor);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status_final ON solicitacoes(status_final);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_token_pais ON solicitacoes(token_pais);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_criado_em ON solicitacoes(criado_em);
