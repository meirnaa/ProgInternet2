import { Request, Response } from "express";
import { PartidaService } from "../../application/services/partida_service";

export const criarPartidaController = (service: PartidaService) => async (req: Request, res: Response) => {
  try {
    const partida = await service.criar(req.body);
    res.status(201).json(partida);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const listarPartidasController = (service: PartidaService) => async (req: Request, res: Response) => {
  try {
    const partidas = await service.listar(req.query.categoria as string, req.query.situacao as string);
    res.json(partidas);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const buscarPartidaPorIdController = (service: PartidaService) => async (req: Request, res: Response) => {
  try {
    const partida = await service.buscarPorId(Number(req.params.id));
    if (!partida) return res.status(404).json({ message: "Partida não encontrada" });
    res.json(partida);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const atualizarPartidaController = (service: PartidaService) => async (req: Request, res: Response) => {
  try {
    const partida = await service.atualizar(Number(req.params.id), req.body);
    res.json(partida);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deletarPartidaController = (service: PartidaService) => async (req: Request, res: Response) => {
  try {
    const deleted = await service.deletar(Number(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Partida não encontrada" });
    res.json({ message: "Partida removida com sucesso" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
