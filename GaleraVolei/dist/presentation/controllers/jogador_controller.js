"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarJogadorController = criarJogadorController;
exports.listarJogadoresController = listarJogadoresController;
exports.buscarJogadorPorIdController = buscarJogadorPorIdController;
exports.atualizarJogadorController = atualizarJogadorController;
exports.deletarJogadorController = deletarJogadorController;
function criarJogadorController(service) {
    return async (req, res) => {
        try {
            const { nome, sexo, idade, categoria } = req.body;
            const jogador = await service.criarJogador(nome, sexo, idade, categoria);
            res.status(201).json(jogador);
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    };
}
function listarJogadoresController(service) {
    return async (_req, res) => {
        const jogadores = await service.listarJogadores();
        res.json(jogadores);
    };
}
function buscarJogadorPorIdController(service) {
    return async (req, res) => {
        const jogador = await service.buscarJogadorPorId(Number(req.params.id));
        if (!jogador)
            return res.status(404).json({ message: "Jogador não encontrado" });
        res.json(jogador);
    };
}
function atualizarJogadorController(service) {
    return async (req, res) => {
        const jogador = await service.atualizarJogador(Number(req.params.id), req.body.nome, req.body.sexo);
        res.json(jogador);
    };
}
function deletarJogadorController(service) {
    return async (req, res) => {
        const ok = await service.deletarJogador(Number(req.params.id));
        if (!ok)
            return res.status(404).json({ message: "Jogador não encontrado" });
        res.json({ message: "Jogador removido com sucesso" });
    };
}
