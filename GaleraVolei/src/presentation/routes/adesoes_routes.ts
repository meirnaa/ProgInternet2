import { Router } from "express";
import { AdesaoRepository } from "../../infra/database/adesao_repository";
import { AdesaoService } from "../../application/services/adesao_service";
import {
  solicitarAdesaoController,
  atualizarAdesaoController,
  deletarAdesaoController,
  listarJogadoresController
} from "../controllers/adesao_controller";

const router = Router();

// Instanciação
const repo = new AdesaoRepository();
const service = new AdesaoService(repo);

// Rotas
router.post("/partidas/:id/adesao", solicitarAdesaoController(service));
router.put("/partidas/:id/adesao/:jogadorId", atualizarAdesaoController(service));
router.delete("/partidas/:id/adesao/:jogadorId", deletarAdesaoController(service));
router.get("/partidas/:id/jogadores", listarJogadoresController(service));

export { router as adesaoRoutes };