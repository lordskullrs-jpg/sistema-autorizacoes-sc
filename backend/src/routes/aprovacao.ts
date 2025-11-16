// Rotas de Aprovação dos Pais (sem autenticação)

import { Hono } from 'hono';
import type { Env, AprovarPaisDTO } from '../types';
import { SolicitacaoService } from '../services/solicitacao-service';

const aprovacao = new Hono<{ Bindings: Env }>();

/**
 * GET /api/aprovacao/:token
 * Valida token e retorna dados da solicitação
 */
aprovacao.get('/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const solicitacaoService = new SolicitacaoService(c.env);

    const solicitacao = await solicitacaoService.validarTokenPais(token);

    if (!solicitacao) {
      return c.json({ error: 'Link inválido ou expirado' }, 404);
    }

    // Verificar se já foi aprovado/reprovado
    if (solicitacao.status_pais !== 'Pendente') {
      return c.json({
        error: 'Esta solicitação já foi processada',
        status: solicitacao.status_pais,
      }, 400);
    }

    // Retornar apenas dados necessários
    return c.json({
      id: solicitacao.id,
      nome: solicitacao.nome,
      categoria: solicitacao.categoria,
      data_saida: solicitacao.data_saida,
      horario_saida: solicitacao.horario_saida,
      data_retorno: solicitacao.data_retorno,
      horario_retorno: solicitacao.horario_retorno,
      motivo_destino: solicitacao.motivo_destino,
      nome_responsavel: solicitacao.nome_responsavel,
    });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return c.json({ error: 'Erro ao validar link' }, 500);
  }
});

/**
 * POST /api/aprovacao/:token
 * Aprova/reprova solicitação pelos pais
 */
aprovacao.post('/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const dados: AprovarPaisDTO = await c.req.json();

    if (typeof dados.aprovado !== 'boolean') {
      return c.json({ error: 'Campo "aprovado" é obrigatório' }, 400);
    }

    const solicitacaoService = new SolicitacaoService(c.env);
    const resultado = await solicitacaoService.aprovarPais(token, dados);

    if (!resultado) {
      return c.json({ error: 'Link inválido ou expirado' }, 404);
    }

    return c.json({
      message: dados.aprovado ? 'Autorização aprovada com sucesso!' : 'Autorização reprovada',
      solicitacao: resultado,
    });
  } catch (error) {
    console.error('Erro ao processar aprovação:', error);
    return c.json({ error: 'Erro ao processar aprovação' }, 500);
  }
});

export default aprovacao;
