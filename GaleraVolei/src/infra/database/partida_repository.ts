const { pool } = require("./pool");

interface PartidaRow {
  id: number;
  local: string;
  data: string;
  categoria: string;
  tipo: string;
  situacao: string;
}

export class PartidaRepository {
  async criar(partida: Omit<PartidaRow, "id" | "situacao">) {
    const result = await pool.query(
      `INSERT INTO partidas (local, data, categoria, tipo) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [partida.local, partida.data, partida.categoria, partida.tipo]
    );
    return result.rows[0];
  }

  async listar(status?: string, categoria?: string) {
    let query = "SELECT * FROM partidas";
    const params: any[] = [];
    const conditions: string[] = [];

    if (status) { params.push(status); conditions.push(`situacao = $${params.length}`); }
    if (categoria) { params.push(categoria); conditions.push(`categoria = $${params.length}`); }

    if (conditions.length) query += " WHERE " + conditions.join(" AND ");

    const result = await pool.query(query, params);
    return result.rows;
  }

  async buscarPorId(id: number) {
    const result = await pool.query("SELECT * FROM partidas WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async atualizar(id: number, dados: Partial<Pick<PartidaRow, "situacao">>) {
    const result = await pool.query(
      "UPDATE partidas SET situacao = COALESCE($1, situacao) WHERE id = $2 RETURNING *",
      [dados.situacao, id]
    );
    return result.rows[0] || null;
  }

  async deletar(id: number) {
    const result = await pool.query("DELETE FROM partidas WHERE id = $1", [id]);
    return result.rowCount > 0;
  }
}
