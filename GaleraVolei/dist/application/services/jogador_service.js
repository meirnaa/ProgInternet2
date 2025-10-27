"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JogadorService = void 0;
const jogador_entity_1 = require("../../domain/entities/jogador_entity");
class JogadorService {
    constructor(repository) {
        this.repository = repository;
    }
    async criarJogador(nome, sexo, idade, categoria) {
        if (!nome || !sexo || !idade || !categoria)
            throw new Error("Todos os campos são obrigatórios");
        const jogador = new jogador_entity_1.Jogador(null, nome, sexo, idade, categoria);
        return this.repository.criar(jogador);
    }
    listarJogadores() {
        return this.repository.listar();
    }
    buscarJogadorPorId(id) {
        return this.repository.buscarPorId(id);
    }
    atualizarJogador(id, nome, sexo) {
        const jogador = new jogador_entity_1.Jogador(id, nome ?? null, sexo ?? null, 0, "");
        return this.repository.atualizar(jogador);
    }
    deletarJogador(id) {
        return this.repository.deletar(id);
    }
}
exports.JogadorService = JogadorService;
