#!/bin/bash
# Script para resetar o banco de dados local

echo "🗑️  Removendo banco local antigo..."
rm -rf .wrangler/state/v3/d1

echo "✅ Banco removido!"
echo ""
echo "📝 Agora execute:"
echo "  wrangler d1 execute autorizacoes-db --file=./src/db/schema.sql"
echo "  wrangler d1 execute autorizacoes-db --file=./src/db/seed.sql"
