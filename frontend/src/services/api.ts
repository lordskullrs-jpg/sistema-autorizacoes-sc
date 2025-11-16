// Configuração da API

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';


export class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token && !endpoint.includes('/aprovacao/')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new ApiError(response.status, error.error || 'Erro na requisição');
  }

  return response.json();
}

export const api = {
  // Autenticação
  login: (email: string, senha: string) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),

  logout: () =>
    request('/api/auth/logout', {
      method: 'POST',
    }),

  me: () => request('/api/auth/me'),

  changePassword: (senhaAtual: string, novaSenha: string) =>
    request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ senhaAtual, novaSenha }),
    }),

  // Solicitações
  criarSolicitacao: (dados: any) =>
    request('/api/solicitacoes', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  listarSolicitacoes: () => request('/api/solicitacoes'),

  buscarSolicitacao: (id: string) => request(`/api/solicitacoes/${id}`),

  aprovarSupervisor: (id: string, aprovado: boolean, observacao?: string) =>
    request(`/api/solicitacoes/${id}/supervisor`, {
      method: 'PUT',
      body: JSON.stringify({ aprovado, observacao }),
    }),

  enviarLinkPais: (id: string) =>
    request(`/api/solicitacoes/${id}/enviar-link-pais`, {
      method: 'POST',
    }),

  aprovarServicoSocial: (id: string, aprovado: boolean, observacao?: string) =>
    request(`/api/solicitacoes/${id}/servico-social`, {
      method: 'PUT',
      body: JSON.stringify({ aprovado, observacao }),
    }),

  atualizarMonitor: (id: string, acao: string, observacao?: string) =>
    request(`/api/solicitacoes/${id}/monitor`, {
      method: 'PUT',
      body: JSON.stringify({ acao, observacao }),
    }),

  // Aprovação dos pais
  validarTokenPais: (token: string) =>
    request(`/api/aprovacao/${token}`),

  aprovarPais: (token: string, aprovado: boolean, observacao?: string) =>
    request(`/api/aprovacao/${token}`, {
      method: 'POST',
      body: JSON.stringify({ aprovado, observacao }),
    }),
};
