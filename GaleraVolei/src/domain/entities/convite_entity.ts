export class Convite {
  constructor(
    public id: number | null,
    public remetenteId: number,
    public destinatarioId: number,
    public status: string = "pendente"
  ) {}
}
