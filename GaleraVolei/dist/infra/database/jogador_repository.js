"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JogadorRepository = void 0;
const jogador_entity_1 = require("../../domain/entities/jogador_entity");
const { pool } = require("./pool");
class JogadorRepository {
    async criar(jogador) {
        const result = await pool.query(`INSERT INTO jogadores (nome, sexo, idade, categoria)
       VALUES ($1, $2, $3, $4) RETURNING *`, [jogador.nome, jogador.sexo, jogador.idade, jogador.categoria]);
        const row = result.rows[0];
        return new jogador_entity_1.Jogador(row.id, row.nome, row.sexo, row.idade, row.categoria);
    }
    async listar() {
        const result = await pool.query("SELECT * FROM jogadores");
        return result.rows.map((row) => new jogador_entity_1.Jogador(row.id, row.nome, row.sexo, row.idade, row.categoria));
    }
    async buscarPorId(id) {
        const result = await pool.query("SELECT * FROM jogadores WHERE id = $1", [id]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return new jogador_entity_1.Jogador(row.id, row.nome, row.sexo, row.idade, row.categoria);
    }
    async atualizar(jogador) {
        await pool.query(`UPDATE jogadores
       SET nome = COALESCE($1, nome),
           sexo = COALESCE($2, sexo)
       WHERE id = $3`, [jogador.nome, jogador.sexo, jogador.id]);
        if (jogador.id === null)
            throw new Error("ID do jogador não pode ser nulo");
        return this.buscarPorId(jogador.id);
    }
    async deletar(id) {
        const result = await pool.query("DELETE FROM jogadores WHERE id = $1", [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
}
exports.JogadorRepository = JogadorRepository;
