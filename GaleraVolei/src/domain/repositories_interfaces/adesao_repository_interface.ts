import { Adesao } from "../entities/adesao_entity";

export interface IAdesaoRepository {
  solicitar(adesao: Adesao): Promise<Adesao>;
  buscar(partidaId: number, jogadorId: number): Promise<Adesao | null>;
  atualizar(adesao: Adesao): Promise<Adesao>;
  deletar(partidaId: number, jogadorId: number): Promise<boolean>;
  listarJogadores(partidaId: number): Promise<Adesao[]>;
}
