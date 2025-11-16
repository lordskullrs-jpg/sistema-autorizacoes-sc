// Middleware de Autenticação

import { Context, Next } from 'hono';
import type { Env, JWTPayload } from '../types';
import { AuthService } from '../services/auth-service';

export interface AuthContext {
  user: JWTPayload;
}

/**
 * Middleware para verificar autenticação
 */
export async function authMiddleware(c: Context<{ Bindings: Env; Variables: AuthContext }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token não fornecido' }, 401);
  }

  const token = authHeader.substring(7);
  const authService = new AuthService(c.env);

  const user = await authService.verificarToken(token);

  if (!user) {
    return c.json({ error: 'Token inválido ou expirado' }, 401);
  }

  // Adicionar usuário ao contexto
  c.set('user', user);

  await next();
}

/**
 * Middleware para verificar perfil específico
 */
export function requirePerfil(...perfisPermitidos: string[]) {
  return async (c: Context<{ Bindings: Env; Variables: AuthContext }>, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Usuário não autenticado' }, 401);
    }

    // Admin tem acesso a tudo
    if (user.perfil === 'admin') {
      await next();
      return;
    }

    if (!perfisPermitidos.includes(user.perfil)) {
      return c.json({ error: 'Acesso negado' }, 403);
    }

    await next();
  };
}

/**
 * Middleware para verificar categoria (supervisores)
 */
export function requireCategoria(c: Context<{ Bindings: Env; Variables: AuthContext }>, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Usuário não autenticado' }, 401);
  }

  if (user.perfil === 'supervisor' && !user.categoria) {
    return c.json({ error: 'Supervisor sem categoria definida' }, 403);
  }

  return next();
}
