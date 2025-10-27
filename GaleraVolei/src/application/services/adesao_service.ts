import { IAdesaoRepository } from "../../domain/repositories_interfaces/adesao_repository_interface";
import { Adesao } from "../../domain/entities/adesao_entity";

export class AdesaoService {
    constructor(private repository: IAdesaoRepository) {}

    solicitarAdesao(partidaId: number, jogadorId: number, status: string = "pendente"): Promise<Adesao> {
        const adesao = new Adesao(null, partidaId, jogadorId, status);
        return this.repository.solicitar(adesao);
    }

    atualizarAdesao(partidaId: number, jogadorId: number, status: string): Promise<Adesao> {
        const adesao = new Adesao(null, partidaId, jogadorId, status);
        return this.repository.atualizar(adesao);
    }

    deletarAdesao(partidaId: number, jogadorId: number): Promise<boolean> {
        return this.repository.deletar(partidaId, jogadorId);
    }

    listarJogadores(partidaId: number): Promise<Adesao[]> {
        return this.repository.listarJogadores(partidaId);
    }

    buscarAdesao(partidaId: number, jogadorId: number): Promise<Adesao | null> {
        return this.repository.buscar(partidaId, jogadorId);
    }
}
