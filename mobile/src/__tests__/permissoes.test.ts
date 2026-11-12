import { podeGerenciarPosts, podeGerenciarUsuarios } from '@/utils/permissoes';

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
});
