"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const jogador_repository_1 = require("../../infra/database/jogador_repository");
const jogador_service_1 = require("../../application/services/jogador_service");
const jogador_controller_1 = require("../controllers/jogador_controller");
const router = (0, express_1.Router)();
exports.routes = router;
// Instanciando Service com o Repository concreto
const jogadorRepo = new jogador_repository_1.JogadorRepository();
const jogadorService = new jogador_service_1.JogadorService(jogadorRepo);
// Rotas
router.post("/jogadores", (0, jogador_controller_1.criarJogadorController)(jogadorService));
router.get("/jogadores", (0, jogador_controller_1.listarJogadoresController)(jogadorService));
router.get("/jogadores/:id", (0, jogador_controller_1.buscarJogadorPorIdController)(jogadorService));
router.put("/jogadores/:id", (0, jogador_controller_1.atualizarJogadorController)(jogadorService));
router.delete("/jogadores/:id", (0, jogador_controller_1.deletarJogadorController)(jogadorService));
