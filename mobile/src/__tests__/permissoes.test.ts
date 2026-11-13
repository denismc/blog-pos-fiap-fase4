import type { IUsuarioLogado, Perfil } from '@/interfaces/IUsuarioLogado';
import {
  eAutorOuAdmin,
  perfisAtribuiveis,
  podeAlterarPost,
  podeAlterarUsuario,
  podeExcluirUsuario,
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

  describe('gestão de usuários', () => {
    it('perfisAtribuiveis: Professor não atribui Administrador', () => {
      expect(perfisAtribuiveis('Administrador')).toEqual([
        'Administrador',
        'Professor',
        'Aluno',
      ]);
      expect(perfisAtribuiveis('Professor')).toEqual(['Professor', 'Aluno']);
      expect(perfisAtribuiveis('Aluno')).toEqual([]);
    });

    it('podeAlterarUsuario: Professor não altera Administrador', () => {
      const alvoAdmin = { perfil: 'Administrador' as const };
      const alvoAluno = { perfil: 'Aluno' as const };
      expect(podeAlterarUsuario(usuario('p', 'Professor'), alvoAluno)).toBe(
        true
      );
      expect(podeAlterarUsuario(usuario('p', 'Professor'), alvoAdmin)).toBe(
        false
      );
      expect(podeAlterarUsuario(usuario('a', 'Administrador'), alvoAdmin)).toBe(
        true
      );
      expect(podeAlterarUsuario(usuario('x', 'Aluno'), alvoAluno)).toBe(false);
    });

    it('podeExcluirUsuario: ninguém exclui a própria conta', () => {
      const admin = usuario('a', 'Administrador');
      expect(
        podeExcluirUsuario(admin, { _id: 'a', perfil: 'Administrador' })
      ).toBe(false);
      expect(podeExcluirUsuario(admin, { _id: 'b', perfil: 'Professor' })).toBe(
        true
      );
    });
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
