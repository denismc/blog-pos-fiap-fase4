import type { IUsuarioLogado, Perfil } from '@/interfaces/IUsuarioLogado';
import {
  eAutorOuAdmin,
  podeAlterarPost,
  podeGerenciarPosts,
  podeGerenciarUsuarios,
} from '@/utils/permissoes';

const usuario = (id: string, perfil: Perfil): IUsuarioLogado => ({
  id,
  nome: 'Fulano',
  email: 'f@f.com',
  perfil,
});

describe('permissoes', () => {
  it.each([
    ['Administrador', true],
    ['Professor', true],
    ['Aluno', false],
    [null, false],
    [undefined, false],
  ] as const)('podeGerenciarPosts(%s) deve ser %s', (perfil, esperado) => {
    expect(podeGerenciarPosts(perfil)).toBe(esperado);
  });

  it.each([
    ['Administrador', true],
    ['Professor', true],
    ['Aluno', false],
    [null, false],
  ] as const)('podeGerenciarUsuarios(%s) deve ser %s', (perfil, esperado) => {
    expect(podeGerenciarUsuarios(perfil)).toBe(esperado);
  });

  describe('podeAlterarPost', () => {
    const post = { autor: { _id: 'u1' } };

    it('deve permitir o Professor autor e o Administrador', () => {
      expect(podeAlterarPost(usuario('u1', 'Professor'), post)).toBe(true);
      expect(podeAlterarPost(usuario('u9', 'Administrador'), post)).toBe(true);
    });

    it('não deve permitir Aluno, mesmo que conste como autor', () => {
      expect(podeAlterarPost(usuario('u1', 'Aluno'), post)).toBe(false);
    });

    it('não deve permitir Professor que não é o autor', () => {
      expect(podeAlterarPost(usuario('u2', 'Professor'), post)).toBe(false);
    });
  });

  describe('eAutorOuAdmin', () => {
    const item = { autor: { _id: 'u1' } };

    it('deve permitir o autor do item', () => {
      expect(eAutorOuAdmin(usuario('u1', 'Aluno'), item)).toBe(true);
    });

    it('deve permitir o Administrador mesmo sem ser o autor', () => {
      expect(eAutorOuAdmin(usuario('u9', 'Administrador'), item)).toBe(true);
    });

    it('não deve permitir outro Professor', () => {
      expect(eAutorOuAdmin(usuario('u2', 'Professor'), item)).toBe(false);
    });

    it('não deve permitir sem usuário ou com autor excluído', () => {
      expect(eAutorOuAdmin(null, item)).toBe(false);
      expect(eAutorOuAdmin(usuario('u1', 'Aluno'), { autor: null })).toBe(
        false
      );
    });
  });
});
