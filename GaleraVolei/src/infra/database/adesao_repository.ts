const { pool } = require("./pool");
import { IAdesaoRepository } from "../../domain/repositories_interfaces/adesao_repository_interface";
import { Adesao } from "../../domain/entities/adesao_entity";

export class AdesaoRepository implements IAdesaoRepository {

  async solicitar(adesao: Adesao): Promise<Adesao> {
    const result = await pool.query(
      `INSERT INTO adesoes (partida_id, jogador_id, status)
       VALUES ($1, $2, $3) RETURNING *`,
      [adesao.partidaId, adesao.jogadorId, adesao.status]
    );
    const row = result.rows[0];
    return new Adesao(row.partida_id, row.jogador_id, row.status);
  }

  async buscar(partidaId: number, jogadorId: number): Promise<Adesao | null> {
    const result = await pool.query(
      "SELECT * FROM adesoes WHERE partida_id = $1 AND jogador_id = $2",
      [partidaId, jogadorId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return new Adesao(row.partida_id, row.jogador_id, row.status);
  }

  async atualizar(adesao: Adesao): Promise<Adesao> {
    await pool.query(
      `UPDATE adesoes
       SET status = $1
       WHERE partida_id = $2 AND jogador_id = $3`,
      [adesao.status, adesao.partidaId, adesao.jogadorId]
    );
    return this.buscar(adesao.partidaId, adesao.jogadorId) as Promise<Adesao>;
  }

  async deletar(partidaId: number, jogadorId: number): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM adesoes WHERE partida_id = $1 AND jogador_id = $2",
      [partidaId, jogadorId]
    );
    return result.rowCount > 0;
  }

  async listarJogadores(partidaId: number): Promise<any[]> {
    const result = await pool.query(
      "SELECT * FROM adesoes WHERE partida_id = $1",
      [partidaId]
    );
    return result.rows.map((row: { jogador_id: any; status: any; }) => ({
      jogadorId: row.jogador_id,
      status: row.status
    }));
  }
}
