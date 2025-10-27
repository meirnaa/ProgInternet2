const { pool } = require("./pool");
import { IAdesaoRepository } from "../../domain/repositories_interfaces/adesao_repository_interface";
import { Adesao } from "../../domain/entities/adesao_entity";

export class AdesaoRepository implements IAdesaoRepository {
  
  async solicitar(adesao: Adesao): Promise<Adesao> {
    const result = await pool.query(
      `INSERT INTO adesoes (partidaId, jogadorId, status)
       VALUES ($1, $2, $3)
       RETURNING id, partidaId, jogadorId, status`,
      [adesao.partidaId, adesao.jogadorId, adesao.status ?? "pendente"]
    );
    const row = result.rows[0];
    return new Adesao(row.id, row.partidaId, row.jogadorId, row.status);
  }

  async buscar(partidaId: number, jogadorId: number): Promise<Adesao | null> {
    const result = await pool.query(
      "SELECT id, partidaId, jogadorId, status FROM adesoes WHERE partidaId = $1 AND jogadorId = $2",
      [partidaId, jogadorId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return new Adesao(row.id, row.partidaId, row.jogadorId, row.status);
  }

  async atualizar(adesao: Adesao): Promise<Adesao> {
    const result = await pool.query(
      `UPDATE adesoes 
       SET status = $3
       WHERE partidaId = $1 AND jogadorId = $2
       RETURNING id, partidaId, jogadorId, status`,
      [adesao.partidaId, adesao.jogadorId, adesao.status]
    );
    const row = result.rows[0];
    return new Adesao(row.id, row.partidaId, row.jogadorId, row.status);
  }

  async deletar(partidaId: number, jogadorId: number): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM adesoes WHERE partidaId = $1 AND jogadorId = $2",
      [partidaId, jogadorId]
    );
    return result.rowCount > 0;
  }

  async listarJogadores(partidaId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT j.*, a.status
       FROM adesoes a
       JOIN jogadores j ON a.jogadorId = j.id
       WHERE a.partidaId = $1`,
      [partidaId]
    );
    return result.rows;
  }
}
