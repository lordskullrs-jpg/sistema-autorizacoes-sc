// Rotas de Autenticação

import { Hono } from 'hono';
import type { Env } from '../types';
import { AuthService } from '../services/auth-service';
import { authMiddleware } from '../middleware/auth';
import { validarEmail } from '../utils';

const auth = new Hono<{ Bindings: Env }>();

/**
 * POST /api/auth/login
 * Autentica usuário e retorna token JWT
 */
auth.post('/login', async (c) => {
  try {
    const { email, senha } = await c.req.json();

    // Validações
    if (!email || !senha) {
      return c.json({ error: 'Email e senha são obrigatórios' }, 400);
    }

    if (!validarEmail(email)) {
      return c.json({ error: 'Email inválido' }, 400);
    }

    const authService = new AuthService(c.env);
    const resultado = await authService.login(email, senha);

    if (!resultado) {
      return c.json({ error: 'Email ou senha inválidos' }, 401);
    }

    return c.json(resultado);
  } catch (error) {
    console.error('Erro no login:', error);
    return c.json({ error: 'Erro ao fazer login' }, 500);
  }
});

/**
 * POST /api/auth/logout
 * Faz logout do usuário
 */
auth.post('/logout', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const authService = new AuthService(c.env);
    
    await authService.logout(user.userId);

    return c.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    return c.json({ error: 'Erro ao fazer logout' }, 500);
  }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário logado
 */
auth.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const authService = new AuthService(c.env);
    
    const usuario = await authService.buscarUsuarioPorId(user.userId);

    if (!usuario) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    // Remover senha_hash
    const { senha_hash, ...usuarioSemSenha } = usuario;

    return c.json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return c.json({ error: 'Erro ao buscar dados do usuário' }, 500);
  }
});

/**
 * POST /api/auth/change-password
 * Altera senha do usuário
 */
auth.post('/change-password', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { senhaAtual, novaSenha } = await c.req.json();

    // Validações
    if (!senhaAtual || !novaSenha) {
      return c.json({ error: 'Senha atual e nova senha são obrigatórias' }, 400);
    }

    if (novaSenha.length < 6) {
      return c.json({ error: 'Nova senha deve ter no mínimo 6 caracteres' }, 400);
    }

    const authService = new AuthService(c.env);
    const sucesso = await authService.atualizarSenha(user.userId, senhaAtual, novaSenha);

    if (!sucesso) {
      return c.json({ error: 'Senha atual incorreta' }, 400);
    }

    return c.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return c.json({ error: 'Erro ao alterar senha' }, 500);
  }
});

export default auth;
