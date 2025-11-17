// Rotas de administração (apenas admin)
import { Hono } from 'hono';
import type { Env } from '../types';
import { hashPassword, generateResetToken } from '../utils/password';
import { ConfigService } from '../services/config-service';
import { LogService } from '../services/log-service';

const app = new Hono<{ Bindings: Env }>();

// Middleware: Verificar se é admin
app.use('/*', async (c, next) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Não autenticado' }, 401);
  }
  
  if (user.perfil !== 'admin') {
    return c.json({ error: 'Acesso negado. Apenas administradores.' }, 403);
  }
  
  await next();
});

// Listar todos os usuários
app.get('/usuarios', async (c) => {
  try {
    const result = await c.env.DB
      .prepare('SELECT id, email, nome, perfil, categoria, ativo, criado_em, ultimo_login FROM usuarios ORDER BY criado_em DESC')
      .all();
    
    return c.json({
      success: true,
      usuarios: result.results || []
    });
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    return c.json({ error: 'Erro ao listar usuários', details: error.message }, 500);
  }
});

// Criar novo usuário
app.post('/usuarios', async (c) => {
  try {
    const dados = await c.req.json();
    const user = c.get('user');
    const logService = new LogService(c.env.DB);
    
    // Validar campos obrigatórios
    if (!dados.email || !dados.senha || !dados.perfil || !dados.nome) {
      return c.json({ error: 'Campos obrigatórios: email, senha, perfil, nome' }, 400);
    }
    
    // Verificar se email já existe
    const existente = await c.env.DB
      .prepare('SELECT id FROM usuarios WHERE email = ?')
      .bind(dados.email)
      .first();
    
    if (existente) {
      return c.json({ error: 'Email já cadastrado' }, 400);
    }
    
    // Hash da senha
    const senhaHash = await hashPassword(dados.senha);
    
    // Inserir usuário
    await c.env.DB
      .prepare(`
        INSERT INTO usuarios (email, senha_hash, nome, perfil, categoria, ativo)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        dados.email,
        senhaHash,
        dados.nome,
        dados.perfil,
        dados.categoria || null,
        dados.ativo !== false ? 1 : 0
      )
      .run();
    
    // Registrar no log
    await logService.log('usuario_criado', user.email, dados.email, {
      perfil: dados.perfil,
      categoria: dados.categoria
    });
    
    return c.json({
      success: true,
      message: 'Usuário criado com sucesso'
    }, 201);
    
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return c.json({ error: 'Erro ao criar usuário', details: error.message }, 500);
  }
});

// Editar usuário
app.put('/usuarios/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const dados = await c.req.json();
    const user = c.get('user');
    const logService = new LogService(c.env.DB);
    
    // Buscar usuário atual
    const usuarioAtual = await c.env.DB
      .prepare('SELECT * FROM usuarios WHERE id = ?')
      .bind(id)
      .first();
    
    if (!usuarioAtual) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }
    
    // Preparar campos para atualização
    const updates: string[] = [];
    const values: any[] = [];
    
    if (dados.email) {
      updates.push('email = ?');
      values.push(dados.email);
    }
    
    if (dados.nome) {
      updates.push('nome = ?');
      values.push(dados.nome);
    }
    
    if (dados.perfil) {
      updates.push('perfil = ?');
      values.push(dados.perfil);
    }
    
    if (dados.categoria !== undefined) {
      updates.push('categoria = ?');
      values.push(dados.categoria);
    }
    
    if (dados.ativo !== undefined) {
      updates.push('ativo = ?');
      values.push(dados.ativo ? 1 : 0);
    }
    
    if (dados.senha) {
      const senhaHash = await hashPassword(dados.senha);
      updates.push('senha_hash = ?');
      values.push(senhaHash);
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'Nenhum campo para atualizar' }, 400);
    }
    
    values.push(id);
    
    // Atualizar usuário
    await c.env.DB
      .prepare(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
    
    // Registrar no log
    await logService.log('usuario_editado', user.email, dados.email || usuarioAtual.email, {
      campos_alterados: Object.keys(dados)
    });
    
    return c.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });
    
  } catch (error: any) {
    console.error('Erro ao editar usuário:', error);
    return c.json({ error: 'Erro ao editar usuário', details: error.message }, 500);
  }
});

// Excluir usuário
app.delete('/usuarios/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const logService = new LogService(c.env.DB);
    
    // Buscar usuário
    const usuario = await c.env.DB
      .prepare('SELECT * FROM usuarios WHERE id = ?')
      .bind(id)
      .first<{ email: string }>();
    
    if (!usuario) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }
    
    // Não permitir excluir a si mesmo
    if (usuario.email === user.email) {
      return c.json({ error: 'Você não pode excluir sua própria conta' }, 400);
    }
    
    // Excluir usuário
    await c.env.DB
      .prepare('DELETE FROM usuarios WHERE id = ?')
      .bind(id)
      .run();
    
    // Registrar no log
    await logService.log('usuario_excluido', user.email, usuario.email);
    
    return c.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
    
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error);
    return c.json({ error: 'Erro ao excluir usuário', details: error.message }, 500);
  }
});

// Gerar link de redefinição de senha
app.post('/usuarios/:id/gerar-link-redefinicao', async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const logService = new LogService(c.env.DB);
    const configService = new ConfigService(c.env.DB);
    
    // Buscar usuário
    const usuario = await c.env.DB
      .prepare('SELECT id, email, nome FROM usuarios WHERE id = ?')
      .bind(id)
      .first<{ id: number; email: string; nome: string }>();
    
    if (!usuario) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }
    
    // Gerar token único
    const token = generateResetToken();
    
    // Buscar tempo de expiração
    const horasExpiracao = await configService.getNumber('expiracao_token_redefinicao_horas', 1);
    
    // Calcular data de expiração
    const expiraEm = new Date();
    expiraEm.setHours(expiraEm.getHours() + horasExpiracao);
    
    // Salvar token no banco
    await c.env.DB
      .prepare(`
        INSERT INTO tokens_redefinicao (token, usuario_id, usuario_email, expira_em, criado_por)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(token, usuario.id, usuario.email, expiraEm.toISOString(), user.email)
      .run();
    
    // Salvar também no KV Store para validação rápida
    await c.env.SESSIONS.put(
      `reset:${token}`,
      JSON.stringify({
        usuario_id: usuario.id,
        usuario_email: usuario.email,
        criado_em: new Date().toISOString(),
        expira_em: expiraEm.toISOString()
      }),
      { expirationTtl: horasExpiracao * 3600 }
    );
    
    // Gerar link completo
    const frontendUrl = 'https://sistema-autorizacoes-sc.pages.dev';
    const link = `${frontendUrl}/redefinir-senha/${token}`;
    
    // Gerar link do WhatsApp (opcional - pode ser configurado depois)
    const mensagem = encodeURIComponent(
      `Olá ${usuario.nome}! Use este link para redefinir sua senha: ${link}\n\nO link expira em ${horasExpiracao} hora(s).`
    );
    const whatsappLink = `https://wa.me/?text=${mensagem}`;
    
    // Registrar no log
    await logService.log('token_gerado', user.email, usuario.email, {
      expira_em: expiraEm.toISOString()
    });
    
    return c.json({
      success: true,
      link,
      whatsapp_link: whatsappLink,
      token,
      expira_em: expiraEm.toISOString(),
      valido_por: `${horasExpiracao} hora(s)`,
      usuario: {
        email: usuario.email,
        nome: usuario.nome
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao gerar link:', error);
    return c.json({ error: 'Erro ao gerar link de redefinição', details: error.message }, 500);
  }
});

// Listar configurações
app.get('/configuracoes', async (c) => {
  try {
    const configService = new ConfigService(c.env.DB);
    const configs = await configService.getAll();
    
    return c.json({
      success: true,
      configuracoes: configs
    });
  } catch (error: any) {
    console.error('Erro ao listar configurações:', error);
    return c.json({ error: 'Erro ao listar configurações', details: error.message }, 500);
  }
});

// Atualizar configurações
app.put('/configuracoes', async (c) => {
  try {
    const dados = await c.req.json();
    const user = c.get('user');
    const configService = new ConfigService(c.env.DB);
    const logService = new LogService(c.env.DB);
    
    // Atualizar cada configuração
    await configService.setMultiple(dados, user.email);
    
    // Registrar no log
    await logService.log('config_alterada', user.email, undefined, {
      configuracoes: Object.keys(dados)
    });
    
    return c.json({
      success: true,
      message: 'Configurações atualizadas com sucesso'
    });
    
  } catch (error: any) {
    console.error('Erro ao atualizar configurações:', error);
    return c.json({ error: 'Erro ao atualizar configurações', details: error.message }, 500);
  }
});

// Listar logs recentes
app.get('/logs', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const logService = new LogService(c.env.DB);
    
    const logs = await logService.getRecent(limit);
    
    return c.json({
      success: true,
      logs
    });
  } catch (error: any) {
    console.error('Erro ao listar logs:', error);
    return c.json({ error: 'Erro ao listar logs', details: error.message }, 500);
  }
});

export default app;
