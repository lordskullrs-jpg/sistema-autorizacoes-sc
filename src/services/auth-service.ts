// Serviço de Autenticação

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Env, Usuario, JWTPayload, AuthResponse } from '../types';

export class AuthService {
  constructor(private env: Env) {}

  /**
   * Autentica usuário e retorna token JWT
   */
  async login(email: string, senha: string): Promise<AuthResponse | null> {
    // Buscar usuário por email
    const usuario = await this.env.DB.prepare(
      'SELECT * FROM usuarios WHERE email = ? AND ativo = 1'
    )
      .bind(email)
      .first<Usuario>();

    if (!usuario) {
      return null;
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash!);
    if (!senhaValida) {
      return null;
    }

    // Gerar token JWT
    const payload: JWTPayload = {
      userId: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      categoria: usuario.categoria,
    };

    const token = jwt.sign(payload, this.env.JWT_SECRET, {
      expiresIn: '7d', // Token válido por 7 dias
    });

    // Armazenar token no KV
    await this.env.SESSIONS.put(`session:${usuario.id}`, token, {
      expirationTtl: 7 * 24 * 60 * 60, // 7 dias em segundos
    });

    // Remover senha_hash do retorno
    const { senha_hash, ...usuarioSemSenha } = usuario;

    return {
      token,
      usuario: usuarioSemSenha,
    };
  }

  /**
   * Verifica e decodifica token JWT
   */
  async verificarToken(token: string): Promise<JWTPayload | null> {
    try {
      const decoded = jwt.verify(token, this.env.JWT_SECRET) as JWTPayload;

      // Verificar se sessão existe no KV
      const sessionToken = await this.env.SESSIONS.get(`session:${decoded.userId}`);
      if (!sessionToken || sessionToken !== token) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Faz logout do usuário
   */
  async logout(userId: string): Promise<void> {
    await this.env.SESSIONS.delete(`session:${userId}`);
  }

  /**
   * Cria hash de senha
   */
  async hashSenha(senha: string): Promise<string> {
    return bcrypt.hash(senha, 10);
  }

  /**
   * Busca usuário por ID
   */
  async buscarUsuarioPorId(userId: string): Promise<Usuario | null> {
    const usuario = await this.env.DB.prepare(
      'SELECT * FROM usuarios WHERE id = ? AND ativo = 1'
    )
      .bind(userId)
      .first<Usuario>();

    return usuario || null;
  }

  /**
   * Atualiza senha do usuário
   */
  async atualizarSenha(userId: string, senhaAtual: string, novaSenha: string): Promise<boolean> {
    const usuario = await this.buscarUsuarioPorId(userId);
    if (!usuario) {
      return false;
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha_hash!);
    if (!senhaValida) {
      return false;
    }

    // Atualizar senha
    const novoHash = await this.hashSenha(novaSenha);
    await this.env.DB.prepare(
      'UPDATE usuarios SET senha_hash = ?, atualizado_em = datetime("now") WHERE id = ?'
    )
      .bind(novoHash, userId)
      .run();

    return true;
  }
}
