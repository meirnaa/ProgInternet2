import { IJogadorRepository } from "../../domain/repositories_interfaces/jogador_repository_interface";
import { Jogador } from "../../domain/entities/jogador_entity";
const { pool } = require("./pool");

interface JogadorRow {
  id: number;
  nome: string;
  sexo: string;
  idade: number;
  categoria: string;
}

export class JogadorRepository implements IJogadorRepository {
  async criar(jogador: Jogador): Promise<Jogador> {
    const result = await pool.query(
      `INSERT INTO jogadores (nome, sexo, idade, categoria)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [jogador.nome, jogador.sexo, jogador.idade, jogador.categoria]
    );
    const row = result.rows[0];
    return new Jogador(row.id, row.nome, row.sexo, row.idade, row.categoria);
  }

    async listar(): Promise<Jogador[]> {
    const result = await pool.query("SELECT * FROM jogadores");
    return result.rows.map((row: JogadorRow) => 
        new Jogador(row.id, row.nome, row.sexo, row.idade, row.categoria)
    );
    }


  async buscarPorId(id: number): Promise<Jogador | null> {
    const result = await pool.query("SELECT * FROM jogadores WHERE id = $1", [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return new Jogador(row.id, row.nome, row.sexo, row.idade, row.categoria);
  }

  async atualizar(jogador: Jogador): Promise<Jogador> {
    await pool.query(
      `UPDATE jogadores
       SET nome = COALESCE($1, nome),
           sexo = COALESCE($2, sexo)
       WHERE id = $3`,
      [jogador.nome, jogador.sexo, jogador.id]
    );
    if (jogador.id === null) throw new Error("ID do jogador não pode ser nulo");

    return this.buscarPorId(jogador.id) as Promise<Jogador>;
  }

  async deletar(id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM jogadores WHERE id = $1", [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
