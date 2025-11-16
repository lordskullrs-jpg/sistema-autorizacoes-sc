// Utilitários gerais do backend

import type { Categoria } from '../types';

/**
 * Gera um ID único para solicitação no formato AUTH-{timestamp}-{random}
 */
export function gerarIdSolicitacao(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AUTH-${timestamp}-${random}`;
}

/**
 * Gera um token único para aprovação dos pais
 */
export function gerarTokenAprovacaoPais(solicitacaoId: string): string {
  const random = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${solicitacaoId}-${timestamp}-${random}`;
}

/**
 * Valida formato de email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida formato de telefone brasileiro
 */
export function validarTelefone(telefone: string): boolean {
  const regex = /^\d{10,11}$/;
  const cleaned = telefone.replace(/\D/g, '');
  return regex.test(cleaned);
}

/**
 * Valida formato de data (YYYY-MM-DD)
 */
export function validarData(data: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(data)) return false;
  
  const date = new Date(data);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Valida formato de horário (HH:MM)
 */
export function validarHorario(horario: string): boolean {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(horario);
}

/**
 * Valida se data de retorno é >= data de saída
 */
export function validarDatas(dataSaida: string, dataRetorno: string): boolean {
  const saida = new Date(dataSaida);
  const retorno = new Date(dataRetorno);
  return retorno >= saida;
}

/**
 * Valida categoria
 */
export function validarCategoria(categoria: string): categoria is Categoria {
  return ['Sub14', 'Sub15', 'Sub16', 'Sub17', 'Sub20'].includes(categoria);
}

/**
 * Formata data para ISO string
 */
export function formatarDataISO(): string {
  return new Date().toISOString();
}

/**
 * Gera URL do WhatsApp com mensagem
 */
export function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const cleaned = telefone.replace(/\D/g, '');
  const encoded = encodeURIComponent(mensagem);
  return `https://wa.me/55${cleaned}?text=${encoded}`;
}

/**
 * Determina status geral baseado nos status individuais
 */
export function determinarStatusGeral(
  statusSupervisor: string,
  statusPais: string,
  statusServicoSocial: string,
  statusMonitor: string
): string {
  if (statusSupervisor === 'Reprovado') return 'reprovado_supervisor';
  if (statusSupervisor === 'Pendente') return 'pendente_supervisor';
  
  if (statusPais === 'Reprovado') return 'reprovado_pais';
  if (statusPais === 'Pendente') return 'pendente_pais';
  
  if (statusServicoSocial === 'Reprovado') return 'reprovado_servico_social';
  if (statusServicoSocial === 'Pendente') return 'pendente_servico_social';
  
  if (statusMonitor === 'Arquivado') return 'arquivado';
  if (statusMonitor === 'Retornou') return 'retornou';
  if (statusMonitor === 'Saiu') return 'saiu';
  if (statusMonitor === 'Pendente') return 'pendente_monitor';
  
  return 'aprovado';
}

/**
 * Determina status final baseado nos status individuais
 */
export function determinarStatusFinal(
  statusSupervisor: string,
  statusPais: string,
  statusServicoSocial: string,
  statusMonitor: string
): string {
  if (statusSupervisor === 'Reprovado' || statusPais === 'Reprovado' || statusServicoSocial === 'Reprovado') {
    return 'Reprovado';
  }
  
  if (statusMonitor === 'Arquivado') {
    return 'Arquivado';
  }
  
  if (statusSupervisor === 'Aprovado' && statusPais === 'Aprovado' && statusServicoSocial === 'Aprovado') {
    return 'Aprovado';
  }
  
  return 'Em Análise';
}

/**
 * Sanitiza string para SQL
 */
export function sanitizarString(str: string): string {
  return str.trim().replace(/'/g, "''");
}

/**
 * Valida perfil de usuário
 */
export function validarPerfil(perfil: string): boolean {
  return ['atleta', 'supervisor', 'servicosocial', 'monitor', 'admin'].includes(perfil);
}

/**
 * Verifica se usuário tem permissão para acessar recurso
 */
export function verificarPermissao(
  perfilUsuario: string,
  perfilRequerido: string[]
): boolean {
  if (perfilUsuario === 'admin') return true;
  return perfilRequerido.includes(perfilUsuario);
}
