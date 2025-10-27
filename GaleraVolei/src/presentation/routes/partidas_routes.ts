import { Router } from "express";
import { PartidaRepository } from "../../infra/database/partida_repository";
import { PartidaService } from "../../application/services/partida_service";
import {
  criarPartidaController,
  listarPartidasController,
  buscarPartidaPorIdController,
  atualizarPartidaController,
  deletarPartidaController
} from "../controllers/partida_controller";

const router = Router();

const partidaRepo = new PartidaRepository();
const partidaService = new PartidaService(partidaRepo);

router.post("/partidas", criarPartidaController(partidaService));
router.get("/partidas", listarPartidasController(partidaService));
router.get("/partidas/:id", buscarPartidaPorIdController(partidaService));
router.put("/partidas/:id", atualizarPartidaController(partidaService));
router.delete("/partidas/:id", deletarPartidaController(partidaService));

export { router as partidasRoutes };
