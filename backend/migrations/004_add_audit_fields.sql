-- Migration 004: Adicionar campos de auditoria LGPD
-- Data: 2025-11-17
-- Objetivo: Conformidade com LGPD para autorizações digitais

-- Adicionar campos de auditoria para aprovação do supervisor
ALTER TABLE solicitacoes ADD COLUMN aprovado_supervisor_ip TEXT;
ALTER TABLE solicitacoes ADD COLUMN aprovado_supervisor_dispositivo TEXT;

-- Adicionar campos de auditoria para aprovação dos pais
ALTER TABLE solicitacoes ADD COLUMN aprovado_pais_ip TEXT;
ALTER TABLE solicitacoes ADD COLUMN aprovado_pais_dispositivo TEXT;

-- Adicionar campos de auditoria para aprovação do serviço social
ALTER TABLE solicitacoes ADD COLUMN aprovado_servico_social_ip TEXT;
ALTER TABLE solicitacoes ADD COLUMN aprovado_servico_social_dispositivo TEXT;

-- Adicionar campos de auditoria para monitor
ALTER TABLE solicitacoes ADD COLUMN saida_confirmada_ip TEXT;
ALTER TABLE solicitacoes ADD COLUMN saida_confirmada_dispositivo TEXT;
ALTER TABLE solicitacoes ADD COLUMN retorno_confirmado_ip TEXT;
ALTER TABLE solicitacoes ADD COLUMN retorno_confirmado_dispositivo TEXT;

-- Criar índices para consultas de auditoria
CREATE INDEX IF NOT EXISTS idx_solicitacoes_aprovado_supervisor_ip ON solicitacoes(aprovado_supervisor_ip);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_aprovado_pais_ip ON solicitacoes(aprovado_pais_ip);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_aprovado_servico_social_ip ON solicitacoes(aprovado_servico_social_ip);
