import type { D1Database } from '@cloudflare/workers-types';

export type TipoLog =
  | 'usuario_criado'
  | 'usuario_editado'
  | 'usuario_excluido'
  | 'senha_alterada'
  | 'config_alterada'
  | 'token_gerado'
  | 'token_usado'
  | 'login_sucesso'
  | 'login_falha';

export class LogService {
  constructor(private db: D1Database) {}

  /**
   * Registra uma ação no log
   */
  async log(
    tipo: TipoLog,
    realizadoPor: string,
    usuarioAfetado?: string,
    detalhes?: Record<string, any>,
    ipOrigem?: string
  ): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO log_alteracoes (tipo, usuario_afetado, detalhes, realizado_por, ip_origem)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        tipo,
        usuarioAfetado || null,
        detalhes ? JSON.stringify(detalhes) : null,
        realizadoPor,
        ipOrigem || null
      )
      .run();
  }

  /**
   * Busca logs recentes
   */
  async getRecent(limit: number = 50): Promise<Array<any>> {
    const result = await this.db
      .prepare(`
        SELECT * FROM log_alteracoes
        ORDER BY realizado_em DESC
        LIMIT ?
      `)
      .bind(limit)
      .all();
    
    return result.results || [];
  }

  /**
   * Busca logs de um usuário específico
   */
  async getByUser(email: string, limit: number = 50): Promise<Array<any>> {
    const result = await this.db
      .prepare(`
        SELECT * FROM log_alteracoes
        WHERE usuario_afetado = ? OR realizado_por = ?
        ORDER BY realizado_em DESC
        LIMIT ?
      `)
      .bind(email, email, limit)
      .all();
    
    return result.results || [];
  }

  /**
   * Busca logs por tipo
   */
  async getByType(tipo: TipoLog, limit: number = 50): Promise<Array<any>> {
    const result = await this.db
      .prepare(`
        SELECT * FROM log_alteracoes
        WHERE tipo = ?
        ORDER BY realizado_em DESC
        LIMIT ?
      `)
      .bind(tipo, limit)
      .all();
    
    return result.results || [];
  }
}
