-- Seed adicional: Usuários Atletas
-- Sistema de Autorizações SC Internacional
-- Senha padrão para todos os atletas: atleta123
-- Hash bcrypt gerado com: bcrypt.hash('atleta123', 10)

-- Inserir usuários atletas (um de cada categoria para testes)
INSERT INTO usuarios (id, email, senha_hash, nome, perfil, categoria, ativo) VALUES
-- Atleta Sub-14
('atleta-sub14-001', 'gabriel.costa@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Gabriel Costa', 'atleta', 'Sub14', 1),

-- Atleta Sub-15
('atleta-sub15-001', 'lucas.oliveira@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Lucas Oliveira', 'atleta', 'Sub15', 1),

-- Atleta Sub-16
('atleta-sub16-001', 'rafael.alves@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Rafael Alves', 'atleta', 'Sub16', 1),

-- Atleta Sub-17
('atleta-sub17-001', 'joao.silva@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'João da Silva', 'atleta', 'Sub17', 1),

-- Atleta Sub-20
('atleta-sub20-001', 'pedro.santos@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Pedro Santos', 'atleta', 'Sub20', 1),

-- Atletas adicionais para testes
('atleta-sub17-002', 'carlos.mendes@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Carlos Mendes', 'atleta', 'Sub17', 1),
('atleta-sub17-003', 'bruno.ferreira@inter.com', '$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6', 'Bruno Ferreira', 'atleta', 'Sub17', 1);
