// Serviço de Solicitações de Autorização

import type {
  Env,
  Solicitacao,
  CriarSolicitacaoDTO,
  AprovarSupervisorDTO,
  AprovarPaisDTO,
  AprovarServicoSocialDTO,
  AtualizarMonitorDTO,
} from '../types';
import {
  gerarIdSolicitacao,
  gerarTokenAprovacaoPais,
  formatarDataISO,
  determinarStatusGeral,
  determinarStatusFinal,
} from '../utils';

export class SolicitacaoService {
  constructor(private env: Env) {}

  /**
   * Cria nova solicitação de autorização
   */
  async criar(atletaId: string, dados: CriarSolicitacaoDTO): Promise<Solicitacao> {
    const id = gerarIdSolicitacao();
    const agora = formatarDataISO();
    const dispositivoInfo = dados.dispositivo_info ? JSON.stringify(dados.dispositivo_info) : null;

    const statusGeral = 'pendente_supervisor';
    const statusFinal = 'Em Análise';

    await this.env.DB.prepare(`
      INSERT INTO solicitacoes (
        id, atleta_id, nome, email, data_nascimento, telefone, categoria,
        data_saida, horario_saida, data_retorno, horario_retorno,
        motivo_destino, nome_responsavel, telefone_responsavel,
        status_supervisor, status_pais, status_servico_social, status_monitor,
        status_geral, status_final, dispositivo_info, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        id, atletaId, dados.nome, dados.email, dados.data_nascimento, dados.telefone,
        dados.categoria, dados.data_saida, dados.horario_saida, dados.data_retorno,
        dados.horario_retorno, dados.motivo_destino, dados.nome_responsavel,
        dados.telefone_responsavel, 'Pendente', 'Pendente', 'Pendente', 'Pendente',
        statusGeral, statusFinal, dispositivoInfo, agora, agora
      )
      .run();

    return this.buscarPorId(id) as Promise<Solicitacao>;
  }

  /**
   * Busca solicitação por ID
   */
  async buscarPorId(id: string): Promise<Solicitacao | null> {
    const solicitacao = await this.env.DB.prepare(
      'SELECT * FROM solicitacoes WHERE id = ?'
    )
      .bind(id)
      .first<Solicitacao>();

    return solicitacao || null;
  }

  /**
   * Lista solicitações por atleta
   */
  async listarPorAtleta(atletaId: string): Promise<Solicitacao[]> {
    const { results } = await this.env.DB.prepare(
      'SELECT * FROM solicitacoes WHERE atleta_id = ? ORDER BY criado_em DESC'
    )
      .bind(atletaId)
      .all<Solicitacao>();

    return results || [];
  }

  /**
   * Lista solicitações por categoria (para supervisor)
   */
  async listarPorCategoria(categoria: string): Promise<Solicitacao[]> {
    const { results } = await this.env.DB.prepare(
      'SELECT * FROM solicitacoes WHERE categoria = ? ORDER BY criado_em DESC'
    )
      .bind(categoria)
      .all<Solicitacao>();

    return results || [];
  }

  /**
   * Lista solicitações pendentes para supervisor
   */
  async listarPendentesSupervisor(categoria: string): Promise<Solicitacao[]> {
    const { results } = await this.env.DB.prepare(
      'SELECT * FROM solicitacoes WHERE categoria = ? AND status_supervisor = ? ORDER BY criado_em DESC'
    )
      .bind(categoria, 'Pendente')
      .all<Solicitacao>();

    return results || [];
  }

  /**
   * Lista solicitações para serviço social
   */
  async listarParaServicoSocial(): Promise<Solicitacao[]> {
    const { results } = await this.env.DB.prepare(`
      SELECT * FROM solicitacoes 
      WHERE status_supervisor = 'Aprovado' 
      AND (status_servico_social = 'Pendente' OR status_pais = 'Pendente')
      ORDER BY criado_em DESC
    `)
      .all<Solicitacao>();

    return results || [];
  }

  /**
   * Lista solicitações para monitor
   */
  async listarParaMonitor(): Promise<Solicitacao[]> {
    const { results } = await this.env.DB.prepare(`
      SELECT * FROM solicitacoes 
      WHERE status_servico_social = 'Aprovado' 
      AND status_monitor IN ('Pendente', 'Saiu', 'Retornou')
      ORDER BY criado_em DESC
    `)
      .all<Solicitacao>();

    return results || [];
  }

  /**
   * Lista todas as solicitações (admin)
   */
  async listarTodas(): Promise<Solicitacao[]> {
    const { results } = await this.env.DB.prepare(
      'SELECT * FROM solicitacoes ORDER BY criado_em DESC'
    )
      .all<Solicitacao>();

    return results || [];
  }

  /**
   * Aprova/reprova solicitação pelo supervisor
   */
  async aprovarSupervisor(
    solicitacaoId: string,
    supervisorId: string,
    dados: AprovarSupervisorDTO,
    ip?: string,
    userAgent?: string
  ): Promise<Solicitacao | null> {
    const solicitacao = await this.buscarPorId(solicitacaoId);
    if (!solicitacao) return null;

    const agora = formatarDataISO();
    const statusSupervisor = dados.aprovado ? 'Aprovado' : 'Reprovado';
    const statusGeral = dados.aprovado ? 'pendente_pais' : 'reprovado_supervisor';
    const statusFinal = dados.aprovado ? 'Em Análise' : 'Reprovado';

    await this.env.DB.prepare(`
      UPDATE solicitacoes 
      SET status_supervisor = ?,
          observacao_supervisor = ?,
          aprovado_supervisor_em = ?,
          aprovado_supervisor_por = ?,
          aprovado_supervisor_ip = ?,
          aprovado_supervisor_dispositivo = ?,
          status_geral = ?,
          status_final = ?,
          atualizado_em = ?
      WHERE id = ?
    `)
      .bind(
        statusSupervisor,
        dados.observacao || null,
        agora,
        supervisorId,
        ip || 'N/A',
        userAgent || 'N/A',
        statusGeral,
        statusFinal,
        agora,
        solicitacaoId
      )
      .run();

    return this.buscarPorId(solicitacaoId);
  }

  /**
   * Gera link de aprovação para os pais
   */
  async gerarLinkAprovacaoPais(solicitacaoId: string): Promise<string | null> {
    const solicitacao = await this.buscarPorId(solicitacaoId);
    if (!solicitacao) return null;

    const token = gerarTokenAprovacaoPais(solicitacaoId);
    const agora = formatarDataISO();

    // Armazenar token no KV com expiração de 30 dias
    await this.env.SESSIONS.put(`aprovacao_pais:${token}`, solicitacaoId, {
      expirationTtl: 30 * 24 * 60 * 60,
    });

    // Atualizar solicitação com o link
    await this.env.DB.prepare(`
      UPDATE solicitacoes 
      SET link_aprovacao_pais = ?,
          atualizado_em = ?
      WHERE id = ?
    `)
      .bind(token, agora, solicitacaoId)
      .run();

    return token;
  }

  /**
   * Aprova/reprova solicitação pelos pais
   */
  async aprovarPais(token: string, dados: AprovarPaisDTO, ip?: string, userAgent?: string): Promise<Solicitacao | null> {
    // Buscar solicitação pelo token
    const solicitacaoId = await this.env.SESSIONS.get(`aprovacao_pais:${token}`);
    if (!solicitacaoId) return null;

    const solicitacao = await this.buscarPorId(solicitacaoId);
    if (!solicitacao) return null;

    const agora = formatarDataISO();
    const statusPais = dados.aprovado ? 'Aprovado' : 'Reprovado';
    
    let statusGeral = solicitacao.status_geral;
    let statusFinal = solicitacao.status_final;
    
    if (dados.aprovado) {
      statusGeral = 'pendente_servico_social';
      statusFinal = 'Em Análise';
    } else {
      statusGeral = 'reprovado_pais';
      statusFinal = 'Reprovado';
    }

    await this.env.DB.prepare(`
      UPDATE solicitacoes 
      SET status_pais = ?,
          observacao_pais = ?,
          aprovado_pais_em = ?,
          aprovado_pais_ip = ?,
          aprovado_pais_dispositivo = ?,
          status_geral = ?,
          status_final = ?,
          atualizado_em = ?
      WHERE id = ?
    `)
      .bind(
        statusPais,
        dados.observacao || null,
        agora,
        ip || 'N/A',
        userAgent || 'N/A',
        statusGeral,
        statusFinal,
        agora,
        solicitacaoId
      )
      .run();

    // Invalidar token após uso
    await this.env.SESSIONS.delete(`aprovacao_pais:${token}`);

    return this.buscarPorId(solicitacaoId);
  }

  /**
   * Aprova/reprova solicitação pelo serviço social
   */
  async aprovarServicoSocial(
    solicitacaoId: string,
    servicoSocialId: string,
    dados: AprovarServicoSocialDTO
  ): Promise<Solicitacao | null> {
    const solicitacao = await this.buscarPorId(solicitacaoId);
    if (!solicitacao) return null;

    const agora = formatarDataISO();
    const statusServicoSocial = dados.aprovado ? 'Aprovado' : 'Reprovado';
    const statusGeral = dados.aprovado ? 'pendente_monitor' : 'reprovado_servico_social';
    const statusFinal = dados.aprovado ? 'Aprovado' : 'Reprovado';

    await this.env.DB.prepare(`
      UPDATE solicitacoes 
      SET status_servico_social = ?,
          observacao_servico_social = ?,
          aprovado_servico_social_em = ?,
          aprovado_servico_social_por = ?,
          status_geral = ?,
          status_final = ?,
          atualizado_em = ?
      WHERE id = ?
    `)
      .bind(
        statusServicoSocial,
        dados.observacao || null,
        agora,
        servicoSocialId,
        statusGeral,
        statusFinal,
        agora,
        solicitacaoId
      )
      .run();

    return this.buscarPorId(solicitacaoId);
  }

  /**
   * Atualiza status pelo monitor
   */
  async atualizarMonitor(
    solicitacaoId: string,
    dados: AtualizarMonitorDTO
  ): Promise<Solicitacao | null> {
    const solicitacao = await this.buscarPorId(solicitacaoId);
    if (!solicitacao) return null;

    const agora = formatarDataISO();
    let statusMonitor = solicitacao.status_monitor;
    let statusGeral = solicitacao.status_geral;
    let statusFinal = solicitacao.status_final;
    let saidaConfirmadaEm = solicitacao.saida_confirmada_em;
    let retornoConfirmadoEm = solicitacao.retorno_confirmado_em;
    let arquivadoEm = solicitacao.arquivado_em;

    switch (dados.acao) {
      case 'confirmar_saida':
        statusMonitor = 'Saiu';
        statusGeral = 'saiu';
        saidaConfirmadaEm = agora;
        break;
      case 'confirmar_retorno':
        statusMonitor = 'Retornou';
        statusGeral = 'retornou';
        retornoConfirmadoEm = agora;
        break;
      case 'arquivar':
        statusMonitor = 'Arquivado';
        statusGeral = 'arquivado';
        statusFinal = 'Arquivado';
        arquivadoEm = agora;
        break;
    }

    await this.env.DB.prepare(`
      UPDATE solicitacoes 
      SET status_monitor = ?,
          observacao_monitor = ?,
          saida_confirmada_em = ?,
          retorno_confirmado_em = ?,
          arquivado_em = ?,
          status_geral = ?,
          status_final = ?,
          atualizado_em = ?
      WHERE id = ?
    `)
      .bind(
        statusMonitor,
        dados.observacao || solicitacao.observacao_monitor,
        saidaConfirmadaEm,
        retornoConfirmadoEm,
        arquivadoEm,
        statusGeral,
        statusFinal,
        agora,
        solicitacaoId
      )
      .run();

    return this.buscarPorId(solicitacaoId);
  }

  /**
   * Valida token de aprovação dos pais
   */
  async validarTokenPais(token: string): Promise<Solicitacao | null> {
    const solicitacaoId = await this.env.SESSIONS.get(`aprovacao_pais:${token}`);
    if (!solicitacaoId) return null;

    return this.buscarPorId(solicitacaoId);
  }
}
