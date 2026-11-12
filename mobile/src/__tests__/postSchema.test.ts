import { postSchema } from '@/schemas/postSchema';

describe('postSchema', () => {
  it('deve aceitar título e conteúdo válidos, sem os espaços das pontas', () => {
    const resultado = postSchema.safeParse({
      titulo: '  Node.js  ',
      conteudo: ' Conteúdo com mais de dez letras ',
    });
    expect(resultado.success).toBe(true);
    expect(resultado.data).toEqual({
      titulo: 'Node.js',
      conteudo: 'Conteúdo com mais de dez letras',
    });
  });

  it('deve rejeitar título curto (contando sem espaços)', () => {
    const resultado = postSchema.safeParse({
      titulo: ' ab ',
      conteudo: 'Conteúdo suficiente',
    });
    expect(resultado.error?.issues[0].message).toBe(
      'Título deve ter pelo menos 3 caracteres'
    );
  });

  it('deve rejeitar título com mais de 150 caracteres', () => {
    const resultado = postSchema.safeParse({
      titulo: 'a'.repeat(151),
      conteudo: 'Conteúdo suficiente',
    });
    expect(resultado.error?.issues[0].message).toBe(
      'Título deve ter no máximo 150 caracteres'
    );
  });

  it('deve rejeitar conteúdo curto', () => {
    const resultado = postSchema.safeParse({
      titulo: 'Título',
      conteudo: 'curto',
    });
    expect(resultado.error?.issues[0].message).toBe(
      'Conteúdo deve ter pelo menos 10 caracteres'
    );
  });
});
