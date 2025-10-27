"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdesaoService = void 0;
const adesao_entity_1 = require("../../domain/entities/adesao_entity");
class AdesaoService {
    constructor(repository) {
        this.repository = repository;
    }
    solicitarAdesao(partidaId, jogadorId, status = "pendente") {
        const adesao = new adesao_entity_1.Adesao(null, partidaId, jogadorId, status);
        return this.repository.solicitar(adesao);
    }
    atualizarAdesao(partidaId, jogadorId, status) {
        const adesao = new adesao_entity_1.Adesao(null, partidaId, jogadorId, status);
        return this.repository.atualizar(adesao);
    }
    deletarAdesao(partidaId, jogadorId) {
        return this.repository.deletar(partidaId, jogadorId);
    }
    listarJogadores(partidaId) {
        return this.repository.listarJogadores(partidaId);
    }
    buscarAdesao(partidaId, jogadorId) {
        return this.repository.buscar(partidaId, jogadorId);
    }
}
exports.AdesaoService = AdesaoService;
