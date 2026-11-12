import type { Perfil } from '@/interfaces/IUsuarioLogado';

/** Professores e Administradores criam/editam posts; alunos só visualizam. */
export const podeGerenciarPosts = (perfil?: Perfil | null): boolean =>
  perfil === 'Administrador' || perfil === 'Professor';

/** Gestão de professores e alunos (a API impede que Professor mexa em Administradores). */
export const podeGerenciarUsuarios = (perfil?: Perfil | null): boolean =>
  perfil === 'Administrador' || perfil === 'Professor';
