export type PerfilUsuario = 'Administrador' | 'Professor' | 'Aluno';

export interface IFiltroUsuarios {
  perfil?: PerfilUsuario;
  page: number;
  limit: number;
}

export interface IResultadoPaginado<T> {
  itens: T[];
  total: number;
  page: number;
  totalPages: number;
}
