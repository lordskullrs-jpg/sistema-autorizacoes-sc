import bcrypt from 'bcryptjs';

/**
 * Gera hash de senha usando bcrypt
 * @param senha Senha em texto plano
 * @returns Hash da senha
 */
export async function hashPassword(senha: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
}

/**
 * Verifica se a senha corresponde ao hash
 * @param senha Senha em texto plano
 * @param hash Hash armazenado
 * @returns true se a senha está correta
 */
export async function verifyPassword(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

/**
 * Gera token aleatório seguro
 * @param length Tamanho do token
 * @returns Token aleatório
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Gera token de redefinição de senha no formato TOKEN-timestamp-random
 * @returns Token único
 */
export function generateResetToken(): string {
  const timestamp = Date.now();
  const random = generateToken(8);
  return `TOKEN-${timestamp}-${random}`;
}
