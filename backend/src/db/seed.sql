-- Dados iniciais para testes
-- Sistema de Autorizações SC Internacional
-- Senha padrão para todos: senha123

-- Usuários do Staff (senha: senha123, hash bcrypt com 10 rounds)
INSERT INTO usuarios (id, email, senha_hash, nome, perfil, categoria) VALUES
('admin-001', 'admin@inter.com', '$2a$10$rKZhYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU', 'Administrador', 'admin', NULL),

('sup14-001', 'sup14@inter.com', '$2a$10$rKZhYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU', 'Supervisor Sub-14', 'supervisor', 'Sub14'),
('sup15-001', 'sup15@inter.com', '$2a$10$rKZhYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU', 'Supervisor Sub-15', 'supervisor', 'Sub15'),
('sup16-001', 'sup16@inter.com', '$2a$10$rKZhYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU', 'Supervisor Sub-16', 'supervisor', 'Sub16'),
('sup17-001', 'sup17@inter.com', '$2a$10$rKZhYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU', 'Supervisor Sub-17', 'supervisor', 'Sub17'),
('sup20-001', 'sup20@inter.com', '$2a$10$rKZhYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU', 'Supervisor Sub-20', 'supervisor', 'Sub20'),

('ss-001', 'servicosocial@inter.com', '$2a$10$rKZhYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU', 'Serviço Social', 'servicosocial', NULL),
('monitor-001', 'monitor@inter.com', '$2a$10$rKZhYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU', 'Monitor', 'monitor', NULL);

-- Solicitações de exemplo para testes (uma de cada categoria)
INSERT INTO solicitacoes (
  id, codigo_unico, nome, email, data_nascimento, telefone, categoria,
  data_saida, horario_saida, data_retorno, horario_retorno,
  motivo_destino, nome_responsavel, telefone_responsavel,
  status_geral
) VALUES
('sol-001', 'AUTH-2024-001', 'João da Silva', 'joao.silva@email.com', '2009-05-15', '(51) 99999-1111', 'Sub17',
 '2024-11-20', '14:00', '2024-11-20', '22:00',
 'Consulta médica', 'Maria da Silva', '(51) 98888-1111',
 'Aguardando Supervisor'),

('sol-002', 'AUTH-2024-002', 'Pedro Santos', 'pedro.santos@email.com', '2007-03-22', '(51) 99999-2222', 'Sub20',
 '2024-11-21', '10:00', '2024-11-21', '18:00',
 'Visita familiar', 'José Santos', '(51) 98888-2222',
 'Aguardando Supervisor'),

('sol-003', 'AUTH-2024-003', 'Lucas Oliveira', 'lucas.oliveira@email.com', '2010-08-10', '(51) 99999-3333', 'Sub15',
 '2024-11-22', '09:00', '2024-11-22', '17:00',
 'Compromisso escolar', 'Ana Oliveira', '(51) 98888-3333',
 'Aguardando Supervisor'),

('sol-004', 'AUTH-2024-004', 'Gabriel Costa', 'gabriel.costa@email.com', '2011-12-05', '(51) 99999-4444', 'Sub14',
 '2024-11-23', '15:00', '2024-11-23', '20:00',
 'Aniversário familiar', 'Carlos Costa', '(51) 98888-4444',
 'Aguardando Supervisor'),

('sol-005', 'AUTH-2024-005', 'Rafael Alves', 'rafael.alves@email.com', '2009-07-18', '(51) 99999-5555', 'Sub16',
 '2024-11-24', '13:00', '2024-11-24', '21:00',
 'Consulta odontológica', 'Fernanda Alves', '(51) 98888-5555',
 'Aguardando Supervisor');
