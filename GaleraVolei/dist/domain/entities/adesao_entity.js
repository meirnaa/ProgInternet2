"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adesao = void 0;
class Adesao {
    constructor(id, partidaId, jogadorId, status = "pendente") {
        this.id = id;
        this.partidaId = partidaId;
        this.jogadorId = jogadorId;
        this.status = status;
    }
}
exports.Adesao = Adesao;
