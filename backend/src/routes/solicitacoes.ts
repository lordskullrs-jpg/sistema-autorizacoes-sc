// Rotas de Solicitações (Staff apenas - atletas usam /publico)
import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware, requirePerfil } from '../middleware/auth';

const app = new Hono<{ Bindings: Env }>();

// Middleware de autenticação aplicado no index.ts

/**
 * GET /api/solicitacoes
 * Lista solicitações (filtrado por perfil e categoria)
 */
app.get('/', async (c) => {
  try {
    const user = c.get('user');
    let query = 'SELECT * FROM solicitacoes';
    let params: any[] = [];
    
    // Filtrar por perfil
    if (user.perfil === 'supervisor') {
      // Supervisor vê apenas sua categoria
      if (!user.categoria) {
        return c.json({ error: 'Supervisor sem categoria definida' }, 403);
      }
      query += ' WHERE categoria = ?';
      params.push(user.categoria);
    }
    // Serviço Social, Monitor e Admin veem tudo
    
    query += ' ORDER BY criado_em DESC';
    
    const stmt = c.env.DB.prepare(query);
    const result = await stmt.bind(...params).all();
    
    return c.json({
      success: true,
      solicitacoes: result.results || []
    });
    
  } catch (error: any) {
    console.error('Erro ao listar solicitações:', error);
    return c.json({ error: 'Erro ao listar solicitações', details: error.message }, 500);
  }
});

/**
 * GET /api/solicitacoes/relatorio-chamada
 * Relatório de chamada para monitores
 * Mostra quais atletas estão autorizados a estar fora em uma data/hora específica
 */
app.get('/relatorio-chamada', async (c) => {
  try {
    const user = c.get('user');
    
    // Apenas monitores e admins podem acessar
    if (user.perfil !== 'monitor' && user.perfil !== 'admin') {
      return c.json({ error: 'Acesso negado' }, 403);
    }
    
    // Parâmetros de consulta
    const dataConsulta = c.req.query('data') || new Date().toISOString().split('T')[0];
    const horaConsulta = c.req.query('hora') || new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    // Buscar todas as solicitações aprovadas pelo Serviço Social
    const query = `
      SELECT * FROM solicitacoes 
      WHERE status_servico_social = 'Aprovado'
      AND status_geral = 'Aprovado'
      ORDER BY data_saida, horario_saida
    `;
    
    const stmt = c.env.DB.prepare(query);
    const result = await stmt.all();
    const todasSolicitacoes = result.results || [];
    
    // Filtrar atletas que devem estar fora no momento da consulta
    const dataHoraConsulta = new Date(`${dataConsulta}T${horaConsulta}:00`);
    
    const atletasFora = todasSolicitacoes.filter((sol: any) => {
      const dataSaida = new Date(`${sol.data_saida}T${sol.horario_saida}:00`);
      const dataRetorno = new Date(`${sol.data_retorno}T${sol.horario_retorno}:00`);
      
      // Atleta deve estar fora se a data/hora de consulta está entre saída e retorno
      return dataHoraConsulta >= dataSaida && dataHoraConsulta <= dataRetorno;
    });
    
    // Adicionar informações de status
    const atletasComStatus = atletasFora.map((sol: any) => {
      const dataRetorno = new Date(`${sol.data_retorno}T${sol.horario_retorno}:00`);
      const agora = new Date();
      
      let statusAtual = 'FORA';
      let observacaoStatus = '';
      
      // Verificar se já retornou
      if (sol.retorno_confirmado_em) {
        statusAtual = 'RETORNOU';
        observacaoStatus = `Retornou em ${new Date(sol.retorno_confirmado_em).toLocaleString('pt-BR')}`;
      }
      // Verificar se está atrasado
      else if (agora > dataRetorno) {
        statusAtual = 'ATRASADO';
        const minutosAtraso = Math.floor((agora.getTime() - dataRetorno.getTime()) / 60000);
        if (minutosAtraso < 60) {
          observacaoStatus = `Atrasado ${minutosAtraso} minutos`;
        } else {
          const horasAtraso = Math.floor(minutosAtraso / 60);
          observacaoStatus = `Atrasado ${horasAtraso}h ${minutosAtraso % 60}min`;
        }
      }
      // Verificar se saiu
      else if (sol.saida_confirmada_em) {
        statusAtual = 'SAIU';
        observacaoStatus = `Saiu em ${new Date(sol.saida_confirmada_em).toLocaleString('pt-BR')}`;
      }
      // Aguardando saída
      else {
        statusAtual = 'AGUARDANDO_SAIDA';
        observacaoStatus = 'Aguardando confirmação de saída';
      }
      
      return {
        ...sol,
        statusAtual,
        observacaoStatus
      };
    });
    
    return c.json({
      success: true,
      dataConsulta,
      horaConsulta,
      totalAtletas: atletasComStatus.length,
      atletas: atletasComStatus
    });
    
  } catch (error: any) {
    console.error('Erro ao gerar relatório de chamada:', error);
    return c.json({ error: 'Erro ao gerar relatório', details: error.message }, 500);
  }
});

