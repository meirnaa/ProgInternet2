import { Router } from "express";
import { ConviteRepository } from "../../infra/database/convite_repository";
import { ConviteService } from "../../application/services/convite_service";
import {
  criarConviteController,
  listarConvitesPorJogadorController,
  atualizarConviteController
} from "../controllers/convite_controller";

const router = Router();

const conviteRepo = new ConviteRepository();
const conviteService = new ConviteService(conviteRepo);

router.post("/convites", criarConviteController(conviteService));
router.get("/jogadores/:id/convites", listarConvitesPorJogadorController(conviteService));
router.put("/convites/:id", atualizarConviteController(conviteService));

export { router as convitesRoutes };
