const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "galeravolei",
  password: "12350Meirlind@",
  port: 5432,
});

module.exports = {pool};