/**
 * GET /api/solicitacoes/:id
 * Busca solicitação por ID
 */
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    
    const stmt = c.env.DB.prepare('SELECT * FROM solicitacoes WHERE id = ?');
    const solicitacao = await stmt.bind(id).first();
    
    if (!solicitacao) {
      return c.json({ error: 'Solicitação não encontrada' }, 404);
    }
    
    // Verificar permissão (supervisor só vê sua categoria)
    if (user.perfil === 'supervisor' && solicitacao.categoria !== user.categoria) {
      return c.json({ error: 'Acesso negado' }, 403);
    }
    
    return c.json({
      success: true,
      solicitacao
    });
    
  } catch (error: any) {
    console.error('Erro ao buscar solicitação:', error);
    return c.json({ error: 'Erro ao buscar solicitação', details: error.message }, 500);
  }
});

/**
 * PUT /api/solicitacoes/:id/supervisor
 * Aprova/reprova solicitação (Supervisor)
 */
app.put('/:id/supervisor', requirePerfil('supervisor'), async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const dados = await c.req.json();
    
    if (typeof dados.aprovado !== 'boolean') {
      return c.json({ error: 'Campo "aprovado" é obrigatório' }, 400);
    }
    
    // Buscar solicitação
    const stmt = c.env.DB.prepare('SELECT * FROM solicitacoes WHERE id = ?');
    const solicitacao = await stmt.bind(id).first();
    
    if (!solicitacao) {
      return c.json({ error: 'Solicitação não encontrada' }, 404);
    }
    
    // Verificar categoria
    if (solicitacao.categoria !== user.categoria) {
      return c.json({ error: 'Você não pode aprovar solicitações desta categoria' }, 403);
    }
    
    // Verificar status
    if (solicitacao.status_supervisor !== 'Pendente') {
      return c.json({ error: 'Solicitação já foi analisada pelo supervisor' }, 400);
    }
    
    const agora = new Date().toISOString();
    
    // Capturar dados de auditoria LGPD
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'N/A';
    const userAgent = c.req.header('user-agent') || 'N/A';
    
    if (dados.aprovado) {
      // APROVAR - processo continua
      const updateStmt = c.env.DB.prepare(`
        UPDATE solicitacoes SET
          status_supervisor = 'Aprovado',
          observacao_supervisor = ?,
          aprovado_supervisor_em = ?,
          aprovado_supervisor_por = ?,
          aprovado_supervisor_ip = ?,
          aprovado_supervisor_dispositivo = ?,
          status_geral = 'Aprovado pelo Supervisor',
          atualizado_em = ?
        WHERE id = ?
      `);
      
      await updateStmt.bind(
        dados.observacao || null,
        agora,
        user.userId,
        ip,
        userAgent,
        agora,
        id
      ).run();
      
      return c.json({
        success: true,
        message: 'Solicitação aprovada! Enviada para Serviço Social.',
        status: 'Aprovado pelo Supervisor'
      });
      
    } else {
      // REPROVAR - processo encerra
      if (!dados.observacao) {
        return c.json({ error: 'Motivo da reprovação é obrigatório' }, 400);
      }
      
      const updateStmt = c.env.DB.prepare(`
        UPDATE solicitacoes SET
          status_supervisor = 'Reprovado',
          observacao_supervisor = ?,
          aprovado_supervisor_em = ?,
          aprovado_supervisor_por = ?,
          aprovado_supervisor_ip = ?,
          aprovado_supervisor_dispositivo = ?,
          status_geral = 'Reprovado pelo Supervisor',
          status_final = 'Reprovado',
          atualizado_em = ?
        WHERE id = ?
      `);
      
      await updateStmt.bind(
        dados.observacao,
        agora,
        user.userId,
        ip,
        userAgent,
        agora,
        id
      ).run();
      
      return c.json({
        success: true,
        message: 'Solicitação reprovada. Processo encerrado.',
        status: 'Reprovado pelo Supervisor'
      });
    }
    
  } catch (error: any) {
    console.error('Erro ao aprovar/reprovar:', error);
    return c.json({ error: 'Erro ao processar aprovação', details: error.message }, 500);
  }
});

