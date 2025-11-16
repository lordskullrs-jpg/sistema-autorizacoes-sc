// Tipos TypeScript do Sistema de Autorizações

export type PerfilUsuario = 'atleta' | 'supervisor' | 'servicosocial' | 'monitor' | 'admin';

export type Categoria = 'Sub14' | 'Sub15' | 'Sub16' | 'Sub17' | 'Sub20';

export type StatusAprovacao = 'Pendente' | 'Aprovado' | 'Reprovado';

export type StatusMonitor = 'Pendente' | 'Saiu' | 'Retornou' | 'Arquivado';

export type StatusFinal = 'Em Análise' | 'Aprovado' | 'Reprovado' | 'Arquivado';

export interface Usuario {
  id: string;
  email: string;
  senha_hash?: string;
  nome: string;
  perfil: PerfilUsuario;
  categoria?: Categoria;
  ativo: number;
  criado_em: string;
  atualizado_em: string;
}

export interface Solicitacao {
  id: string;
  atleta_id: string;
  nome: string;
  email: string;
  data_nascimento: string;
  telefone: string;
  categoria: Categoria;
  data_saida: string;
  horario_saida: string;
  data_retorno: string;
  horario_retorno: string;
  motivo_destino: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  
  status_supervisor: StatusAprovacao;
  observacao_supervisor?: string;
  aprovado_supervisor_em?: string;
  aprovado_supervisor_por?: string;
  
  status_pais: StatusAprovacao;
  observacao_pais?: string;
  aprovado_pais_em?: string;
  link_aprovacao_pais?: string;
  
  status_servico_social: StatusAprovacao;
  observacao_servico_social?: string;
  aprovado_servico_social_em?: string;
  aprovado_servico_social_por?: string;
  
  status_monitor: StatusMonitor;
  observacao_monitor?: string;
  saida_confirmada_em?: string;
  retorno_confirmado_em?: string;
  arquivado_em?: string;
  
  status_geral: string;
  status_final: StatusFinal;
  
  dispositivo_info?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface DispositivoInfo {
  userAgent: string;
  platform: string;
  screenResolution?: string;
  language?: string;
  timestamp: string;
  referrer?: string;
  colorDepth?: number;
  pixelRatio?: number;
}

export interface CriarSolicitacaoDTO {
  nome: string;
  email: string;
  data_nascimento: string;
  telefone: string;
  categoria: Categoria;
  data_saida: string;
  horario_saida: string;
  data_retorno: string;
  horario_retorno: string;
  motivo_destino: string;
  nome_responsavel: string;
  telefone_responsavel: string;
  dispositivo_info?: DispositivoInfo;
}

export interface AprovarSupervisorDTO {
  aprovado: boolean;
  observacao?: string;
}

export interface AprovarPaisDTO {
  aprovado: boolean;
  observacao?: string;
}

export interface AprovarServicoSocialDTO {
  aprovado: boolean;
  observacao?: string;
}

export interface AtualizarMonitorDTO {
  acao: 'confirmar_saida' | 'confirmar_retorno' | 'arquivar';
  observacao?: string;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario: Omit<Usuario, 'senha_hash'>;
}

export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
  WHATSAPP_API_URL: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  perfil: PerfilUsuario;
  categoria?: Categoria;
  iat?: number;
  exp?: number;
}
