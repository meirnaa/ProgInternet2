import { Request, Response } from "express";
import { AdesaoService } from "../../application/services/adesao_service";

// Cria uma adesão
export const solicitarAdesaoController = (service: AdesaoService) => async (req: Request, res: Response) => {
  try {
    const partidaId = Number(req.params.id);
    const jogadorId = Number(req.body.jogadorId);

    if (isNaN(partidaId) || isNaN(jogadorId)) {
      return res.status(400).json({ message: "IDs inválidos" });
    }

    const adesao = await service.solicitarAdesao(partidaId, jogadorId);
    return res.status(201).json(adesao);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// Atualiza uma adesão
export const atualizarAdesaoController = (service: AdesaoService) => async (req: Request, res: Response) => {
  try {
    const partidaId = Number(req.params.id);
    const jogadorId = Number(req.params.jogadorId);
    const { status } = req.body;

    const adesao = await service.atualizarAdesao(partidaId, jogadorId, status);
    return res.status(200).json(adesao);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// Deleta uma adesão
export const deletarAdesaoController = (service: AdesaoService) => async (req: Request, res: Response) => {
  try {
    const partidaId = Number(req.params.id);
    const jogadorId = Number(req.params.jogadorId);

    const success = await service.deletarAdesao(partidaId, jogadorId);
    if (!success) return res.status(404).json({ message: "Adesão não encontrada" });

    return res.status(200).json({ message: "Adesão removida com sucesso" });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// Lista jogadores de uma partida
export const listarJogadoresController = (service: AdesaoService) => async (req: Request, res: Response) => {
  try {
    const partidaId = Number(req.params.id);

    const jogadores = await service.listarJogadores(partidaId);
    return res.status(200).json(jogadores);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
