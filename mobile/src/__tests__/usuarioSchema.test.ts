import {
  criarUsuarioSchema,
  editarUsuarioSchema,
} from '@/schemas/usuarioSchema';

const valido = {
  nome: 'Maria Souza',
  email: 'maria@escola.com',
  senha: 'segredo1',
  perfil: 'Aluno' as const,
};

const mensagens = (resultado: { error?: { issues: { message: string }[] } }) =>
  resultado.error?.issues.map((issue) => issue.message);

describe('usuarioSchema', () => {
  it('deve aceitar um usuário válido, aparando nome e email', () => {
    const resultado = criarUsuarioSchema.safeParse({
      ...valido,
      nome: ' Maria Souza ',
      email: 'maria@escola.com ',
    });
    expect(resultado.data).toEqual(valido);
  });

  it('deve rejeitar nome curto, email inválido e senha curta', () => {
    const resultado = criarUsuarioSchema.safeParse({
      ...valido,
      nome: 'M',
      email: 'maria',
      senha: '123',
    });
    expect(mensagens(resultado)).toEqual([
      'Nome deve ter pelo menos 2 caracteres',
      'Email inválido',
      'Senha deve ter pelo menos 6 caracteres',
    ]);
  });

  it('deve rejeitar senha com mais de 20 caracteres', () => {
    const resultado = criarUsuarioSchema.safeParse({
      ...valido,
      senha: 'a'.repeat(21),
    });
    expect(mensagens(resultado)).toEqual([
      'Senha deve ter no máximo 20 caracteres',
    ]);
  });

  it('deve exigir senha no cadastro', () => {
    const resultado = criarUsuarioSchema.safeParse({ ...valido, senha: '' });
    expect(resultado.success).toBe(false);
  });

  it('deve aceitar senha em branco na edição, mas validar se preenchida', () => {
    expect(
      editarUsuarioSchema.safeParse({ ...valido, senha: '' }).success
    ).toBe(true);
    expect(
      mensagens(editarUsuarioSchema.safeParse({ ...valido, senha: '12' }))
    ).toEqual(['Senha deve ter pelo menos 6 caracteres']);
  });
});
