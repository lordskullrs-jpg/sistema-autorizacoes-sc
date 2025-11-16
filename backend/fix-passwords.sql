Gerando hashes bcrypt para senha: senha123

================================================================================

-- SQL para atualizar senhas dos usuários

UPDATE usuarios SET senha_hash = '$2a$10$/IgmxYUwqGqZw9Xh0WhSJeWeqmB36Pb78ZAiuGyoVRTKSJsmEI7Rm' WHERE id = 'admin-001'; -- Administrador
UPDATE usuarios SET senha_hash = '$2a$10$JOqjbZsnxXVNqRcVPU2vOeWryz7n7KmSI8O1GjM.szo8sgGKoltNa' WHERE id = 'sup14-001'; -- Supervisor Sub-14
UPDATE usuarios SET senha_hash = '$2a$10$JQlslWznzCKtGegHXqrP9OY2Wu5r/6pNdLSqUU0xqXlcSsYDE8rbC' WHERE id = 'sup15-001'; -- Supervisor Sub-15
UPDATE usuarios SET senha_hash = '$2a$10$ION8mtz96QdPBbrcyjtn2uc3n2mh4PZvWi8caU.HoWVUpu3Q/n1Au' WHERE id = 'sup16-001'; -- Supervisor Sub-16
UPDATE usuarios SET senha_hash = '$2a$10$9BOZd9sttESpSQOh1QYB1u/Bak/S96tlozVxG9.X8kQP4lgQ0n1gW' WHERE id = 'sup17-001'; -- Supervisor Sub-17
UPDATE usuarios SET senha_hash = '$2a$10$SUoxi1zVnvEAtFDTIyCt7up761F1aZV3s1ijzKO3zege5eL5OivMa' WHERE id = 'sup20-001'; -- Supervisor Sub-20
UPDATE usuarios SET senha_hash = '$2a$10$.Y/xBKw3LuMIaA8RKUBdBuFQdaBGpnB15NgoEIwL9.KpjBAsbYlki' WHERE id = 'ss-001'; -- Serviço Social
UPDATE usuarios SET senha_hash = '$2a$10$Gho5l7RDjLV6fuTV0WCNK.tNIgqm5URUUpIdZH9Q9UU4m0jrU58z.' WHERE id = 'monitor-001'; -- Monitor

================================================================================

Hash de exemplo completo (60 caracteres):
$2a$10$w/WS6ORx0cMnQC2sCuKQIOFRn7v0whMTabBqjn4RHDMdQJw2Ez5/m
Tamanho: 60 caracteres
