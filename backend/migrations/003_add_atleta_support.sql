-- Migração 003: Adicionar suporte para perfil 'atleta'
-- Data: 2025-11-17
-- Descrição: Permite que atletas façam login e criem suas próprias solicitações

-- IMPORTANTE: Esta migração requer recriação da tabela usuarios devido à constraint CHECK
-- O Cloudflare D1 não suporta ALTER TABLE para modificar constraints

-- Passo 1: Criar tabela temporária com o novo schema
CREATE TABLE IF NOT EXISTS usuarios_new (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK(perfil IN ('atleta', 'supervisor', 'servicosocial', 'monitor', 'admin')),
  categoria TEXT CHECK(categoria IN ('Sub14', 'Sub15', 'Sub16', 'Sub17', 'Sub20')),
  ativo INTEGER DEFAULT 1,
  criado_em TEXT DEFAULT (datetime('now')),
  atualizado_em TEXT DEFAULT (datetime('now')),
  ultimo_login DATETIME,
  tentativas_login_falhas INTEGER DEFAULT 0,
  bloqueado_ate DATETIME
);

-- Passo 2: Copiar dados existentes
INSERT INTO usuarios_new (id, email, senha_hash, nome, perfil, categoria, ativo, criado_em, atualizado_em, ultimo_login, tentativas_login_falhas, bloqueado_ate)
SELECT id, email, senha_hash, nome, perfil, categoria, ativo, criado_em, atualizado_em, ultimo_login, tentativas_login_falhas, bloqueado_ate
FROM usuarios;

-- Passo 3: Remover tabela antiga
DROP TABLE usuarios;

-- Passo 4: Renomear tabela nova
ALTER TABLE usuarios_new RENAME TO usuarios;

-- Passo 5: Recriar índices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON usuarios(perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_categoria ON usuarios(categoria);

-- Passo 6: Inserir usuários atletas de teste
-- Senha padrão: atleta123
INSERT OR IGNORE INTO usuarios (id, email, senha_hash, nome, perfil, categoria, ativo) VALUES
('atleta-sub14-001', 'gabriel.costa@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Gabriel Costa', 'atleta', 'Sub14', 1),
('atleta-sub15-001', 'lucas.oliveira@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Lucas Oliveira', 'atleta', 'Sub15', 1),
('atleta-sub16-001', 'rafael.alves@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Rafael Alves', 'atleta', 'Sub16', 1),
('atleta-sub17-001', 'joao.silva@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'João da Silva', 'atleta', 'Sub17', 1),
('atleta-sub20-001', 'pedro.santos@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Pedro Santos', 'atleta', 'Sub20', 1),
('atleta-sub17-002', 'carlos.mendes@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Carlos Mendes', 'atleta', 'Sub17', 1),
('atleta-sub17-003', 'bruno.ferreira@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Bruno Ferreira', 'atleta', 'Sub17', 1);

-- Passo 7: Adicionar coluna atleta_id na tabela solicitacoes (se não existir)
-- Isso permite vincular solicitações a usuários atletas autenticados
ALTER TABLE solicitacoes ADD COLUMN atleta_id TEXT;

-- Criar índice para buscar solicitações por atleta
CREATE INDEX IF NOT EXISTS idx_solicitacoes_atleta_id ON solicitacoes(atleta_id);
