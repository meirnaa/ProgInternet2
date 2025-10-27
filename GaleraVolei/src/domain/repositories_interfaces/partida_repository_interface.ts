import { Partida } from "../entities/partida_entity";

export interface IPartidaRepository {
    criar(partida: Partida): Promise<Partida>;
    listar(categoria?: string, situacao?: string): Promise<Partida[]>;
    buscarPorId(id: number): Promise<Partida | null>;
    atualizar(id: number, dados: Partial<Partida>): Promise<Partida>;
    deletar(id: number): Promise<boolean>;
}

