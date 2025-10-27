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
  `);
    console.log("Tabela jogadores criada!");
}
