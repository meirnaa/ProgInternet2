export class Partida {
  constructor(
    public id: number | null,
    public local: string,
    public data: string,
    public categoria: string,
    public tipo: string,
    public situacao: string = "nova"
  ) {}
}
