import { AxiosError, AxiosHeaders } from 'axios';
import { mensagemDeErro } from '@/utils/erros';

const erroAxios = (status?: number, data?: unknown) => {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError(
    'falhou',
    undefined,
    config,
    undefined,
    status ? { status, data, statusText: '', headers: {}, config } : undefined
  );
};

describe('mensagemDeErro', () => {
  it('deve usar a mensagem { erro } enviada pela API', () => {
    const err = erroAxios(401, { erro: 'Credenciais inválidas' });
    expect(mensagemDeErro(err, 'padrão')).toBe('Credenciais inválidas');
  });

  it('deve avisar quando não há resposta da API (sem conexão)', () => {
    expect(mensagemDeErro(erroAxios(), 'padrão')).toMatch(
      /Não foi possível conectar/
    );
  });

  it('deve usar a mensagem padrão nos demais casos', () => {
    expect(mensagemDeErro(erroAxios(500, {}), 'padrão')).toBe('padrão');
    expect(mensagemDeErro(new Error('x'), 'padrão')).toBe('padrão');
  });
});
