# Análise Inicial do Projeto - Sistema de Autorizações SC Internacional

**Data:** 17 de novembro de 2025  
**Analista:** Especialista TypeScript & Cloudflare  
**Objetivo:** Análise completa de fluxos, tecnologias e configurações antes de correção de erros de deploy

---

## 📋 Visão Geral do Projeto

O **Sistema de Autorizações de Saída** é uma aplicação full-stack desenvolvida para o SC Internacional, permitindo o gerenciamento de autorizações de saída de atletas com aprovação de supervisores, serviço social, pais e controle de monitores.

### Arquitetura

- **Frontend:** React 19 + TypeScript + Vite + React Router
- **Backend:** Cloudflare Workers + Hono Framework + TypeScript
- **Banco de Dados:** Cloudflare D1 (SQL Serverless)
- **Armazenamento de Sessões:** Cloudflare KV
- **Deploy:** Cloudflare Pages (Frontend) + Cloudflare Workers (Backend)

---

## 🏗️ Estrutura do Projeto

```
sistema-autorizacoes-sc/
├── backend/                    # API Backend (Cloudflare Workers)
│   ├── src/
│   │   ├── routes/            # Endpoints da API
│   │   ├── middleware/        # Autenticação e autorização
│   │   ├── services/          # Lógica de negócio
│   │   ├── types/             # Definições TypeScript
│   │   ├── utils/             # Utilitários
│   │   └── index.ts           # Entry point
│   ├── migrations/            # Migrações do banco
│   ├── wrangler.toml          # Configuração Cloudflare Workers
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Interface Web (React)
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── contexts/          # Context API (Auth)
│   │   ├── services/          # Chamadas à API
│   │   ├── types/             # Tipos TypeScript
│   │   └── styles/            # CSS
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── [Documentação em Markdown]
```

---

## 🔧 Tecnologias Identificadas

### Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Hono** | ^4.6.14 | Framework web minimalista para Workers |
| **TypeScript** | ^5.7.2 | Linguagem tipada |
| **bcryptjs** | ^2.4.3 | Hash de senhas |
| **jsonwebtoken** | ^9.0.2 | Autenticação JWT |
| **Wrangler** | ^4.47.0 | CLI do Cloudflare Workers |
| **Cloudflare D1** | - | Banco SQL serverless |
| **Cloudflare KV** | - | Armazenamento chave-valor |

### Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | ^19.2.0 | Biblioteca UI |
| **React DOM** | ^19.2.0 | Renderização DOM |
| **React Router DOM** | ^7.9.6 | Roteamento SPA |
| **TypeScript** | ~5.9.3 | Linguagem tipada |
| **Vite** | ^7.2.2 | Build tool e dev server |
| **ESLint** | ^9.39.1 | Linter |

---

## 🔐 Fluxo de Autenticação

### Perfis de Usuário

1. **Atleta:** Cria solicitações de saída
2. **Supervisor:** Aprova/reprova solicitações da sua categoria
3. **Serviço Social:** Envia link aos pais e aprovação final
4. **Monitor:** Controla saída/retorno físico dos atletas
5. **Admin:** Gerenciamento completo do sistema

### Fluxo de Autenticação JWT

```
1. Login (POST /auth/login)
   ↓
2. Backend valida credenciais (bcrypt)
   ↓
3. Gera JWT token (jsonwebtoken)
   ↓
4. Armazena sessão no KV
   ↓
5. Frontend armazena token
   ↓
6. Requisições incluem header Authorization: Bearer <token>
   ↓
7. Middleware valida token e permissões
```

---

## 📊 Fluxo de Solicitação de Saída

### Estados da Solicitação

1. **Pendente Supervisor** → Aguardando aprovação do supervisor
2. **Aprovada Supervisor** → Aguardando serviço social
3. **Pendente Pais** → Link enviado aos pais
4. **Aprovada Pais** → Aguardando aprovação serviço social
5. **Aprovada Final** → Aguardando saída
6. **Em Andamento** → Atleta saiu
7. **Concluída** → Atleta retornou
8. **Reprovada** → Negada em alguma etapa

### Fluxo Completo

```
Atleta cria solicitação
    ↓
Supervisor aprova/reprova
    ↓
Serviço Social envia link WhatsApp aos pais
    ↓
Pais aprovam/reprovam (via link público)
    ↓
Serviço Social aprovação final
    ↓
Monitor registra saída
    ↓
Monitor registra retorno
    ↓
Solicitação concluída
```

---

## 🌐 Endpoints da API

### Públicos (sem autenticação)

- `GET /publico/consultar/:codigo` - Consulta pública por código único
- `GET /aprovacao-pais/:token` - Validar token de aprovação dos pais
- `POST /aprovacao-pais/:token` - Aprovar/reprovar pelos pais
- `POST /reset-password/request` - Solicitar redefinição de senha
- `POST /reset-password/reset` - Redefinir senha com token

### Autenticação

- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Dados do usuário logado
- `POST /auth/change-password` - Alterar senha

