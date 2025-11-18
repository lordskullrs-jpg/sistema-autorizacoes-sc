# QA Issues #002 a #009 - Correções de UI/UX e API

**Data:** 17 de novembro de 2025  
**Responsável:** Manus AI - QA Engineer  
**Tipo:** Correções múltiplas de UI/UX e API

---

## 📋 RESUMO DAS CORREÇÕES

Este documento detalha as correções aplicadas para resolver os problemas identificados durante os testes de QA.

---

## ✅ Issue #002 - Erro de API na Consulta Pública

### Problema
A página de consulta pública não conseguia buscar informações da solicitação devido a URL hardcoded apontando para localhost.

### Causa Raiz
**Arquivo:** `frontend/src/pages/Consultar.tsx` (linha 28)
```typescript
// ANTES (ERRADO)
const response = await fetch(`http://127.0.0.1:8787/api/publico/consultar/${codigo}`);
```

### Solução Aplicada
1. Adicionada função `consultarPublico` no serviço de API
2. Removido fetch hardcoded
3. Implementado uso correto da variável de ambiente `VITE_API_URL`

**Arquivos Modificados:**
- `frontend/src/services/api.ts` - Adicionada função `consultarPublico()`
- `frontend/src/pages/Consultar.tsx` - Substituído fetch por `api.consultarPublico()`

**Código Corrigido:**
```typescript
// DEPOIS (CORRETO)
import { api } from '../services/api';

// ...
const result = await api.consultarPublico(codigo);
```

### Resultado
✅ Consulta pública agora usa a URL correta do ambiente de produção

---

## ✅ Issue #005 - Formato de Data Brasileiro

### Problema
Os campos de data usavam formato americano (MM/DD/YYYY) e não aceitavam entrada manual corretamente.

### Solução Aplicada
1. Criado componente `DateInput` com máscara brasileira
2. Implementada conversão automática DD/MM/AAAA → ISO (YYYY-MM-DD)
3. Validação de data ao digitar e ao perder foco
4. Substituídos todos os `input type="date"` por `DateInput`

**Arquivos Criados:**
- `frontend/src/components/DateInput.tsx` - Componente de input de data brasileiro

**Arquivos Modificados:**
- `frontend/src/pages/Solicitar.tsx` - Substituídos 3 campos de data

### Funcionalidades do DateInput
- ✅ Máscara automática DD/MM/AAAA
- ✅ Aceita apenas números
- ✅ Valida data ao digitar
- ✅ Converte para ISO no backend
- ✅ Placeholder "DD/MM/AAAA"
- ✅ Limite de 8 dígitos

### Resultado
✅ Usuários brasileiros podem digitar datas no formato familiar DD/MM/AAAA

---

## ✅ Issue #008 - Botão Voltar ao Dashboard

### Problema
Após criar uma solicitação, não havia botão para voltar ao dashboard, apenas "Consultar Agora" e "Voltar ao Início".

### Solução Aplicada
1. Adicionado botão "🏠 Voltar ao Dashboard"
2. Renomeado "Consultar Agora" para "🔍 Consultar Status"
3. Adicionada mensagem explicativa sobre próximos passos
4. Melhorado layout com flexbox responsivo

**Arquivo Modificado:**
- `frontend/src/pages/Solicitar.tsx` (linhas 87-103)

**Código Adicionado:**
```tsx
<p style={{ fontSize: '0.95rem', color: '#6c757d', marginBottom: '2rem' }}>
  Sua solicitação foi criada e está aguardando aprovação do supervisor.
</p>
<div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
  <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
    🏠 Voltar ao Dashboard
  </button>
  <button onClick={() => navigate(`/consultar?codigo=${codigo}`)} className="btn btn-secondary">
    🔍 Consultar Status
  </button>
</div>
```

### Resultado
✅ Navegação clara após criar solicitação
✅ Feedback sobre próximos passos
✅ Botões responsivos com flexbox

---

## ✅ Issue #009 - Layout do Dashboard

### Problema
Botões do dashboard ocupavam 100% da largura, deixando o layout desproporcional em telas grandes.

### Solução Aplicada
1. Limitada largura máxima dos botões para 500px
2. Centralizado container de botões
3. Melhorado espaçamento do header
4. Aumentada sombra do header para destaque

**Arquivo Modificado:**
- `frontend/src/styles/dashboard.css`

**Mudanças no CSS:**
```css
/* ANTES */
.dashboard-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

/* DEPOIS */
.dashboard-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* Header melhorado */
.dashboard-header {
  padding: 20px 20px; /* era 15px */
  box-shadow: 0 2px 8px rgba(0,0,0,0.15); /* era 0 2px 4px */
  margin-bottom: 10px; /* novo */
}
```

### Resultado
✅ Botões com largura proporcional
✅ Layout mais equilibrado
✅ Header com melhor destaque

---

## ✅ Issue #010 - Logo do Footer

### Problema
O footer do dashboard usava o logo do Inter ao invés do logo do Serviço Social.

### Solução Aplicada
Substituído logo no footer do DashboardAtleta:

**ANTES:**
```tsx
<img src="https://i.imgur.com/odzcc03.png" alt="Logo SC Internacional" />
<p>Sistema de Autorizações Digitais</p>
```

**DEPOIS:**
```tsx
<img src="https://imgur.com/HIsH9X5.png" alt="Logo Serviço Social" />
<p>Sistema de gerenciamento de autorizações</p>
```

**Arquivo Modificado:**
- `frontend/src/pages/DashboardAtleta.tsx` (linhas 76-85)

### Resultado
✅ Logo correto do Serviço Social no footer
✅ Texto atualizado para "Sistema de gerenciamento de autorizações"

---

## 📊 RESUMO EXECUTIVO

### Arquivos Criados
1. `frontend/src/components/DateInput.tsx` - Componente de data brasileiro

### Arquivos Modificados
1. `frontend/src/services/api.ts` - Função consultarPublico
2. `frontend/src/pages/Consultar.tsx` - Corrigido fetch hardcoded
3. `frontend/src/pages/Solicitar.tsx` - DateInput + botão dashboard
4. `frontend/src/pages/DashboardAtleta.tsx` - Logo do footer
5. `frontend/src/styles/dashboard.css` - Layout dos botões e header

### Problemas Resolvidos
- ✅ Issue #002 - API com URL hardcoded
- ✅ Issue #005 - Formato de data brasileiro
- ✅ Issue #008 - Botão voltar ao dashboard
- ✅ Issue #009 - Layout dos botões
- ✅ Issue #010 - Logo do footer

### Impacto
- 🎯 **UX melhorada** - Navegação mais clara
- 🇧🇷 **Localização** - Datas no formato brasileiro
- 🔧 **API funcional** - Consulta pública corrigida
- 🎨 **Visual aprimorado** - Layout mais equilibrado

---

## 🧪 TESTES NECESSÁRIOS

Após o deploy, testar:

1. ✅ Consulta pública funciona
2. ✅ Campos de data aceitam formato DD/MM/AAAA
3. ✅ Botão "Voltar ao Dashboard" funciona
4. ✅ Botões do dashboard têm largura adequada
5. ✅ Logo do Serviço Social aparece no footer
6. ✅ Layout responsivo em mobile (375px, 768px, 1024px)

---

**Próximas Ações:**
1. Fazer commit das correções
2. Aguardar deploy automático do Cloudflare Pages
3. Testar em produção
4. Verificar Issues #003 e #004 (problemas de backend)

---

**Relatório gerado por:** Manus AI - QA Engineer  
**Data:** 17/11/2025 19:15
