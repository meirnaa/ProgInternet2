"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Partida = void 0;
class Partida {
    constructor(id, local, data, categoria, tipo, situacao = "nova") {
        this.id = id;
        this.local = local;
        this.data = data;
        this.categoria = categoria;
        this.tipo = tipo;
        this.situacao = situacao;
    }
}
exports.Partida = Partida;
