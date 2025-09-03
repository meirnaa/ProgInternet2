-- Usuário (caso precise controlar quem criou cômodo/cena)
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Cômodo
CREATE TABLE comodo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    usuario_id INT REFERENCES usuario(id) ON DELETE CASCADE
);

-- Dispositivo
CREATE TABLE dispositivo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado BOOLEAN DEFAULT FALSE,
    comodo_id INT REFERENCES comodo(id) ON DELETE CASCADE
);

-- Cena
CREATE TABLE cena (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
	estado BOOLEAN NOT NULL,
    usuario_id INT REFERENCES usuario(id) ON DELETE CASCADE
);

-- Ação de Cena
CREATE TABLE cena_acao (
    id SERIAL PRIMARY KEY,
    intervalo INT NOT NULL,
    estadoDispositivo BOOLEAN NOT NULL,
	ordem_execucao INT NOT NULL,
    cena_id INT REFERENCES cena(id) ON DELETE CASCADE,
    dispositivo_id INT REFERENCES dispositivo(id) ON DELETE CASCADE
);

SELECT * FROM comodo;
SELECT * FROM cena;
SELECT * FROM cena_acao;
SELECT * FROM usuario;
SELECT * FROM dispositivo;
DROP TABLE cena_acao;
DROP TABLE cena;

INSERT INTO usuario (nome, email, senha) VALUES ('Teste', 'teste@email.com', '12345678');
TRUNCATE TABLE cena_acao RESTART IDENTITY;