/**
 * POST /api/solicitacoes/:id/enviar-link-pais
 * Gera link para enviar aos pais (Serviço Social)
 */
app.post('/:id/enviar-link-pais', requirePerfil('servicosocial'), async (c) => {
  try {
    const id = c.req.param('id');
    
    // Buscar solicitação
    const stmt = c.env.DB.prepare('SELECT * FROM solicitacoes WHERE id = ?');
    const solicitacao = await stmt.bind(id).first();
    
    if (!solicitacao) {
      return c.json({ error: 'Solicitação não encontrada' }, 404);
    }
    
    // Verificar se supervisor aprovou
    if (solicitacao.status_supervisor !== 'Aprovado') {
      return c.json({ error: 'Aguardando aprovação do supervisor' }, 400);
    }
    
    // Gerar token único para os pais
    const token = `TOKEN-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7); // Expira em 7 dias
    
    const agora = new Date().toISOString();
    const frontendUrl = 'https://sistema-autorizacoes-sc.pages.dev';
    const linkAprovacao = `${frontendUrl}/aprovacao-pais/${token}`;
    
    // Atualizar banco
    const updateStmt = c.env.DB.prepare(`
      UPDATE solicitacoes SET
        token_pais = ?,
        token_pais_expira_em = ?,
        link_aprovacao_pais = ?,
        status_geral = 'Aguardando Resposta dos Pais',
        atualizado_em = ?
      WHERE id = ?
    `);
    
    await updateStmt.bind(
      token,
      expiraEm.toISOString(),
      linkAprovacao,
      agora,
      id
    ).run();
    
    // Salvar token no KV Store para validação
    await c.env.SESSIONS.put(`aprovacao_pais:${token}`, id, {
      expirationTtl: 7 * 24 * 60 * 60 // 7 dias em segundos
    });
    
    // Gerar mensagem WhatsApp
    const telefone = solicitacao.telefone_responsavel.replace(/\D/g, '');
    
    // Adicionar código do país (+55) se não tiver
    const telefoneCompleto = telefone.startsWith('55') ? telefone : `55${telefone}`;
    
    const mensagem = encodeURIComponent(
      `🔴 SC Internacional - Autorização de Saída\n\n` +
      `Olá! Seu filho(a) ${solicitacao.nome} solicitou autorização de saída.\n\n` +
      `📅 Data: ${solicitacao.data_saida}\n` +
      `🕐 Horário: ${solicitacao.horario_saida}\n` +
      `📍 Motivo: ${solicitacao.motivo_destino}\n\n` +
      `Por favor, clique no link abaixo para aprovar ou reprovar:\n` +
      `${linkAprovacao}`
    );
    
    const whatsappLink = `https://wa.me/${telefoneCompleto}?text=${mensagem}`;
    
    return c.json({
      success: true,
      message: 'Link gerado com sucesso! Copie e envie via WhatsApp.',
      link_aprovacao: linkAprovacao,
      whatsapp_link: whatsappLink,
      token
    });
    
  } catch (error: any) {
    console.error('Erro ao gerar link:', error);
    return c.json({ error: 'Erro ao gerar link', details: error.message }, 500);
  }
});

/**
 * PUT /api/solicitacoes/:id/servico-social
 * Aprovação final do Serviço Social (após pais aprovarem)
 */
