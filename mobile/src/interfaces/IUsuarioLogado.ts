export type Perfil = 'Administrador' | 'Professor' | 'Aluno';

/** Usuário retornado por POST /auth/login (mesmo formato do front-end web). */
export interface IUsuarioLogado {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface IRespostaLogin {
  token: string;
  usuario: IUsuarioLogado;
}
