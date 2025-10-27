"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConviteRepository = void 0;
const { pool } = require("./pool");
const convite_entity_1 = require("../../domain/entities/convite_entity");
class ConviteRepository {
    async criar(convite) {
        const result = await pool.query(`INSERT INTO convites (remetenteId, destinatarioId, status)
       VALUES ($1, $2, $3) RETURNING *`, [convite.remetenteId, convite.destinatarioId, convite.status ?? "pendente"]);
        const row = result.rows[0];
        return new convite_entity_1.Convite(row.id, row.remetenteId, row.destinatarioId, row.status);
    }
    async buscarPorId(id) {
        const result = await pool.query("SELECT * FROM convites WHERE id = $1", [id]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return new convite_entity_1.Convite(row.id, row.remetenteId, row.destinatarioId, row.status);
    }
    async atualizar(convite) {
        await pool.query(`UPDATE convites
       SET status = COALESCE($1, status)
       WHERE id = $2`, [convite.status, convite.id]);
        if (convite.id === null)
            throw new Error("ID do convite não pode ser nulo");
        return this.buscarPorId(convite.id);
    }
    async deletar(id) {
        const result = await pool.query("DELETE FROM convites WHERE id = $1", [id]);
        return result.rowCount > 0;
    }
    async listarPorJogador(jogadorId) {
        const result = await pool.query("SELECT * FROM convites WHERE destinatarioId = $1", [jogadorId]);
        return result.rows.map((row) => new convite_entity_1.Convite(row.id, row.remetenteId, row.destinatarioId, row.status));
    }
}
exports.ConviteRepository = ConviteRepository;
