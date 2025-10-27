import { Convite } from "../../domain/entities/convite_entity";
import { IConviteRepository } from "../../domain/repositories_interfaces/convite_repository_interface";

export class ConviteService {
  constructor(private repo: IConviteRepository) {}

  async criar(convite: Convite): Promise<Convite> {
    return this.repo.criar(convite);
  }

  async listarPorJogador(jogadorId: number): Promise<Convite[]> {
    return this.repo.listarPorJogador(jogadorId);
  }

  async atualizarStatus(id: number, status: string): Promise<Convite> {
    const convite = await this.repo.buscarPorId(id);
    if (!convite) throw new Error("Convite não encontrado");
    convite.status = status;
    return this.repo.atualizar(convite);
  }
}
