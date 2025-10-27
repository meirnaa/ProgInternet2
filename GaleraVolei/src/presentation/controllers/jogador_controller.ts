import { Request, Response } from "express";
import { JogadorService } from "../../application/services/jogador_service";

export function criarJogadorController(service: JogadorService) {
  return async (req: Request, res: Response) => {
    try {
      const { nome, sexo, idade, categoria } = req.body;
      const jogador = await service.criarJogador(nome, sexo, idade, categoria);
      res.status(201).json(jogador);
    } catch (err: any

        
    ) {
      res.status(400).json({ message: err.message });
    }
  };
}

export function listarJogadoresController(service: JogadorService) {
  return async (_req: Request, res: Response) => {
    const jogadores = await service.listarJogadores();
    res.json(jogadores);
  };
}

export function buscarJogadorPorIdController(service: JogadorService) {
  return async (req: Request, res: Response) => {
    const jogador = await service.buscarJogadorPorId(Number(req.params.id));
    if (!jogador) return res.status(404).json({ message: "Jogador não encontrado" });
    res.json(jogador);
  };
}

export function atualizarJogadorController(service: JogadorService) {
  return async (req: Request, res: Response) => {
    const jogador = await service.atualizarJogador(Number(req.params.id), req.body.nome, req.body.sexo);
    res.json(jogador);
  };
}

export function deletarJogadorController(service: JogadorService) {
  return async (req: Request, res: Response) => {
    const ok = await service.deletarJogador(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: "Jogador não encontrado" });
    res.json({ message: "Jogador removido com sucesso" });
  };
}
