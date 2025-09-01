const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com Postgres
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "helpyhome",
  password: "12350Meirlind@",
  port: 5432,
});

// ----------- ROTAS CÔMODO ---------------

// Listar todos os cômodos
app.get("/comodo", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM comodo");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Buscar cômodo pelo ID
app.get("/comodo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM comodo WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Cômodo não encontrado" });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Criar novo cômodo
app.post("/comodo", async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const result = await pool.query(
      "INSERT INTO comodo (nome, descricao) VALUES ($1, $2) RETURNING *",
      [nome, descricao]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Atualizar cômodo
app.put("/comodo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const result = await pool.query(
      "UPDATE comodo SET nome=$1, descricao=$2 WHERE id=$3 RETURNING *",
      [nome, descricao, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Cômodo não encontrado" });

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Remover cômodo
app.delete("/comodo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM comodo WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Cômodo não encontrado" });

    res.status(200).json({ mensagem: "Cômodo removido com sucesso" });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

app.get("/nome-do-comodo", async (req, res) => {
  try {
    const { comodo_id } = req.query;

    const result = await pool.query(
      `SELECT nome FROM comodo WHERE id = $1`,
      [comodo_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Cômodo não encontrado" });
    }

    res.status(200).json(result.rows); // vai retornar [{ nome: "Sala" }]
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// ----------- ROTAS DISPOSITIVO ---------------

// Listar todos os dispositivos
app.get("/dispositivo", async (req, res) => {
  try {
    const { comodo_id } = req.query;

    if (comodo_id) {
      // Filtra pelo comodo_id
      const result = await pool.query(
        "SELECT * FROM dispositivo WHERE comodo_id = $1",
        [comodo_id]
      );
      return res.status(200).json(result.rows);
    }

    // Se não tiver comodo_id, retorna todos
    const result = await pool.query("SELECT * FROM dispositivo");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Adicionar dispositivo
app.post("/dispositivo", async (req, res) => {
  try {
    const { nome, tipo, estado, comodo_id } = req.body;
    const result = await pool.query(
      "INSERT INTO dispositivo (nome, tipo, estado, comodo_id) VALUES ($1,$2,$3,$4) RETURNING *",
      [nome, tipo, estado, comodo_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Editar dispositivo
app.put("/dispositivo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tipo, estado, comodo_id } = req.body;

    const result = await pool.query(
      "UPDATE dispositivo SET nome = $1, tipo = $2, estado = $3, comodo_id = $4 WHERE id = $5 RETURNING *",
      [nome, tipo, estado, comodo_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Dispositivo não encontrado" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Buscar dispositivo pelo ID
app.get("/dispositivo/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM dispositivo WHERE id = $1", [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ erro: "Dispositivo não encontrado" });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// Remover dispositivo
app.delete("/dispositivo/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM dispositivo WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Dispositivo não encontrado" });
    }

    res.status(200).json({ mensagem: "Dispositivo removido com sucesso" });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// ---------- ROTAS CENA ----------

// Listar todas as cenas
app.get("/cena", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM cena ORDER BY nome");
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// Buscar cena por ID
app.get("/cena/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM cena WHERE id = $1", [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ erro: "Cena não encontrada" });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// Criar nova cena
app.post("/cena", async (req, res) => {
    try {
        console.log("POST /cena body:", req.body); // 👈 debug
        const { nome, descricao, estado, usuario_id } = req.body;

        // Verifica se campos obrigatórios estão presentes (não apenas falsy)
        if (nome == null || usuario_id == null) {
            return res.status(400).json({ erro: "Campos obrigatórios ausentes" });
        }

        const result = await pool.query(
            "INSERT INTO cena (nome, descricao, estado, usuario_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [nome, descricao || "", estado || false, usuario_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Erro em /cena:", err.message);
        res.status(400).json({ erro: err.message });
    }
});



// Atualizar cena
app.put("/cena/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, acoes, intervalo, ativa } = req.body;
        const result = await pool.query(
            "UPDATE cena SET nome=$1, acoes=$2, intervalo=$3, ativa=$4 WHERE id=$5 RETURNING *",
            [nome, acoes, intervalo, ativa, id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ erro: "Cena não encontrada" });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// Remover cena
app.delete("/cena/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM cena WHERE id=$1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ erro: "Cena não encontrada" });
        res.status(200).json({ mensagem: "Cena removida com sucesso" });
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// Ativar/desativar cena
app.put("/cena/:id/toggle", async (req, res) => {
    try {
        const { id } = req.params;
        const cena = await pool.query("SELECT ativa FROM cena WHERE id=$1", [id]);
        if (cena.rows.length === 0)
            return res.status(404).json({ erro: "Cena não encontrada" });

        const novaAtiva = !cena.rows[0].ativa;
        const result = await pool.query(
            "UPDATE cena SET ativa=$1 WHERE id=$2 RETURNING *",
            [novaAtiva, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// ---------- ROTAS CENA_ACAO ----------
app.post("/cena_acao", async (req, res) => {
    try {
        console.log("POST /cena_acao body:", req.body);
        const { cena_id, dispositivo_id, intervalo, estadoDispositivo, ordem_execucao } = req.body;
        const result = await pool.query(
            `INSERT INTO cena_acao (cena_id, dispositivo_id, intervalo, estadoDispositivo, ordem_execucao)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [cena_id, dispositivo_id, intervalo, estadoDispositivo, ordem_execucao]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000 🚀");
});
