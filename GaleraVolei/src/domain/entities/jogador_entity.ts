export class Jogador {
    constructor(
        public id: number | null,
        public nome: string,
        public sexo: string,
        public idade: number,
        public categoria: string
    ){}

    // isAdulto(): boolean {
    //     return this.idade >= 18;
    // }
}