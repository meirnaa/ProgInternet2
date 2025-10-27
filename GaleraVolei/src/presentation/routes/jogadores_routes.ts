import { Router } from "express";
import { JogadorRepository } from "../../infra/database/jogador_repository";
import { JogadorService } from "../../application/services/jogador_service";
import {
  criarJogadorController,
  listarJogadoresController,
  buscarJogadorPorIdController,
  atualizarJogadorController,
  deletarJogadorController
} from "../controllers/jogador_controller";

const router = Router();

// Instanciando Service com o Repository concreto
const jogadorRepo = new JogadorRepository();
const jogadorService = new JogadorService(jogadorRepo);

// Rotas
router.post("/jogadores", criarJogadorController(jogadorService));
router.get("/jogadores", listarJogadoresController(jogadorService));
router.get("/jogadores/:id", buscarJogadorPorIdController(jogadorService));
router.put("/jogadores/:id", atualizarJogadorController(jogadorService));
router.delete("/jogadores/:id", deletarJogadorController(jogadorService));

export { router as jogadoresRoutes };
