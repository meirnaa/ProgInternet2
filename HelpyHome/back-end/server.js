const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const allowedOrigins = ["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000"];

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

const JWT_SECRET = "super_segredo";

// Conexão com Postgres
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "helpyhome",
  password: "suasenhaaqui",
  port: 5432,
});

// ----------- ROTAS DE LOGIN ---------------
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query(
      "SELECT id, nome, email, senha FROM usuario WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const usuario = result.rows[0];

    if (usuario.senha !== senha) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    // cria token válido por 7 dias
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // envia cookie httpOnly
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    delete usuario.senha;
    res.json({
      message: "Login realizado com sucesso",
      usuario,
      token // 👈 devolve também o token
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// rota para logout
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout realizado" });
});

function autenticar(req, res, next) {
  // tenta pegar token do cookie
  let token = req.cookies.token;

  // se não tiver no cookie, tenta pegar do header Authorization
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7); // remove "Bearer "
    }
  }

  // se ainda não tiver token, retorna 401
  if (!token) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  // verifica token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // disponibiliza id do usuário nas rotas
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}



// ----------- ROTAS CADASTRO -------------

app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nome)) {
      return res.status(400).json({ message: "O nome só pode conter letras e espaços" });
    }
    if (senha.length < 8) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 8 caracteres" });
    }

    // 👉 verifica se e-mail já existe
    const existe = await pool.query("SELECT id FROM usuario WHERE email = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ message: "Esse e-mail já está cadastrado" });
    }

    // insere usuário
    const result = await pool.query(
      "INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email",
      [nome, email, senha]
    );

    const usuario = result.rows[0];

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "Usuário cadastrado com sucesso", usuario });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// ----------- ROTAS CÔMODO ---------------

// Listar todos os cômodos
app.get("/comodo", autenticar, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM comodo WHERE usuario_id = $1",
      [req.usuario.id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});


