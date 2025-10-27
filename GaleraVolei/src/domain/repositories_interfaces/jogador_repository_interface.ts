import { Jogador } from "../entities/jogador_entity";

export interface IJogadorRepository {
    criar(jogador: Jogador): Promise<Jogador>;
    listar(): Promise<Jogador[]>;
    buscarPorId(id: number): Promise<Jogador | null>;
    atualizar(jogador: Jogador): Promise<Jogador>;
    deletar(id: number): Promise<boolean>;
}