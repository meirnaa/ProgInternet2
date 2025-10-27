import { Jogador } from "../../domain/entities/jogador_entity";
import { IJogadorRepository } from "../../domain/repositories_interfaces/jogador_repository_interface";

export class JogadorService {
  constructor(private repository: IJogadorRepository) {}

  async criarJogador(nome: string, sexo: string, idade: number, categoria: string): Promise<Jogador> {
    if (!nome || !sexo || !idade || !categoria) throw new Error("Todos os campos são obrigatórios");
    const jogador = new Jogador(null, nome, sexo, idade, categoria);
    return this.repository.criar(jogador);
  }

  listarJogadores(): Promise<Jogador[]> {
    return this.repository.listar();
  }

  buscarJogadorPorId(id: number): Promise<Jogador | null> {
    return this.repository.buscarPorId(id);
  }

  atualizarJogador(id: number, nome?: string, sexo?: string): Promise<Jogador> {
    const jogador = new Jogador(id, nome ?? null!, sexo ?? null!, 0, ""); 
    return this.repository.atualizar(jogador);
  }

  deletarJogador(id: number): Promise<boolean> {
    return this.repository.deletar(id);
  }
}