app.put('/:id/servico-social', requirePerfil('servicosocial'), async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const dados = await c.req.json();
    
    if (typeof dados.aprovado !== 'boolean') {
      return c.json({ error: 'Campo "aprovado" é obrigatório' }, 400);
    }
    
    // Buscar solicitação
    const stmt = c.env.DB.prepare('SELECT * FROM solicitacoes WHERE id = ?');
    const solicitacao = await stmt.bind(id).first();
    
    if (!solicitacao) {
      return c.json({ error: 'Solicitação não encontrada' }, 404);
    }
    
    const agora = new Date().toISOString();
    
    // Capturar dados de auditoria LGPD
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'N/A';
    const userAgent = c.req.header('user-agent') || 'N/A';
    
    if (dados.aprovado) {
      // APROVAR FINAL - vai para monitor
      const updateStmt = c.env.DB.prepare(`
        UPDATE solicitacoes SET
          status_servico_social = 'Aprovado',
          observacao_servico_social = ?,
          aprovado_servico_social_em = ?,
          aprovado_servico_social_por = ?,
          aprovado_servico_social_ip = ?,
          aprovado_servico_social_dispositivo = ?,
          status_geral = 'Aprovado - Aguardando Saída',
          status_final = 'Aprovado',
          atualizado_em = ?
        WHERE id = ?
      `);
      
      await updateStmt.bind(
        dados.observacao || null,
        agora,
        user.userId,
        ip,
        userAgent,
        agora,
        id
      ).run();
      
      return c.json({
        success: true,
        message: 'Solicitação aprovada! Enviada para Monitor.',
        status: 'Aprovado - Aguardando Saída'
      });
      
    } else {
      // REPROVAR - processo encerra
      if (!dados.observacao) {
        return c.json({ error: 'Motivo da reprovação é obrigatório' }, 400);
      }
      
      const updateStmt = c.env.DB.prepare(`
        UPDATE solicitacoes SET
          status_servico_social = 'Reprovado',
          observacao_servico_social = ?,
          aprovado_servico_social_em = ?,
          aprovado_servico_social_por = ?,
          aprovado_servico_social_ip = ?,
          aprovado_servico_social_dispositivo = ?,
          status_geral = 'Reprovado pelo Serviço Social',
          status_final = 'Reprovado',
          atualizado_em = ?
        WHERE id = ?
      `);
      
      await updateStmt.bind(
        dados.observacao,
        agora,
        user.userId,
        ip,
        userAgent,
        agora,
        id
      ).run();
      
      return c.json({
        success: true,
        message: 'Solicitação reprovada. Processo encerrado.',
        status: 'Reprovado pelo Serviço Social'
      });
    }
    
  } catch (error: any) {
    console.error('Erro ao aprovar/reprovar:', error);
    return c.json({ error: 'Erro ao processar aprovação', details: error.message }, 500);
  }
});

/**
 * PUT /api/solicitacoes/:id/monitor
 * Controlar saída/retorno/arquivar (Monitor)
 */
app.put('/:id/monitor', requirePerfil('monitor'), async (c) => {
  try {
    const id = c.req.param('id');
    const dados = await c.req.json();
    
    if (!dados.acao || !['confirmar_saida', 'confirmar_retorno', 'arquivar'].includes(dados.acao)) {
      return c.json({ error: 'Ação inválida. Use: confirmar_saida, confirmar_retorno ou arquivar' }, 400);
    }
    
    // Buscar solicitação
    const stmt = c.env.DB.prepare('SELECT * FROM solicitacoes WHERE id = ?');
    const solicitacao = await stmt.bind(id).first();
    
    if (!solicitacao) {
      return c.json({ error: 'Solicitação não encontrada' }, 404);
    }
    
    const agora = new Date().toISOString();
    let updateQuery = '';
    let params: any[] = [];
    let mensagem = '';
    
    if (dados.acao === 'confirmar_saida') {
      updateQuery = `
        UPDATE solicitacoes SET
          status_monitor = 'Saiu',
          saida_confirmada_em = ?,
          status_geral = 'Saiu',
          atualizado_em = ?
        WHERE id = ?
      `;
      params = [agora, agora, id];
      mensagem = 'Saída confirmada!';
      
    } else if (dados.acao === 'confirmar_retorno') {
      updateQuery = `
        UPDATE solicitacoes SET
          status_monitor = 'Retornou',
          retorno_confirmado_em = ?,
          status_geral = 'Retornou',
          atualizado_em = ?
        WHERE id = ?
      `;
      params = [agora, agora, id];
      mensagem = 'Retorno confirmado!';
      
    } else if (dados.acao === 'arquivar') {
      updateQuery = `
        UPDATE solicitacoes SET
          status_monitor = 'Arquivado',
          arquivado_em = ?,
          status_geral = 'Arquivado',
          status_final = 'Arquivado',
          observacao_monitor = ?,
          atualizado_em = ?
        WHERE id = ?
      `;
      params = [agora, dados.observacao || null, agora, id];
      mensagem = 'Solicitação arquivada!';
    }
    
    const updateStmt = c.env.DB.prepare(updateQuery);
    await updateStmt.bind(...params).run();
    
    return c.json({
      success: true,
      message: mensagem
    });
    
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    return c.json({ error: 'Erro ao atualizar status', details: error.message }, 500);
  }
});

export default app;
