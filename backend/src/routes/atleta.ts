// Rotas protegidas para atletas (requer autenticação)
import { Hono } from 'hono';
import type { Env } from '../types';
import { gerarCodigoUnico } from '../utils/codigo-unico';
import { ConfigService } from '../services/config-service';

const app = new Hono<{ Bindings: Env }>();

// Middleware: Verificar se é atleta autenticado
app.use('/*', async (c, next) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Não autenticado' }, 401);
  }
  
  if (user.perfil !== 'atleta') {
    return c.json({ error: 'Acesso negado. Apenas atletas podem acessar esta rota.' }, 403);
  }
  
  await next();
});

// Criar solicitação (protegida - requer auth de atleta)
app.post('/solicitar', async (c) => {
  try {
    const dados = await c.req.json();
    const configService = new ConfigService(c.env.DB);
    
    // Buscar limite de solicitações
    const limiteSemanal = await configService.getNumber('limite_solicitacoes_semanal', 5);
    
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
    
    // Verificar limite semanal por nome do atleta
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 7);
    const dataLimiteStr = dataLimite.toISOString();
    
    const countStmt = c.env.DB.prepare(`
      SELECT COUNT(*) as total
      FROM solicitacoes
      WHERE nome = ? AND criado_em >= ?
    `);
    
    const countResult = await countStmt.bind(dados.nome, dataLimiteStr).first<{ total: number }>();
    const totalSolicitacoes = countResult?.total || 0;
    
    if (totalSolicitacoes >= limiteSemanal) {
      const proximaData = new Date(dataLimite);
      proximaData.setDate(proximaData.getDate() + 7);
      
      return c.json({
        error: 'Limite de solicitações atingido',
        message: `Você já criou ${limiteSemanal} solicitações esta semana. Aguarde até ${proximaData.toLocaleDateString('pt-BR')} para criar novas solicitações.`,
        limite: limiteSemanal,
        usado: totalSolicitacoes,
        proxima_disponivel: proximaData.toISOString()
      }, 429);
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
      },
      limite_info: {
        usado: totalSolicitacoes + 1,
        total: limiteSemanal,
        restante: limiteSemanal - (totalSolicitacoes + 1)
      }
    }, 201);
    
  } catch (error: any) {
    console.error('Erro ao criar solicitação:', error);
    return c.json({ error: 'Erro ao criar solicitação', details: error.message }, 500);
  }
});

// Listar solicitações do atleta (por nome)
app.get('/minhas-solicitacoes', async (c) => {
  try {
    const nome = c.req.query('nome');
    
    if (!nome) {
      return c.json({ error: 'Nome é obrigatório' }, 400);
    }
    
    const stmt = c.env.DB.prepare(`
      SELECT 
        codigo_unico, nome, categoria, data_saida, horario_saida,
        data_retorno, horario_retorno, motivo_destino,
        status_geral, status_final, criado_em
      FROM solicitacoes
      WHERE nome = ?
      ORDER BY criado_em DESC
      LIMIT 50
    `);
    
    const result = await stmt.bind(nome).all();
    
    return c.json({
      success: true,
      solicitacoes: result.results || [],
      total: result.results?.length || 0
    });
    
  } catch (error: any) {
    console.error('Erro ao buscar solicitações:', error);
    return c.json({ error: 'Erro ao buscar solicitações', details: error.message }, 500);
  }
});

export default app;
