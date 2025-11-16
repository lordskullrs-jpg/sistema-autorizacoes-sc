# Verificação do Banco de Dados D1

## ✅ Schema Atual (Correto)

O schema no código está **correto** e **não usa `atleta_id`**. 

### Tabela: usuarios
- ✅ Apenas para staff (supervisor, servicosocial, monitor, admin)
- ✅ Sem perfil "atleta"
- ✅ Campo `categoria` apenas para supervisores

### Tabela: solicitacoes
- ✅ **NÃO tem campo `atleta_id`** (correto!)
- ✅ Usa `codigo_unico` para identificação pública
- ✅ Dados do atleta armazenados diretamente (nome, email, etc.)
- ✅ Fluxo de aprovação completo

## ⚠️ Problema Identificado

O arquivo `backend/src/services/solicitacao-service.ts` tem um método `criar()` que **tenta usar `atleta_id`** (linha 26), mas:

1. A rota pública (`backend/src/routes/publico.ts`) **NÃO usa esse método**
2. A rota pública insere diretamente no banco (correto)
3. O serviço não é usado para criação pública

## 🔧 Correção Necessária

### Opção 1: Remover método `criar()` do serviço
- Não é usado pela rota pública
- Evita confusão

### Opção 2: Corrigir método `criar()` 
- Remover parâmetro `atletaId`
- Ajustar para não usar `atleta_id`

## 📊 Verificar Banco Atual

Para verificar se seu banco D1 está com o schema correto, execute:

```bash
# Listar tabelas
wrangler d1 execute autorizacoes-db --command "SELECT name FROM sqlite_master WHERE type='table';"

# Ver estrutura da tabela solicitacoes
wrangler d1 execute autorizacoes-db --command "PRAGMA table_info(solicitacoes);"

# Ver estrutura da tabela usuarios
wrangler d1 execute autorizacoes-db --command "PRAGMA table_info(usuarios);"

# Contar registros
wrangler d1 execute autorizacoes-db --command "SELECT COUNT(*) as total FROM solicitacoes;"
wrangler d1 execute autorizacoes-db --command "SELECT COUNT(*) as total FROM usuarios;"
```

## ✅ O Que Verificar

### 1. Tabela `solicitacoes` deve ter:
- ✅ `id` (TEXT PRIMARY KEY)
- ✅ `codigo_unico` (TEXT UNIQUE NOT NULL)
- ✅ `nome` (TEXT NOT NULL)
- ✅ `email` (TEXT NOT NULL)
- ✅ `data_nascimento` (TEXT NOT NULL)
- ✅ `telefone` (TEXT NOT NULL)
- ✅ `categoria` (TEXT NOT NULL)
- ✅ `data_saida` (TEXT NOT NULL)
- ✅ `horario_saida` (TEXT NOT NULL)
- ✅ `data_retorno` (TEXT NOT NULL)
- ✅ `horario_retorno` (TEXT NOT NULL)
- ✅ `motivo_destino` (TEXT NOT NULL)
- ✅ `nome_responsavel` (TEXT NOT NULL)
- ✅ `telefone_responsavel` (TEXT NOT NULL)
- ✅ `status_supervisor` (TEXT DEFAULT 'Pendente')
- ✅ `status_pais` (TEXT DEFAULT 'Pendente')
- ✅ `status_servico_social` (TEXT DEFAULT 'Pendente')
- ✅ `status_monitor` (TEXT DEFAULT 'Pendente')
- ✅ `status_geral` (TEXT DEFAULT 'Aguardando Supervisor')
- ✅ `status_final` (TEXT DEFAULT 'Em Análise')
- ✅ `dispositivo_info` (TEXT)
- ✅ `criado_em` (TEXT)
- ✅ `atualizado_em` (TEXT)
- ❌ **NÃO deve ter `atleta_id`**

### 2. Tabela `usuarios` deve ter:
- ✅ `id` (TEXT PRIMARY KEY)
- ✅ `email` (TEXT UNIQUE NOT NULL)
- ✅ `senha_hash` (TEXT NOT NULL)
- ✅ `nome` (TEXT NOT NULL)
- ✅ `perfil` (TEXT NOT NULL) - valores: supervisor, servicosocial, monitor, admin
- ✅ `categoria` (TEXT) - apenas para supervisores
- ✅ `ativo` (INTEGER DEFAULT 1)
- ✅ `criado_em` (TEXT)
- ✅ `atualizado_em` (TEXT)

## 🚨 Se o Banco Estiver Desatualizado

Se o banco atual tiver `atleta_id` ou estrutura diferente:

### Opção 1: Recriar (se não tiver dados importantes)
```bash
# Dropar tabelas antigas
wrangler d1 execute autorizacoes-db --command "DROP TABLE IF EXISTS solicitacoes;"
wrangler d1 execute autorizacoes-db --command "DROP TABLE IF EXISTS usuarios;"

# Recriar com schema correto
wrangler d1 execute autorizacoes-db --file=src/db/schema.sql

# Inserir dados de teste
wrangler d1 execute autorizacoes-db --file=src/db/seed.sql
```

### Opção 2: Migração (se tiver dados importantes)
```sql
-- Criar nova tabela
CREATE TABLE solicitacoes_new AS SELECT ... FROM solicitacoes;

-- Copiar dados (sem atleta_id)
INSERT INTO solicitacoes_new SELECT ... FROM solicitacoes;

-- Renomear
DROP TABLE solicitacoes;
ALTER TABLE solicitacoes_new RENAME TO solicitacoes;
```

## 📝 Recomendação

**Se o sistema ainda não está em produção com dados reais:**
- ✅ Recriar o banco do zero com o schema correto
- ✅ Executar seed.sql para dados de teste
- ✅ Testar fluxo completo

**Se já tem dados em produção:**
- ⚠️ Fazer backup primeiro
- ⚠️ Criar script de migração
- ⚠️ Testar em ambiente de desenvolvimento

---

**Próximos passos:**
1. Você: Verificar estrutura atual do banco
2. Você: Me informar se precisa migração ou recriação
3. Eu: Preparar script adequado
4. Deploy e testes
