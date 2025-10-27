const { pool } = require("./pool");
import { IConviteRepository } from "../../domain/repositories_interfaces/convite_repository_interface";
import { Convite } from "../../domain/entities/convite_entity";

interface ConviteRow {
  id: number;
  remetente_id: number;
  destinatario_id: number;
  status: string;
}

export class ConviteRepository implements IConviteRepository {
  async criar(convite: Convite): Promise<Convite> {
    const result = await pool.query(
      `INSERT INTO convites (remetente_id, destinatario_id, status)
       VALUES ($1, $2, $3) RETURNING *`,
      [convite.remetenteId, convite.destinatarioId, convite.status ?? "pendente"]
    );
    const row = result.rows[0];
    return new Convite(row.id, row.remetente_id, row.destinatario_id, row.status);
  }

  async buscarPorId(id: number): Promise<Convite | null> {
    const result = await pool.query("SELECT * FROM convites WHERE id = $1", [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return new Convite(row.id, row.remetente_id, row.destinatario_id, row.status);
  }

  async atualizar(convite: Convite): Promise<Convite> {
    await pool.query(
      `UPDATE convites
       SET status = COALESCE($1, status)
       WHERE id = $2`,
      [convite.status, convite.id]
    );
    if (convite.id === null) throw new Error("ID do convite não pode ser nulo");
    return this.buscarPorId(convite.id) as Promise<Convite>;
  }

  async deletar(id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM convites WHERE id = $1", [id]);
    return result.rowCount > 0;
  }

  async listarPorJogador(jogadorId: number): Promise<Convite[]> {
    const result = await pool.query(
      "SELECT * FROM convites WHERE destinatario_id = $1",
      [jogadorId]
    );
    return result.rows.map(
    (row: ConviteRow) => new Convite(row.id, row.remetente_id, row.destinatario_id, row.status)
    );
  }
}
