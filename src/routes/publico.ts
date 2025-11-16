// Rotas públicas (sem autenticação) para atletas
import { Hono } from 'hono';
import type { Env } from '../types';
import { gerarCodigoUnico } from '../utils/codigo-unico';

const app = new Hono<{ Bindings: Env }>();

// Criar solicitação (público - sem auth)
app.post('/solicitar', async (c) => {
  try {
    const dados = await c.req.json();
    
    // Validar dados obrigatórios
    const camposObrigatorios = [
      'nome', 'email', 'data_nascimento', 'telefone', 'categoria',
      'data_saida', 'horario_saida', 'data_retorno', 'horario_retorno',
      'motivo_destino', 'nome_responsavel', 'telefone_responsavel'
    ];
    
    for (const campo of camposObrigatorios) {
      if (!dados[campo]) {
        return c.json({ error: `Campo obrigatório: ${campo}` }, 400);
      }
    }
    
    // Validar categoria
    const categoriasValidas = ['Sub14', 'Sub15', 'Sub16', 'Sub17', 'Sub20'];
    if (!categoriasValidas.includes(dados.categoria)) {
      return c.json({ error: 'Categoria inválida' }, 400);
    }
    
    // Gerar código único
    const codigoUnico = gerarCodigoUnico();
    const id = `sol-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Salvar no banco
    const stmt = c.env.DB.prepare(`
      INSERT INTO solicitacoes (
        id, codigo_unico, nome, email, data_nascimento, telefone, categoria,
        data_saida, horario_saida, data_retorno, horario_retorno,
        motivo_destino, nome_responsavel, telefone_responsavel,
        status_geral, dispositivo_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      id,
      codigoUnico,
      dados.nome,
      dados.email,
      dados.data_nascimento,
      dados.telefone,
      dados.categoria,
      dados.data_saida,
      dados.horario_saida,
      dados.data_retorno,
      dados.horario_retorno,
      dados.motivo_destino,
      dados.nome_responsavel,
      dados.telefone_responsavel,
      'Aguardando Supervisor',
      dados.dispositivo_info ? JSON.stringify(dados.dispositivo_info) : null
    ).run();
    
    return c.json({
      success: true,
      codigo: codigoUnico,
      message: 'Solicitação criada com sucesso! Guarde este código para consultar o status.',
      solicitacao: {
        codigo: codigoUnico,
        nome: dados.nome,
        categoria: dados.categoria,
        status: 'Aguardando Supervisor'
      }
    }, 201);
    
  } catch (error: any) {
    console.error('Erro ao criar solicitação:', error);
    return c.json({ error: 'Erro ao criar solicitação', details: error.message }, 500);
  }
});

// Consultar por código (público - sem auth)
app.get('/consultar/:codigo', async (c) => {
  try {
    const codigo = c.req.param('codigo');
    
    const stmt = c.env.DB.prepare(`
      SELECT * FROM solicitacoes WHERE codigo_unico = ?
    `);
    
    const result = await stmt.bind(codigo).first();
    
    if (!result) {
      return c.json({ error: 'Código não encontrado' }, 404);
    }
    
    // Retornar dados da solicitação
    return c.json({
      success: true,
      solicitacao: {
        codigo: result.codigo_unico,
        nome: result.nome,
        email: result.email,
        categoria: result.categoria,
        data_saida: result.data_saida,
        horario_saida: result.horario_saida,
        data_retorno: result.data_retorno,
        horario_retorno: result.horario_retorno,
        motivo_destino: result.motivo_destino,
        nome_responsavel: result.nome_responsavel,
        telefone_responsavel: result.telefone_responsavel,
        
        // Status
        status_geral: result.status_geral,
        status_final: result.status_final,
        
        // Aprovações
        status_supervisor: result.status_supervisor,
        observacao_supervisor: result.observacao_supervisor,
        aprovado_supervisor_em: result.aprovado_supervisor_em,
        
        status_pais: result.status_pais,
        observacao_pais: result.observacao_pais,
        aprovado_pais_em: result.aprovado_pais_em,
        
        status_servico_social: result.status_servico_social,
        observacao_servico_social: result.observacao_servico_social,
        aprovado_servico_social_em: result.aprovado_servico_social_em,
        
        status_monitor: result.status_monitor,
        saida_confirmada_em: result.saida_confirmada_em,
        retorno_confirmado_em: result.retorno_confirmado_em,
        arquivado_em: result.arquivado_em,
        
        criado_em: result.criado_em,
        atualizado_em: result.atualizado_em
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao consultar:', error);
    return c.json({ error: 'Erro ao consultar solicitação', details: error.message }, 500);
  }
});

export default app;
