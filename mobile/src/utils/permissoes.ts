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

/**
 * Editar/excluir um post: precisa gerenciar posts (Professor ou Administrador)
 * e ser o autor, a não ser que seja Administrador.
 */
export const podeAlterarPost = (
  usuario: IUsuarioLogado | null | undefined,
  post: ItemComAutor
): boolean =>
  podeGerenciarPosts(usuario?.perfil) && eAutorOuAdmin(usuario, post);

/**
 * Perfis que o usuário logado pode atribuir ao criar/editar alguém: Professor
 * não cria nem promove Administradores (regra da API).
 */
export const perfisAtribuiveis = (perfil?: Perfil | null): Perfil[] => {
  if (perfil === 'Administrador')
    return ['Administrador', 'Professor', 'Aluno'];
  if (perfil === 'Professor') return ['Professor', 'Aluno'];
  return [];
};

/** Editar um usuário: Professor nunca mexe em Administradores. */
export const podeAlterarUsuario = (
  usuario: IUsuarioLogado | null | undefined,
  alvo: { perfil: Perfil }
): boolean =>
  podeGerenciarUsuarios(usuario?.perfil) &&
  (usuario?.perfil === 'Administrador' || alvo.perfil !== 'Administrador');

/** Excluir um usuário: mesma regra de editar, e ninguém exclui a própria conta. */
export const podeExcluirUsuario = (
  usuario: IUsuarioLogado | null | undefined,
  alvo: { _id: string; perfil: Perfil }
): boolean => podeAlterarUsuario(usuario, alvo) && alvo._id !== usuario?.id;
