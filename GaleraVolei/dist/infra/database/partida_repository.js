"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartidaRepository = void 0;
const { pool } = require("./pool");
class PartidaRepository {
    async criar(partida) {
        const result = await pool.query(`INSERT INTO partidas (local, data, categoria, tipo) 
       VALUES ($1, $2, $3, $4) RETURNING *`, [partida.local, partida.data, partida.categoria, partida.tipo]);
        return result.rows[0];
    }
    async listar(status, categoria) {
        let query = "SELECT * FROM partidas";
        const params = [];
        const conditions = [];
        if (status) {
            params.push(status);
            conditions.push(`situacao = $${params.length}`);
        }
        if (categoria) {
            params.push(categoria);
            conditions.push(`categoria = $${params.length}`);
        }
        if (conditions.length)
            query += " WHERE " + conditions.join(" AND ");
        const result = await pool.query(query, params);
        return result.rows;
    }
    async buscarPorId(id) {
        const result = await pool.query("SELECT * FROM partidas WHERE id = $1", [id]);
        return result.rows[0] || null;
    }
    async atualizar(id, dados) {
        const result = await pool.query("UPDATE partidas SET situacao = COALESCE($1, situacao) WHERE id = $2 RETURNING *", [dados.situacao, id]);
        return result.rows[0] || null;
    }
    async deletar(id) {
        const result = await pool.query("DELETE FROM partidas WHERE id = $1", [id]);
        return result.rowCount > 0;
    }
}
exports.PartidaRepository = PartidaRepository;
