# 🔐 Como Atualizar Senhas dos Usuários no Banco D1

## ⚠️ URGENTE: Este passo é OBRIGATÓRIO para o sistema funcionar!

Atualmente, **nenhum usuário consegue fazer login** porque os hashes de senha no banco estão incorretos.

---

## Opção 1: Via CLI do Wrangler (Recomendado)

### Pré-requisitos:
- Token do Cloudflare com permissões para D1
- Wrangler instalado

### Passos:

```bash
# 1. Navegar até o diretório backend
cd backend

# 2. Executar o script SQL no banco remoto
CLOUDFLARE_API_TOKEN="seu-token-aqui" pnpm wrangler d1 execute autorizacoes-db --remote --file=fix-passwords.sql
```

---

## Opção 2: Via Console Web do Cloudflare (Mais Fácil)

### Passos:

1. **Acesse o Dashboard do Cloudflare:**
   - https://dash.cloudflare.com

2. **Navegue até D1:**
   - Workers & Pages → D1 SQL Database
   - Clique em `autorizacoes-db`

3. **Abra o Console:**
   - Clique na aba "Console"

4. **Execute os comandos UPDATE:**

Copie e cole os comandos abaixo **um por um** no console:

```sql
UPDATE usuarios SET senha_hash = '$2a$10$/IgmxYUwqGqZw9Xh0WhSJeWeqmB36Pb78ZAiuGyoVRTKSJsmEI7Rm' WHERE id = 'admin-001';

UPDATE usuarios SET senha_hash = '$2a$10$JOqjbZsnxXVNqRcVPU2vOeWryz7n7KmSI8O1GjM.szo8sgGKoltNa' WHERE id = 'sup14-001';

UPDATE usuarios SET senha_hash = '$2a$10$JQlslWznzCKtGegHXqrP9OY2Wu5r/6pNdLSqUU0xqXlcSsYDE8rbC' WHERE id = 'sup15-001';

UPDATE usuarios SET senha_hash = '$2a$10$ION8mtz96QdPBbrcyjtn2uc3n2mh4PZvWi8caU.HoWVUpu3Q/n1Au' WHERE id = 'sup16-001';

UPDATE usuarios SET senha_hash = '$2a$10$9BOZd9sttESpSQOh1QYB1u/Bak/S96tlozVxG9.X8kQP4lgQ0n1gW' WHERE id = 'sup17-001';

UPDATE usuarios SET senha_hash = '$2a$10$SUoxi1zVnvEAtFDTIyCt7up761F1aZV3s1ijzKO3zege5eL5OivMa' WHERE id = 'sup20-001';

UPDATE usuarios SET senha_hash = '$2a$10$.Y/xBKw3LuMIaA8RKUBdBuFQdaBGpnB15NgoEIwL9.KpjBAsbYlki' WHERE id = 'ss-001';

UPDATE usuarios SET senha_hash = '$2a$10$Gho5l7RDjLV6fuTV0WCNK.tNIgqm5URUUpIdZH9Q9UU4m0jrU58z.' WHERE id = 'monitor-001';
```

5. **Verificar se funcionou:**

```sql
SELECT id, email, nome, perfil, LENGTH(senha_hash) as tamanho_hash FROM usuarios;
```

Todos os usuários devem ter `tamanho_hash = 60`.

---

## ✅ Como Testar se Funcionou

### 1. Teste de Login - Admin
- URL: https://sistema-autorizacoes-sc.pages.dev/login
- Email: `admin@inter.com`
- Senha: `senha123`
- **Esperado:** Login bem-sucedido

### 2. Teste de Login - Supervisor
- Email: `sup17@inter.com`
- Senha: `senha123`
- **Esperado:** Login bem-sucedido e ver apenas solicitações Sub-17

### 3. Teste de Login - Serviço Social
- Email: `servicosocial@inter.com`
- Senha: `senha123`
- **Esperado:** Login bem-sucedido e ver todas as solicitações

---

## 📋 Lista de Usuários e Senhas

| Email | Senha | Perfil | Categoria |
|-------|-------|--------|-----------|
| `admin@inter.com` | `senha123` | Admin | - |
| `sup14@inter.com` | `senha123` | Supervisor | Sub14 |
| `sup15@inter.com` | `senha123` | Supervisor | Sub15 |
| `sup16@inter.com` | `senha123` | Supervisor | Sub16 |
| `sup17@inter.com` | `senha123` | Supervisor | Sub17 |
| `sup20@inter.com` | `senha123` | Supervisor | Sub20 |
| `servicosocial@inter.com` | `senha123` | Serviço Social | - |
| `monitor@inter.com` | `senha123` | Monitor | - |

---

## 🔒 Recomendações de Segurança

Após corrigir as senhas:

1. **Oriente os usuários a alterarem suas senhas** no primeiro login
2. **Não compartilhe a senha padrão** por canais inseguros
3. **Considere implementar** política de troca de senha periódica
4. **Habilite autenticação de dois fatores** (futuro)

---

## ❓ Problemas Comuns

### "Token inválido ou expirado"
- Verifique se o token tem permissões para D1
- Tente usar a Opção 2 (Console Web)

### "no such table: usuarios"
- Você está acessando o banco **local** em vez do **remoto**
- Use a flag `--remote` no wrangler

### "Senha incorreta" após atualizar
- Verifique se o hash foi copiado **completamente** (60 caracteres)
- Não deve ter espaços ou quebras de linha

---

## 📞 Suporte

Se continuar com problemas:
1. Verifique os logs do Cloudflare Workers
2. Confirme que o banco `autorizacoes-db` existe
3. Verifique se a tabela `usuarios` tem dados
