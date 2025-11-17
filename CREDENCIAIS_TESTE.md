# Credenciais de Teste - Sistema de Autorizações SC Internacional

**Data de Atualização:** 17 de novembro de 2025

---

## 🔐 Usuários de Teste

### Atletas

Todos os atletas usam a senha: **`atleta123`**

| Email | Nome | Categoria | Perfil |
|-------|------|-----------|--------|
| `joao.silva@inter.com` | João da Silva | Sub-17 | atleta |
| `pedro.santos@inter.com` | Pedro Santos | Sub-20 | atleta |
| `lucas.oliveira@inter.com` | Lucas Oliveira | Sub-15 | atleta |
| `gabriel.costa@inter.com` | Gabriel Costa | Sub-14 | atleta |
| `rafael.alves@inter.com` | Rafael Alves | Sub-16 | atleta |
| `carlos.mendes@inter.com` | Carlos Mendes | Sub-17 | atleta |
| `bruno.ferreira@inter.com` | Bruno Ferreira | Sub-17 | atleta |

### Staff (Supervisores)

Todos os supervisores usam a senha: **`senha123`**

| Email | Nome | Categoria | Perfil |
|-------|------|-----------|--------|
| `sup14@inter.com` | Supervisor Sub-14 | Sub-14 | supervisor |
| `sup15@inter.com` | Supervisor Sub-15 | Sub-15 | supervisor |
| `sup16@inter.com` | Supervisor Sub-16 | Sub-16 | supervisor |
| `sup17@inter.com` | Supervisor Sub-17 | Sub-17 | supervisor |
| `sup20@inter.com` | Supervisor Sub-20 | Sub-20 | supervisor |

### Serviço Social e Monitor

Senha: **`senha123`**

| Email | Nome | Perfil |
|-------|------|--------|
| `servicosocial@inter.com` | Serviço Social | servicosocial |
| `monitor@inter.com` | Monitor | monitor |

### Administrador

Senha: **`senha123`**

| Email | Nome | Perfil |
|-------|------|--------|
| `admin@inter.com` | Administrador | admin |

---

## 🧪 Cenários de Teste

### Teste 1: Login e Criação de Solicitação (Atleta)

1. Acesse: https://sistema-autorizacoes-sc.pages.dev/
2. Faça login com: `joao.silva@inter.com` / `atleta123`
3. Crie uma nova solicitação de saída
4. Verifique se aparece no dashboard do atleta

### Teste 2: Aprovação de Supervisor

1. Faça logout
2. Faça login com: `sup17@inter.com` / `senha123`
3. Visualize a solicitação pendente do João da Silva (Sub-17)
4. Aprove ou reprove a solicitação

### Teste 3: Fluxo Completo

1. **Atleta** cria solicitação
2. **Supervisor** aprova
3. **Serviço Social** envia link aos pais
4. **Pais** aprovam via link público
5. **Serviço Social** dá aprovação final
6. **Monitor** registra saída e retorno

---

## 📝 Notas Importantes

- As senhas estão hasheadas com bcrypt (10 rounds)
- Todos os usuários estão ativos por padrão
- Os atletas só podem ver suas próprias solicitações
- Supervisores só veem solicitações de sua categoria
- Admin tem acesso total ao sistema

---

## 🔄 Aplicar Migração no Banco de Produção

Para adicionar os usuários atletas no banco de produção:

```bash
# Navegue até o diretório do backend
cd backend

# Execute a migração no banco de produção
wrangler d1 execute autorizacoes-db --file=./migrations/003_add_atleta_support.sql

# Verifique se os usuários foram criados
wrangler d1 execute autorizacoes-db --command="SELECT email, nome, perfil, categoria FROM usuarios WHERE perfil = 'atleta'"
```

---

**Hash bcrypt da senha `atleta123`:**
```
$2a$10$N3FzyjqdQ5Ei70Vd30sqNO.CVxo6qc3VWY.UMUdPhx6BdZthy2HI6
```

**Hash bcrypt da senha `senha123`:**
```
$2a$10$rKZhYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU9qZ5y5zXO5kYxGdwqbqU
```
