export interface IComentarioAutor {
  _id: string;
  nome: string;
}

export interface IComentario {
  _id: string;
  conteudo: string;
  /** null quando o autor foi excluído. */
  autor: IComentarioAutor | null;
  post: string;
  createdAt: string;
  updatedAt: string;
}
