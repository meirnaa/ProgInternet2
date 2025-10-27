"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartidaService = void 0;
class PartidaService {
    constructor(repo) {
        this.repo = repo;
    }
    async criar(partida) {
        return this.repo.criar(partida);
    }
    async listar(categoria, situacao) {
        return this.repo.listar(categoria, situacao);
    }
    async buscarPorId(id) {
        return this.repo.buscarPorId(id);
    }
    async atualizar(id, dados) {
        const partidaExistente = await this.repo.buscarPorId(id);
        if (!partidaExistente)
            throw new Error("Partida não encontrada");
        return this.repo.atualizar(id, dados);
    }
    async deletar(id) {
        return this.repo.deletar(id);
    }
}
exports.PartidaService = PartidaService;
