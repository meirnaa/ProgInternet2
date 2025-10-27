"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atualizarConviteController = exports.listarConvitesPorJogadorController = exports.criarConviteController = void 0;
const criarConviteController = (service) => async (req, res) => {
    try {
        const convite = await service.criar(req.body);
        res.status(201).json(convite);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.criarConviteController = criarConviteController;
const listarConvitesPorJogadorController = (service) => async (req, res) => {
    try {
        const convites = await service.listarPorJogador(Number(req.params.id));
        res.json(convites);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
};
exports.listarConvitesPorJogadorController = listarConvitesPorJogadorController;
const atualizarConviteController = (service) => async (req, res) => {
    try {
        const convite = await service.atualizarStatus(Number(req.params.id), req.body.status);
        res.json(convite);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.atualizarConviteController = atualizarConviteController;
