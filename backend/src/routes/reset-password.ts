// Rotas de redefinição de senha (públicas)
import { Hono } from 'hono';
import type { Env } from '../types';
import { hashPassword } from '../utils/password';
import { LogService } from '../services/log-service';

const app = new Hono<{ Bindings: Env }>();

// Validar token de redefinição
app.get('/validar/:token', async (c) => {
  try {
    const token = c.req.param('token');
    
    // Buscar token no KV Store primeiro (mais rápido)
    const kvData = await c.env.SESSIONS.get(`reset:${token}`);
    
    if (!kvData) {
      // Buscar no banco como fallback
      const dbToken = await c.env.DB
        .prepare(`
          SELECT * FROM tokens_redefinicao
          WHERE token = ? AND usado = 0 AND expira_em > datetime('now')
        `)
        .bind(token)
        .first();
      
      if (!dbToken) {
        return c.json({
          valido: false,
          error: 'Token inválido ou expirado'
        }, 404);
      }
      
      return c.json({
        valido: true,
        usuario_email: dbToken.usuario_email,
        expira_em: dbToken.expira_em
      });
    }
    
    const data = JSON.parse(kvData);
    
    // Verificar se expirou
    if (new Date(data.expira_em) < new Date()) {
      return c.json({
        valido: false,
        error: 'Token expirado'
      }, 410);
    }
    
    return c.json({
      valido: true,
      usuario_email: data.usuario_email,
      expira_em: data.expira_em
    });
    
  } catch (error: any) {
    console.error('Erro ao validar token:', error);
    return c.json({ error: 'Erro ao validar token', details: error.message }, 500);
  }
});

// Redefinir senha
app.post('/redefinir', async (c) => {
  try {
    const dados = await c.req.json();
    const logService = new LogService(c.env.DB);
    
    // Validar campos
    if (!dados.token || !dados.nova_senha || !dados.confirmar_senha) {
      return c.json({ 
        error: 'Campos obrigatórios: token, nova_senha, confirmar_senha' 
      }, 400);
    }
    
    // Verificar se as senhas coincidem
    if (dados.nova_senha !== dados.confirmar_senha) {
      return c.json({ error: 'As senhas não coincidem' }, 400);
    }
    
    // Validar tamanho mínimo da senha
    if (dados.nova_senha.length < 6) {
      return c.json({ error: 'A senha deve ter no mínimo 6 caracteres' }, 400);
    }
    
    // Buscar token no banco
    const tokenData = await c.env.DB
      .prepare(`
        SELECT * FROM tokens_redefinicao
        WHERE token = ? AND usado = 0 AND expira_em > datetime('now')
      `)
      .bind(dados.token)
      .first<{ usuario_id: number; usuario_email: string }>();
    
    if (!tokenData) {
      return c.json({ error: 'Token inválido ou expirado' }, 404);
    }
    
    // Hash da nova senha
    const senhaHash = await hashPassword(dados.nova_senha);
    
    // Atualizar senha do usuário
    await c.env.DB
      .prepare('UPDATE usuarios SET senha = ? WHERE id = ?')
      .bind(senhaHash, tokenData.usuario_id)
      .run();
    
    // Marcar token como usado
    await c.env.DB
      .prepare('UPDATE tokens_redefinicao SET usado = 1, usado_em = datetime(\'now\') WHERE token = ?')
      .bind(dados.token)
      .run();
    
    // Remover token do KV Store
    await c.env.SESSIONS.delete(`reset:${dados.token}`);
    
    // Registrar no log
    await logService.log('senha_alterada', tokenData.usuario_email, tokenData.usuario_email, {
      via: 'link_redefinicao'
    });
    
    return c.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.'
    });
    
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return c.json({ error: 'Erro ao redefinir senha', details: error.message }, 500);
  }
});

export default app;
