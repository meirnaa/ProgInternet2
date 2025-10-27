"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarTabelas = criarTabelas;
const { pool } = require("./pool");
async function criarTabelas() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS jogadores (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      sexo CHAR(1) NOT NULL,
      idade INT NOT NULL,
      categoria VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS partidas (
      id SERIAL PRIMARY KEY,
      local VARCHAR(100),
      data DATE,
      categoria VARCHAR(50),
      tipo VARCHAR(50),
      situacao VARCHAR(50) DEFAULT 'nova'
    );

    CREATE TABLE IF NOT EXISTS convites (
      id SERIAL PRIMARY KEY,
      remetenteId INT REFERENCES jogadores(id),
      destinatarioId INT REFERENCES jogadores(id),
      status VARCHAR(20) DEFAULT 'pendente'
    );

    CREATE TABLE IF NOT EXISTS adesoes (
      id SERIAL PRIMARY KEY,
      partidaId INT REFERENCES partidas(id),
      jogadorId INT REFERENCES jogadores(id),
      status VARCHAR(20) DEFAULT 'pendente'
    );
  `);
    console.log("Tabelas criadas!");
}
