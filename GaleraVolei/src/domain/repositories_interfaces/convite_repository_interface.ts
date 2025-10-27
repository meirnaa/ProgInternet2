import { Convite } from "../entities/convite_entity";

export interface IConviteRepository {
  criar(convite: Convite): Promise<Convite>;
  buscarPorId(id: number): Promise<Convite | null>;
  atualizar(convite: Convite): Promise<Convite>;
  deletar(id: number): Promise<boolean>;
  listarPorJogador(jogadorId: number): Promise<Convite[]>;
}

