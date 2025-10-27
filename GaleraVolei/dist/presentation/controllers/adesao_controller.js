"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarJogadoresController = exports.deletarAdesaoController = exports.atualizarAdesaoController = exports.solicitarAdesaoController = void 0;
// Cria uma adesão
const solicitarAdesaoController = (service) => async (req, res) => {
    try {
        const partidaId = Number(req.params.id);
        const jogadorId = Number(req.body.jogadorId);
        if (isNaN(partidaId) || isNaN(jogadorId)) {
            return res.status(400).json({ message: "IDs inválidos" });
        }
        const adesao = await service.solicitarAdesao(partidaId, jogadorId);
        return res.status(201).json(adesao);
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.solicitarAdesaoController = solicitarAdesaoController;
// Atualiza uma adesão
const atualizarAdesaoController = (service) => async (req, res) => {
    try {
        const partidaId = Number(req.params.id);
        const jogadorId = Number(req.params.jogadorId);
        const { status } = req.body;
        const adesao = await service.atualizarAdesao(partidaId, jogadorId, status);
        return res.status(200).json(adesao);
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.atualizarAdesaoController = atualizarAdesaoController;
// Deleta uma adesão
const deletarAdesaoController = (service) => async (req, res) => {
    try {
        const partidaId = Number(req.params.id);
        const jogadorId = Number(req.params.jogadorId);
        const success = await service.deletarAdesao(partidaId, jogadorId);
        if (!success)
            return res.status(404).json({ message: "Adesão não encontrada" });
        return res.status(200).json({ message: "Adesão removida com sucesso" });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.deletarAdesaoController = deletarAdesaoController;
// Lista jogadores de uma partida
const listarJogadoresController = (service) => async (req, res) => {
    try {
        const partidaId = Number(req.params.id);
        const jogadores = await service.listarJogadores(partidaId);
        return res.status(200).json(jogadores);
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.listarJogadoresController = listarJogadoresController;
