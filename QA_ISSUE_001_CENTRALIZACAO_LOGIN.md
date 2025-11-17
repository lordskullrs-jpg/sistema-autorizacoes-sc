# QA Issue #001 - Centralização da Tela de Login

**Data:** 17 de novembro de 2025  
**Tipo:** Bug de UI/UX  
**Prioridade:** Alta  
**Status:** Identificado  
**Responsável:** Manus AI - QA Engineer

---

## 1. IDENTIFICAÇÃO DO PROBLEMA

### Descrição
A tela de login e todos os painéis do sistema estão alinhados à esquerda ao invés de centralizados na tela.

### Evidência Visual
- URL: https://sistema-autorizacoes-sc.pages.dev/
- Screenshot: Painel de login aparece no canto esquerdo da tela
- Comportamento esperado: Painel centralizado horizontal e verticalmente

### Ambiente
- **Frontend:** React 19 + Vite 7.2.2
- **Deploy:** Cloudflare Pages
- **Navegador:** Chromium (testado)

---

## 2. ANÁLISE TÉCNICA (ROOT CAUSE ANALYSIS)

### Arquivos Envolvidos
1. `/frontend/src/styles/login.css` - CSS específico do login
2. `/frontend/src/styles/global.css` - CSS global da aplicação
3. `/frontend/src/index.css` - CSS base do Vite
4. `/frontend/src/App.css` - CSS do componente App
5. `/frontend/src/pages/Login.tsx` - Componente React

### Causa Raiz Identificada

**PROBLEMA PRINCIPAL:** Conflito de estilos CSS entre múltiplos arquivos

#### Conflito #1: `index.css` (linha 25-31)
```css
body {
  margin: 0;
  display: flex;           /* ← PROBLEMA */
  place-items: center;     /* ← PROBLEMA */
  min-width: 320px;
  min-height: 100vh;
}
```
**Impacto:** O `display: flex` no `body` está interferindo com o layout do `login-container`.

#### Conflito #2: `App.css` (linha 1-6)
```css
#root {
  max-width: 1280px;
  margin: 0 auto;          /* ← Centraliza mas limita largura */
  padding: 2rem;
  text-align: center;
}
```
**Impacto:** O `#root` tem `max-width` e `padding` que podem estar causando o desalinhamento.

#### Conflito #3: `global.css` (linha 45-50)
```css
body {
  font-family: var(--fonte-principal);
  background-color: var(--cor-cinza-claro);
  color: var(--cor-preto);
  line-height: 1.6;
}
```
**Impacto:** Sobrescreve o `body` do `index.css`, mas não resolve o problema de layout.

### Ordem de Carregamento dos CSS
1. `index.css` (importado no `main.tsx`)
2. `global.css` (importado no `App.tsx`)
3. `login.css` (importado no `Login.tsx`)
4. `App.css` (importado no `App.tsx`)

**Conclusão:** O `login.css` tem as configurações corretas de centralização:
```css
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;      /* ✓ Correto */
  justify-content: center;  /* ✓ Correto */
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
}
```

Mas está sendo sobrescrito ou interferido pelos estilos do `body` e `#root`.

---

## 3. SOLUÇÃO PROPOSTA

### Estratégia de Correção
Remover conflitos de CSS e garantir que o `.login-container` tenha controle total do layout.

### Mudanças Necessárias

#### Correção #1: `index.css`
```css
/* ANTES */
body {
  margin: 0;
  display: flex;           /* ← REMOVER */
  place-items: center;     /* ← REMOVER */
  min-width: 320px;
  min-height: 100vh;
}

/* DEPOIS */
body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}
```

#### Correção #2: `App.css`
```css
/* ANTES */
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;         /* ← REMOVER para páginas de login */
  text-align: center;
}

/* DEPOIS */
#root {
  width: 100%;           /* ← Largura total */
  min-height: 100vh;     /* ← Altura mínima */
}

/* Aplicar max-width apenas para páginas internas */
.dashboard-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}
```

#### Correção #3: `login.css` (garantir especificidade)
```css
/* Adicionar !important apenas se necessário após testes */
.login-container {
  min-height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
}
```

---

## 4. PLANO DE TESTE

### Testes Manuais
1. ✅ Verificar centralização em desktop (1920x1080)
2. ✅ Verificar centralização em tablet (768x1024)
3. ✅ Verificar centralização em mobile (375x667)
4. ✅ Verificar outras páginas não foram afetadas (Dashboard, etc)

### Testes de Regressão
- Verificar que o Dashboard continua com layout correto
- Verificar que outras páginas públicas (Consultar, Solicitar) não foram afetadas

---

## 5. IMPLEMENTAÇÃO

**Status:** Pronto para implementar  
**Próximo Passo:** Aplicar correções nos arquivos CSS

---

**Assinatura QA:** Manus AI  
**Data:** 17/11/2025
