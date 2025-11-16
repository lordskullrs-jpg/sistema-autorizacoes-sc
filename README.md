# Backend - Sistema de Autorizações de Saída

Backend API construído com Cloudflare Workers, D1 (SQL) e KV para o Sistema de Autorizações de Saída do SC Internacional.

## Tecnologias

- **Cloudflare Workers**: Serverless functions
- **Cloudflare D1**: Banco de dados SQL serverless
- **Cloudflare KV**: Key-Value storage para sessões
- **Hono**: Framework web leve e rápido
- **TypeScript**: Linguagem tipada
- **JWT**: Autenticação com tokens
- **bcryptjs**: Hash de senhas

## Estrutura

```
backend/
├── src/
│   ├── routes/           # Rotas da API
│   │   ├── auth.ts       # Autenticação
│   │   ├── solicitacoes.ts # CRUD de solicitações
│   │   └── aprovacao.ts  # Aprovação dos pais
│   ├── middleware/       # Middlewares
│   │   └── auth.ts       # Autenticação e autorização
│   ├── services/         # Lógica de negócio
│   │   ├── auth-service.ts
│   │   ├── solicitacao-service.ts
│   │   └── whatsapp-service.ts
│   ├── db/               # Database
│   │   ├── schema.sql    # Schema do banco
│   │   └── seed.sql      # Dados iniciais
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilitários
│   └── index.ts          # Entry point
├── wrangler.toml         # Configuração Cloudflare
├── package.json
└── tsconfig.json
```

## Endpoints da API

### Autenticação

- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário logado
- `POST /api/auth/change-password` - Alterar senha

### Solicitações

- `POST /api/solicitacoes` - Criar solicitação (Atleta)
- `GET /api/solicitacoes` - Listar solicitações (filtrado por perfil)
- `GET /api/solicitacoes/:id` - Detalhes de uma solicitação
- `PUT /api/solicitacoes/:id/supervisor` - Aprovar/reprovar (Supervisor)
- `POST /api/solicitacoes/:id/enviar-link-pais` - Enviar link WhatsApp
- `PUT /api/solicitacoes/:id/servico-social` - Aprovar/reprovar (Serviço Social)
- `PUT /api/solicitacoes/:id/monitor` - Atualizar status (Monitor)

### Aprovação dos Pais

- `GET /api/aprovacao/:token` - Validar token e obter dados
- `POST /api/aprovacao/:token` - Aprovar/reprovar (Pais)

## Desenvolvimento

### Pré-requisitos

- Node.js 18+
- pnpm
- Conta Cloudflare (free tier)
- Wrangler CLI

### Instalação

```bash
pnpm install
```

### Configurar Banco de Dados

```bash
# Criar banco D1 local
wrangler d1 create autorizacoes-db --local

# Executar schema
pnpm run db:init

# Popular com dados de teste
pnpm run db:seed
```

### Executar Localmente

```bash
pnpm dev
```

A API estará disponível em `http://localhost:8787`

### Deploy

```bash
# Deploy para produção
pnpm deploy
```

## Autenticação

Todas as rotas (exceto `/api/aprovacao/*`) requerem autenticação via JWT.

### Exemplo de Requisição

```bash
# Login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "atleta@inter.com.br", "senha": "senha123"}'

# Usar token nas requisições
curl http://localhost:8787/api/solicitacoes \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

## Perfis e Permissões

- **Atleta**: Criar e consultar próprias solicitações
- **Supervisor**: Aprovar/reprovar solicitações da sua categoria
- **Serviço Social**: Enviar link aos pais e aprovação final
- **Monitor**: Controlar saída/retorno dos atletas
- **Admin**: Acesso total

## Usuários de Teste

Senha padrão: `senha123`

- admin@inter.com.br (Admin)
- supervisor.sub17@inter.com.br (Supervisor Sub17)
- servicosocial@inter.com.br (Serviço Social)
- monitor@inter.com.br (Monitor)
- joao.silva@inter.com.br (Atleta Sub17)

## Variáveis de Ambiente

Configuradas em `wrangler.toml`:

- `JWT_SECRET`: Segredo para assinar tokens JWT
- `WHATSAPP_API_URL`: URL base da API do WhatsApp

## Banco de Dados

### Schema

- **usuarios**: Dados dos usuários e perfis
- **solicitacoes**: Autorizações de saída

Ver `src/db/schema.sql` para detalhes completos.

## Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- Tokens JWT com expiração de 7 dias
- Sessões armazenadas no Cloudflare KV
- Validação de permissões por perfil
- Auditoria completa de todas as ações

## Custos

**R$ 0,00/mês** dentro do free tier:

- Workers: 100.000 requisições/dia
- D1: 5GB storage, 5 milhões leituras/dia
- KV: 100.000 leituras/dia, 1.000 escritas/dia

## Suporte

Para dúvidas ou problemas, consulte a documentação do Cloudflare Workers:
https://developers.cloudflare.com/workers/
