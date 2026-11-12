export interface IPostAutor {
  _id: string;
  nome: string;
}

export interface IPost {
  _id: string;
  titulo: string;
  conteudo: string;
  /** null quando o autor foi excluído (o populate do Mongoose não acha o usuário). */
  autor: IPostAutor | null;
  createdAt: string;
  updatedAt: string;
}
