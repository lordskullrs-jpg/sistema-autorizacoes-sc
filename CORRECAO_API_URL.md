# Correção da URL da API

## Problema Identificado

O frontend estava retornando erro 404 ao tentar fazer login porque a URL da API estava duplicando o `/api`:

- **URL configurada**: `https://autorizacoes-backend.lordskull-rs.workers.dev`
- **Endpoint chamado**: `/api/auth/login`
- **URL final (incorreta)**: `https://autorizacoes-backend.lordskull-rs.workers.dev/api/api/auth/login` ❌

## Causa

O arquivo `.env.production` estava com `/api` no final da URL:
```
VITE_API_URL=https://autorizacoes-backend.lordskull-rs.workers.dev/api
```

## Solução

Remover o `/api` do final da URL no `.env.production`:
```
VITE_API_URL=https://autorizacoes-backend.lordskull-rs.workers.dev
```

Agora a URL final será:
```
https://autorizacoes-backend.lordskull-rs.workers.dev/api/auth/login ✅
```

## Deploy

Este commit força um novo build do frontend no Cloudflare Pages para aplicar a correção.

---
**Data**: 2025-11-16
**Autor**: Manus Agent
