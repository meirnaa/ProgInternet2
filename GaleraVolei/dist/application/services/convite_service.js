"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConviteService = void 0;
class ConviteService {
    constructor(repo) {
        this.repo = repo;
    }
    async criar(convite) {
        return this.repo.criar(convite);
    }
    async listarPorJogador(jogadorId) {
        return this.repo.listarPorJogador(jogadorId);
    }
    async atualizarStatus(id, status) {
        const convite = await this.repo.buscarPorId(id);
        if (!convite)
            throw new Error("Convite não encontrado");
        convite.status = status;
        return this.repo.atualizar(convite);
    }
}
exports.ConviteService = ConviteService;
