"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adesaoRoutes = void 0;
const express_1 = require("express");
const adesao_repository_1 = require("../../infra/database/adesao_repository");
const adesao_service_1 = require("../../application/services/adesao_service");
const adesao_controller_1 = require("../controllers/adesao_controller");
const router = (0, express_1.Router)();
exports.adesaoRoutes = router;
// Instanciação
const repo = new adesao_repository_1.AdesaoRepository();
const service = new adesao_service_1.AdesaoService(repo);
// Rotas
router.post("/partidas/:id/adesao", (0, adesao_controller_1.solicitarAdesaoController)(service));
router.put("/partidas/:id/adesao/:jogadorId", (0, adesao_controller_1.atualizarAdesaoController)(service));
router.delete("/partidas/:id/adesao/:jogadorId", (0, adesao_controller_1.deletarAdesaoController)(service));
router.get("/partidas/:id/jogadores", (0, adesao_controller_1.listarJogadoresController)(service));
