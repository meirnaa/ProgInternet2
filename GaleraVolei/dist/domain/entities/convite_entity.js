"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Convite = void 0;
class Convite {
    constructor(id, remetenteId, destinatarioId, status = "pendente") {
        this.id = id;
        this.remetenteId = remetenteId;
        this.destinatarioId = destinatarioId;
        this.status = status;
    }
}
exports.Convite = Convite;
