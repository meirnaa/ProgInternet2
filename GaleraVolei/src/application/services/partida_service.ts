import { Partida } from "../../domain/entities/partida_entity";
import { IPartidaRepository } from "../../domain/repositories_interfaces/partida_repository_interface";

export class PartidaService {
    constructor(private repo: IPartidaRepository) {}

    async criar(partida: Partida): Promise<Partida> {
        return this.repo.criar(partida);
    }

    async listar(categoria?: string, situacao?: string): Promise<Partida[]> {
        return this.repo.listar(categoria, situacao);
    }

    async buscarPorId(id: number): Promise<Partida | null> {
        return this.repo.buscarPorId(id);
    }

    async atualizar(id: number, dados: Partial<Partida>): Promise<Partida> {
        const partidaExistente = await this.repo.buscarPorId(id);
        if (!partidaExistente) throw new Error("Partida não encontrada");

        return this.repo.atualizar(id, dados);
    }

    async deletar(id: number): Promise<boolean> {
        return this.repo.deletar(id);
    }
}