// Buscar cômodo pelo ID
app.get("/comodo/:id", autenticar, async (req, res) => { // <-- ADICIONADO
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM comodo WHERE id = $1 AND usuario_id = $2", [id, req.usuario.id]); // <-- ADICIONADO
    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Cômodo não encontrado ou não pertence a você" });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Criar novo cômodo
app.post("/comodo", autenticar, async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const result = await pool.query(
      "INSERT INTO comodo (nome, descricao, usuario_id) VALUES ($1, $2, $3) RETURNING *",
      [nome, descricao, req.usuario.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});


// Atualizar cômodo
app.put("/comodo/:id", autenticar, async (req, res) => { // <-- ADICIONADO
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const result = await pool.query(
        // Adicionada verificação de dono (usuario_id)
      "UPDATE comodo SET nome=$1, descricao=$2 WHERE id=$3 AND usuario_id = $4 RETURNING *", // <-- ADICIONADO
      [nome, descricao, id, req.usuario.id] // <-- ADICIONADO
    );
    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Cômodo não encontrado ou não pertence a você" });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Remover cômodo
app.delete("/comodo/:id", autenticar, async (req, res) => { // <-- ADICIONADO
  try {
    const { id } = req.params;
    const result = await pool.query(
        // Adicionada verificação de dono (usuario_id)
      "DELETE FROM comodo WHERE id=$1 AND usuario_id = $2 RETURNING *", // <-- ADICIONADO
      [id, req.usuario.id] // <-- ADICIONADO
    );
    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Cômodo não encontrado ou não pertence a você" });
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
app.get("/dispositivo", autenticar, async (req, res) => {
  try {
    // pega só dispositivos dos cômodos do usuário
    const result = await pool.query(
      `SELECT d.* 
       FROM dispositivo d
       JOIN comodo c ON d.comodo_id = c.id
       WHERE c.usuario_id = $1`,
      [req.usuario.id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Listar todos os dispositivos onde comodo = *
app.get("/dispositivo-comodo", autenticar, async (req, res) => {
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
app.post("/dispositivo", autenticar, async (req, res) => {
  try {
    // Adicionar verificação se o cômodo pertence ao usuário
    const { nome, tipo, estado, comodo_id } = req.body;
    const comodoCheck = await pool.query("SELECT id FROM comodo WHERE id = $1 AND usuario_id = $2", [comodo_id, req.usuario.id]);
    if (comodoCheck.rows.length === 0) {
        return res.status(403).json({erro: "Você não pode adicionar dispositivos a um cômodo que não é seu."});
    }
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
app.put("/dispositivo/:id", autenticar, async (req, res) => { // <-- ADICIONADO
  try {
    const { id } = req.params;
    const { nome, tipo, estado, comodo_id } = req.body;
    // Query complexa para garantir que o usuário é dono do cômodo para o qual está movendo o dispositivo
    const result = await pool.query(
      `UPDATE dispositivo d SET nome = $1, tipo = $2, estado = $3, comodo_id = $4 
       FROM comodo c 
       WHERE d.id = $5 AND d.comodo_id = c.id AND c.usuario_id = $6 RETURNING d.*`, // <-- LÓGICA DE SEGURANÇA
      [nome, tipo, estado, comodo_id, id, req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Dispositivo não encontrado ou não pertence a você" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Buscar dispositivo pelo ID
app.get("/dispositivo/:id", autenticar, async (req, res) => { // <-- ADICIONADO
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT d.* FROM dispositivo d JOIN comodo c ON d.comodo_id = c.id 
             WHERE d.id = $1 AND c.usuario_id = $2`, // <-- ADICIONADO
            [id, req.usuario.id]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ erro: "Dispositivo não encontrado ou não pertence a você" });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});


// Remover dispositivo
app.delete("/dispositivo/:id", autenticar, async (req, res) => { // <-- ADICIONADO
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM dispositivo d USING comodo c 
       WHERE d.id = $1 AND d.comodo_id = c.id AND c.usuario_id = $2 RETURNING d.*`, // <-- LÓGICA DE SEGURANÇA
      [id, req.usuario.id]
    );
    if (result.rows.length === 0) {
     return res.status(404).json({ erro: "Dispositivo não encontrado ou não pertence a você" });
    }
    res.status(200).json({ mensagem: "Dispositivo removido com sucesso" });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// ---------- ROTAS CENA ----------
// ---------- ROTAS CENA ----------

// Listar todas as cenas
// Em server.js

// Listar todas as cenas (VERSÃO ATUALIZADA)
app.get("/cena", autenticar, async (req, res) => {
  try {
    // ESTA NOVA QUERY FAZ A MÁGICA DE JUNTAR TUDO
    const result = await pool.query(
      `SELECT 
            c.*, 
            COALESCE(
                (SELECT json_agg(json_build_object(
                    'nome', d.nome, 
                    'estadoDispositivo', ca.estadoDispositivo
                ))
                FROM cena_acao ca
                JOIN dispositivo d ON ca.dispositivo_id = d.id
                WHERE ca.cena_id = c.id),
                '[]'::json
            ) AS acoes
        FROM 
            cena c
        WHERE 
            c.usuario_id = $1 
        ORDER BY 
            c.nome`,
      [req.usuario.id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar cenas com ações:", err); // Log mais detalhado
    res.status(400).json({ erro: err.message });
  }
});

// Buscar cena por ID
app.get("/cena/:id", autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
        "SELECT * FROM cena WHERE id = $1 AND usuario_id = $2", 
        [id, req.usuario.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Cena não encontrada" });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Criar nova cena
app.post("/cena", autenticar, async (req, res) => {
  try {
     const { nome, descricao, estado } = req.body; 
     const usuario_id = req.usuario.id;

    if (nome == null) {
     return res.status(400).json({ erro: "O campo 'nome' é obrigatório" });
    }

    const result = await pool.query(
      "INSERT INTO cena (nome, descricao, estado, usuario_id) VALUES ($1, $2, $3, $4) RETURNING *", 
      [nome, descricao || "", estado || false, usuario_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro em /cena:", err.message);
    res.status(400).json({ erro: err.message });
  }
});

// Atualizar cena 
app.put("/cena/:id", autenticar, async (req, res) => {
  try {
     const { id } = req.params;
    // Removido 'acoes' e 'intervalo' para corresponder à sua tabela
    const { nome, descricao, estado } = req.body;

    const cenaAtual = await pool.query(
      "SELECT * FROM cena WHERE id = $1 AND usuario_id = $2",
      [id, req.usuario.id]
    );

    if (cenaAtual.rows.length === 0) {
      return res.status(404).json({ erro: "Cena não encontrada ou não pertence a você" });
    }

    const updates = [];
    const values = [];
    let queryIndex = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${queryIndex++}`);
      values.push(nome);
    }
    if (descricao !== undefined) {
      updates.push(`descricao = $${queryIndex++}`);
      values.push(descricao);
    }
    if (estado !== undefined) {
      updates.push(`estado = $${queryIndex++}`);
      values.push(estado);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ erro: "Nenhum campo para atualizar foi fornecido" });
    }
    
    values.push(id); 

    const query = `UPDATE cena SET ${updates.join(", ")} WHERE id = $${queryIndex} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar cena:", err);
    res.status(400).json({ erro: err.message });
  }
});

// Remover cena
app.delete("/cena/:id", autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM cena WHERE id=$1 AND usuario_id = $2 RETURNING *",
      [id, req.usuario.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ erro: "Cena não encontrada ou não pertence a você" });
    res.status(200).json({ mensagem: "Cena removida com sucesso" });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Ativar/desativar cena (toggle)
app.put("/cena/:id/toggle", autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const cena = await pool.query(
        "SELECT estado FROM cena WHERE id=$1 AND usuario_id = $2", 
        [id, req.usuario.id]
    );
    if (cena.rows.length === 0)
      return res.status(404).json({ erro: "Cena não encontrada ou não pertence a você" });

      const novoEstado = !cena.rows[0].estado; // Inverte o estado atual
      const result = await pool.query(
"UPDATE cena SET estado=$1 WHERE id=$2 RETURNING *",[novoEstado, id]
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