### Atletas (requer auth)

- `POST /atleta/solicitacoes` - Criar solicitação
- `GET /atleta/solicitacoes` - Listar minhas solicitações

### Solicitações (Staff)

- `GET /solicitacoes` - Listar todas (filtrado por perfil)
- `GET /solicitacoes/:id` - Detalhes de uma solicitação
- `PUT /solicitacoes/:id/supervisor` - Aprovar/reprovar (Supervisor)
- `POST /solicitacoes/:id/enviar-link-pais` - Enviar link WhatsApp
- `PUT /solicitacoes/:id/servico-social` - Aprovar/reprovar (Serviço Social)
- `PUT /solicitacoes/:id/monitor` - Atualizar status (Monitor)

### Admin (requer auth admin)

- `GET /admin/usuarios` - Listar usuários
- `POST /admin/usuarios` - Criar usuário
- `PUT /admin/usuarios/:id` - Editar usuário
- `DELETE /admin/usuarios/:id` - Excluir usuário
- `POST /admin/usuarios/:id/reset-password` - Resetar senha

---

## ⚙️ Configurações do Cloudflare

### Backend (wrangler.toml)

```toml
name = "autorizacoes-backend"
main = "src/index.ts"
compatibility_date = "2024-11-15"
compatibility_flags = ["nodejs_compat"]

# D1 Database
database_name = "autorizacoes-db"
database_id = "fb65cc96-00fc-42e6-a0ff-e549eefff811"

# KV Namespace (Sessões)
binding = "SESSIONS"
id = "80f67c72255541d186cdae935f11c5bd"

# Variáveis
JWT_SECRET = "CIPEfeiGlvmJcLhH1BKDV4urzwRk8qOZaFs2Yxt7QSMbo60NUTjd5XWnp9y3gA"
WHATSAPP_API_URL = "https://wa.me"
```

### Frontend (Deploy via Cloudflare Pages)

- Build command: `pnpm build`
- Output directory: `dist`
- Framework: Vite

---

## 🔍 Problemas Conhecidos (Análise Prévia)

### Críticos

1. **Duplicação de código backend** - Código duplicado em `/src/` e `/backend/src/`
2. **URL da API duplicada** - Chamadas ficam `/api/api/...` (404)
3. **Endpoint inconsistente** - `/enviar-pais` vs `/enviar-link-pais`

### Importantes

4. Middleware `requireCategoria` sem `await`
5. Campos faltantes nas interfaces TypeScript
6. Configuração wrangler duplicada

### Melhorias

7. CORS muito permissivo
8. Falta `.env.example` no frontend
9. Tratamento de erro inadequado

---

## 📱 Análise de Responsividade Móvel

### Status Atual

**Não há evidências de design responsivo implementado:**

- ❌ Nenhum arquivo CSS com media queries identificado
- ❌ Sem framework CSS responsivo (Tailwind, Bootstrap, etc.)
- ❌ Componentes não utilizam unidades responsivas
- ❌ Sem viewport meta tag verificada

### Páginas que Requerem Adaptação

1. **Login/LoginAtleta** - Formulários de autenticação
2. **Dashboard*** - Todas as dashboards (Admin, Atleta, Monitor, Supervisor, Serviço Social)
3. **Solicitar** - Formulário de criação de solicitação
4. **Consultar** - Consulta pública
5. **AprovacaoPais** - Interface de aprovação dos pais
6. **RedefinirSenha** - Redefinição de senha

### Componentes que Requerem Adaptação

- **Header/DashboardHeader** - Navegação
- **Card/DashboardCard** - Cards de informação
- **Modais** - Todos os modais (Adicionar/Editar/Excluir usuário, Redefinir senha)
- **Tabelas** - Listagens de solicitações e usuários
- **Formulários** - Todos os formulários

---

## 🎯 Próximos Passos (Fase 3)

1. ✅ **Fase 1 Concluída:** Clonar repositório e análise inicial
2. ✅ **Fase 2 Concluída:** Análise detalhada de tecnologias e fluxos
3. 🔄 **Fase 3:** Verificar erros de deploy no Cloudflare via navegador
4. ⏳ **Fase 4:** Diagnosticar e corrigir erros de deploy
5. ⏳ **Fase 5:** Adaptar interface para dispositivos móveis
6. ⏳ **Fase 6:** Testes de QA e validação final
7. ⏳ **Fase 7:** Apresentar resultados e documentação

---

## 📝 Observações Importantes

### Gerenciador de Pacotes

- Projeto utiliza **pnpm** (versão 10.22.0)
- Lockfiles presentes: `pnpm-lock.yaml`

### Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- JWT com expiração de 7 dias
- Sessões no KV para invalidação
- Auditoria de ações no banco

### Custos

- Projeto dentro do **free tier** do Cloudflare
- 100k requisições/dia (Workers)
- 5GB storage + 5M leituras/dia (D1)
- 100k leituras + 1k escritas/dia (KV)

---

**Análise preparada para prosseguir com verificação de erros de deploy no Cloudflare.**
