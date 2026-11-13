import type { Perfil } from './IUsuarioLogado';

/** Usuário retornado por GET /usuarios (a API nunca devolve a senha). */
export interface IUsuario {
  _id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  createdAt: string;
  updatedAt: string;
}

/** Formato das listagens paginadas da API ({ itens, total, page, totalPages }). */
export interface IPaginado<T> {
  itens: T[];
  total: number;
  page: number;
  totalPages: number;
}
