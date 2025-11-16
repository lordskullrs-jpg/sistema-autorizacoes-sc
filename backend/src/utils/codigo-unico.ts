// Utilitário para gerar código único de solicitação

export function gerarCodigoUnico(): string {
  const ano = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `AUTH-${ano}-${timestamp}-${random}`;
}

// Exemplo: AUTH-2024-123456-A7B3
