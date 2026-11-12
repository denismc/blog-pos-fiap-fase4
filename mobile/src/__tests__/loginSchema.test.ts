import { loginSchema } from '@/schemas/loginSchema';

describe('loginSchema', () => {
  it('deve aceitar email e senha válidos', () => {
    const resultado = loginSchema.safeParse({
      email: 'aluno@aluno.com',
      senha: 'aluno123',
    });
    expect(resultado.success).toBe(true);
  });

  it('deve remover espaços do email antes de validar', () => {
    const resultado = loginSchema.safeParse({
      email: '  aluno@aluno.com ',
      senha: 'aluno123',
    });
    expect(resultado.success).toBe(true);
    expect(resultado.data?.email).toBe('aluno@aluno.com');
  });

  it('deve rejeitar email inválido', () => {
    const resultado = loginSchema.safeParse({ email: 'abc', senha: '123' });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0].message).toBe('Email inválido');
  });

  it('deve rejeitar senha vazia', () => {
    const resultado = loginSchema.safeParse({
      email: 'aluno@aluno.com',
      senha: '',
    });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0].message).toBe('Senha é obrigatória');
  });
});
