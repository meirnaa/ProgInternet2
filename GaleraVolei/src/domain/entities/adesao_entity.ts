export class Adesao {
  constructor(
    public id: number | null,
    public partidaId: number,
    public jogadorId: number,
    public status: string = "pendente"
  ) {}
}
