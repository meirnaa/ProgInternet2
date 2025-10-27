"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletarPartidaController = exports.atualizarPartidaController = exports.buscarPartidaPorIdController = exports.listarPartidasController = exports.criarPartidaController = void 0;
const criarPartidaController = (service) => async (req, res) => {
    try {
        const partida = await service.criar(req.body);
        res.status(201).json(partida);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.criarPartidaController = criarPartidaController;
const listarPartidasController = (service) => async (req, res) => {
    try {
        const partidas = await service.listar(req.query.categoria, req.query.situacao);
        res.json(partidas);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.listarPartidasController = listarPartidasController;
const buscarPartidaPorIdController = (service) => async (req, res) => {
    try {
        const partida = await service.buscarPorId(Number(req.params.id));
        if (!partida)
            return res.status(404).json({ message: "Partida não encontrada" });
        res.json(partida);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.buscarPartidaPorIdController = buscarPartidaPorIdController;
const atualizarPartidaController = (service) => async (req, res) => {
    try {
        const partida = await service.atualizar(Number(req.params.id), req.body);
        res.json(partida);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.atualizarPartidaController = atualizarPartidaController;
const deletarPartidaController = (service) => async (req, res) => {
    try {
        const deleted = await service.deletar(Number(req.params.id));
        if (!deleted)
            return res.status(404).json({ message: "Partida não encontrada" });
        res.json({ message: "Partida removida com sucesso" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deletarPartidaController = deletarPartidaController;
