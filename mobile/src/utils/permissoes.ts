import type { IUsuarioLogado, Perfil } from '@/interfaces/IUsuarioLogado';

/** Professores e Administradores criam/editam posts; alunos só visualizam. */
export const podeGerenciarPosts = (perfil?: Perfil | null): boolean =>
  perfil === 'Administrador' || perfil === 'Professor';

/** Gestão de professores e alunos (a API impede que Professor mexa em Administradores). */
export const podeGerenciarUsuarios = (perfil?: Perfil | null): boolean =>
  perfil === 'Administrador' || perfil === 'Professor';

interface ItemComAutor {
  autor: { _id: string } | null;
}

/**
 * Autor do item ou Administrador (mesma regra da API para excluir comentários
 * e para editar/excluir posts).
 */
export const eAutorOuAdmin = (
  usuario: IUsuarioLogado | null | undefined,
  item: ItemComAutor
): boolean =>
  !!usuario &&
  (usuario.perfil === 'Administrador' || item.autor?._id === usuario.id);
