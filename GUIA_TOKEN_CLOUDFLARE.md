# Guia: Como Criar Token da API Cloudflare

## 🎯 Objetivo
Criar um token de API com permissões para fazer deploy do sistema completo (Frontend, Backend, D1, KV).

---

## 📋 Passo a Passo

### 1. Acessar a Página de Tokens
- URL: https://dash.cloudflare.com/profile/api-tokens
- Clique em **"Criar token"**

### 2. Selecionar Permissões

#### ✅ Permissão 1: Cloudflare Pages
- **Nome:** Editar Cloudflare Pages
- **Nível:** Account
- **Permissão:** Edit (Editar)
- **Clique em:** "Usar modelo"

#### ✅ Permissão 2: Cloudflare Workers
- **Nome:** Editar scripts do Cloudflare Workers
- **Nível:** Account
- **Permissão:** Edit (Editar)
- **Clique em:** "Usar modelo"

#### ✅ Permissão 3: D1 Database
- **Nome:** Editar D1
- **Nível:** Account
- **Permissão:** Edit (Editar)
- **Clique em:** "Usar modelo"

#### ✅ Permissão 4: Workers KV Storage
- **Nome:** Editar armazenamento Workers KV
- **Nível:** Account
- **Permissão:** Edit (Editar)
- **Clique em:** "Usar modelo"

### 3. Configurar Recursos da Conta
- **Account Resources:** Selecione sua conta
- **Zone Resources:** Pode deixar "All zones" ou específico

### 4. Configurações Opcionais
- **IP Filtering:** Deixe em branco (qualquer IP)
- **TTL:** Deixe padrão ou configure expiração

### 5. Finalizar
1. Role até o final
2. Clique em **"Continuar para o resumo"**
3. Revise todas as permissões
4. Clique em **"Criar token"**

### 6. Copiar Token
⚠️ **IMPORTANTE:** O token será exibido apenas UMA VEZ!

```
Copie o token e guarde em local seguro
Exemplo: cf_token_abc123xyz456...
```

---

## 🔒 Segurança

### ✅ Boas Práticas
- Nunca compartilhe o token publicamente
- Não commite o token no Git
- Use variáveis de ambiente
- Revogue tokens não utilizados

### ❌ Não Fazer
- Não poste o token em issues públicas
- Não envie por email não criptografado
- Não deixe em arquivos de configuração versionados

---

## 🚀 Uso do Token

### No Wrangler (CLI)
```bash
# Configurar token
export CLOUDFLARE_API_TOKEN="seu_token_aqui"

# Ou usar wrangler login
wrangler login
```

### No GitHub Actions
```yaml
env:
  CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Manualmente
```bash
# Deploy do Worker
wrangler deploy --env production

# Deploy do Pages
wrangler pages deploy ./dist

# Executar migration D1
wrangler d1 execute DB_NAME --file=schema.sql
```

---

## 🔍 Verificar Token

### Testar se o token funciona
```bash
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

### Resposta esperada
```json
{
  "success": true,
  "result": {
    "id": "...",
    "status": "active"
  }
}
```

---

## 📊 Permissões Resumidas

| Recurso | Permissão | Necessário Para |
|---------|-----------|-----------------|
| Cloudflare Pages | Edit | Deploy do Frontend |
| Workers Scripts | Edit | Deploy do Backend |
| D1 Database | Edit | Migrations e Queries |
| Workers KV | Edit | Sessões e Cache |

---

## 🆘 Problemas Comuns

### Token não funciona
- Verifique se copiou o token completo
- Confirme que as permissões estão corretas
- Verifique se o token não expirou

### Erro de permissão
- Revise as permissões do token
- Crie um novo token se necessário
- Verifique se está usando a conta correta

### Token expirado
- Crie um novo token
- Configure TTL maior ou sem expiração

---

## 📞 Suporte

Se tiver problemas:
1. Revogue o token antigo
2. Crie um novo seguindo este guia
3. Teste com `wrangler whoami`

---

**Documento criado:** 2025-11-15
**Versão:** 1.0
