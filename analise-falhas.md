# Análise de Falhas - Sistema de Autorizações SC Internacional

## Data: 16 de novembro de 2025

## 🔍 Falhas Identificadas

### 1. **CRÍTICO: Duplicação de Código Backend**
**Problema:** O código do backend está duplicado em dois locais:
- `/src/` (raiz do projeto)
- `/backend/src/` (diretório backend)

**Impacto:** 
- Confusão sobre qual versão está sendo usada
- Possibilidade de editar o arquivo errado
- Inconsistências entre as duas versões
- Dificuldade de manutenção

**Solução:** Consolidar em um único local (`/backend/src/`) e remover duplicação da raiz.

---

### 2. **CRÍTICO: Configuração de API no Frontend**
**Arquivo:** `frontend/src/services/api.ts` (linha 3)

**Problema:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';
```

**Impacto:**
- A URL da API está apontando para `/api` duplicado
- As chamadas ficam: `${API_URL}/api/auth/login` = `/api/api/auth/login` (ERRO!)
- Todas as requisições do frontend falham com 404

**Solução:** Remover `/api` da constante ou das chamadas individuais.

---

### 3. **ERRO: Middleware de Autenticação - Tipo de Retorno**
**Arquivo:** `src/middleware/auth.ts` (linha 75)

**Problema:**
```typescript
export function requireCategoria(c: Context<{ Bindings: Env; Variables: AuthContext }>, next: Next) {
  // ...
  return next(); // ❌ Falta await
}
```

**Impacto:**
- Middleware não aguarda a execução do próximo handler
- Pode causar comportamento inesperado na cadeia de middlewares

**Solução:** Adicionar `async` e `await`:
```typescript
export async function requireCategoria(...) {
  // ...
  await next();
}
```

---

### 4. **AVISO: Falta Campo `codigo_unico` na Interface Solicitacao**
**Arquivo:** `src/types/index.ts`

**Problema:** A interface `Solicitacao` não inclui o campo `codigo_unico`, mas ele é usado em:
- `src/routes/publico.ts` (linha 33)
- Schema do banco de dados

**Impacto:**
- TypeScript não valida o campo
- Possíveis erros de tipagem

**Solução:** Adicionar campo à interface:
```typescript
export interface Solicitacao {
  id: string;
  codigo_unico: string; // ← ADICIONAR
  // ...
}
```

---

### 5. **AVISO: Falta Campos `token_pais` e `token_pais_expira_em` na Interface**
**Arquivo:** `src/types/index.ts`

**Problema:** A interface `Solicitacao` não inclui campos usados em `src/routes/solicitacoes.ts` (linhas 213-214):
```typescript
token_pais = ?,
token_pais_expira_em = ?,
```

**Impacto:**
- TypeScript não valida esses campos
- Inconsistência entre código e tipos

**Solução:** Adicionar campos à interface:
```typescript
export interface Solicitacao {
  // ...
  token_pais?: string;
  token_pais_expira_em?: string;
  // ...
}
```

---

### 6. **ERRO: Configuração do Wrangler Duplicada**
**Problema:** Existem dois arquivos `wrangler.toml`:
- `/wrangler.toml` (raiz)
- `/backend/wrangler.toml`

**Impacto:**
- Confusão sobre qual configuração está ativa
- Possível deploy do código errado

**Solução:** Manter apenas `/backend/wrangler.toml` e remover o da raiz.

---

### 7. **MELHORIA: CORS muito permissivo**
**Arquivo:** `src/index.ts` (linha 19)

**Problema:**
```typescript
origin: '*', // Em produção, especificar domínio do frontend
```

**Impacto:**
- Qualquer site pode fazer requisições à API
- Risco de segurança em produção

**Solução:** Configurar domínio específico:
```typescript
origin: ['https://sistema-autorizacoes-sc.pages.dev', 'http://localhost:5173'],
```

---

### 8. **ERRO: Endpoint `/enviar-pais` vs `/enviar-link-pais`**
**Problema:** Inconsistência entre backend e frontend:
- Backend: `POST /api/solicitacoes/:id/enviar-pais` (linha 184)
- Frontend: `enviarLinkPais` chama `/enviar-link-pais` (api.ts linha 90)

**Impacto:**
- Requisição do frontend retorna 404
- Funcionalidade não funciona

**Solução:** Padronizar para `/enviar-link-pais` ou atualizar frontend.

---

### 9. **AVISO: Falta Variável de Ambiente no Frontend**
**Arquivo:** `frontend/src/services/api.ts`

**Problema:** Não há arquivo `.env` ou `.env.example` no frontend

**Impacto:**
- Desenvolvedores não sabem qual URL configurar
- API sempre aponta para localhost em produção

**Solução:** Criar `.env.example`:
```env
VITE_API_URL=https://autorizacoes-backend.seu-dominio.workers.dev
```

---

### 10. **MELHORIA: Falta Tratamento de Erro no Login**
**Arquivo:** `src/services/auth-service.ts`

**Problema:** Uso de `bcrypt` sem tratamento de exceções específicas

**Impacto:**
- Se bcrypt falhar, retorna erro genérico 500
- Dificulta debugging

**Solução:** Adicionar try-catch específico para bcrypt.

---

## 📊 Resumo por Prioridade

### 🔴 CRÍTICO (Impede funcionamento)
1. Duplicação de código backend
2. URL da API duplicada (`/api/api/...`)
3. Endpoint inconsistente (`/enviar-pais` vs `/enviar-link-pais`)

### 🟡 IMPORTANTE (Causa bugs)
4. Middleware `requireCategoria` sem `await`
5. Falta campo `codigo_unico` na interface
6. Falta campos `token_pais` na interface
7. Configuração wrangler duplicada

### 🟢 MELHORIAS (Boas práticas)
8. CORS muito permissivo
9. Falta `.env.example` no frontend
10. Tratamento de erro no auth-service

---

## 🎯 Plano de Correção

1. **Consolidar backend** (remover duplicação)
2. **Corrigir URL da API** no frontend
3. **Padronizar endpoints** (enviar-link-pais)
4. **Corrigir middleware** requireCategoria
5. **Atualizar interfaces TypeScript** (adicionar campos faltantes)
6. **Configurar CORS** adequadamente
7. **Criar .env.example** no frontend
8. **Remover wrangler.toml** da raiz

---

## ✅ Próximos Passos

1. Aplicar correções críticas
2. Testar localmente com `wrangler dev`
3. Fazer commit das correções
4. Atualizar documentação
5. Deploy para produção
