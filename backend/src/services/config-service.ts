import type { D1Database } from '@cloudflare/workers-types';

export class ConfigService {
  constructor(private db: D1Database) {}

  /**
   * Busca uma configuração por chave
   */
  async get(chave: string): Promise<string | null> {
    const result = await this.db
      .prepare('SELECT valor FROM configuracoes WHERE chave = ?')
      .bind(chave)
      .first<{ valor: string }>();
    
    return result?.valor || null;
  }

  /**
   * Busca uma configuração como número
   */
  async getNumber(chave: string, defaultValue: number = 0): Promise<number> {
    const valor = await this.get(chave);
    return valor ? parseInt(valor, 10) : defaultValue;
  }

  /**
   * Busca uma configuração como boolean
   */
  async getBoolean(chave: string, defaultValue: boolean = false): Promise<boolean> {
    const valor = await this.get(chave);
    return valor ? valor === 'true' : defaultValue;
  }

  /**
   * Atualiza uma configuração
   */
  async set(chave: string, valor: string, atualizadoPor: string): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO configuracoes (chave, valor, atualizado_por, atualizado_em)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(chave) DO UPDATE SET
          valor = excluded.valor,
          atualizado_por = excluded.atualizado_por,
          atualizado_em = CURRENT_TIMESTAMP
      `)
      .bind(chave, valor, atualizadoPor)
      .run();
  }

  /**
   * Lista todas as configurações
   */
  async getAll(): Promise<Array<{ chave: string; valor: string; descricao: string; tipo: string }>> {
    const result = await this.db
      .prepare('SELECT chave, valor, descricao, tipo FROM configuracoes ORDER BY chave')
      .all<{ chave: string; valor: string; descricao: string; tipo: string }>();
    
    return result.results || [];
  }

  /**
   * Atualiza múltiplas configurações de uma vez
   */
  async setMultiple(configs: Record<string, string>, atualizadoPor: string): Promise<void> {
    const promises = Object.entries(configs).map(([chave, valor]) =>
      this.set(chave, valor, atualizadoPor)
    );
    await Promise.all(promises);
  }
}
