import { Request, Response } from "express";
import { ConviteService } from "../../application/services/convite_service";

export const criarConviteController = (service: ConviteService) => async (req: Request, res: Response) => {
  try {
    const convite = await service.criar(req.body);
    res.status(201).json(convite);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listarConvitesPorJogadorController = (service: ConviteService) => async (req: Request, res: Response) => {
  try {
    const convites = await service.listarPorJogador(Number(req.params.id));
    res.json(convites);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const atualizarConviteController = (service: ConviteService) => async (req: Request, res: Response) => {
  try {
    const convite = await service.atualizarStatus(Number(req.params.id), req.body.status);
    res.json(convite);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
