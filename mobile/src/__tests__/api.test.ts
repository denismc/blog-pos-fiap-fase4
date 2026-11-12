import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import api, { definirAoNaoAutorizado, definirToken } from '@/services/api';

/** Substitui a camada HTTP por uma função que responde com o status dado. */
const responderCom = (status: number) => {
  const adapter = jest.fn(async (config: InternalAxiosRequestConfig) => {
    const response = { status, data: {}, statusText: '', headers: {}, config };
    if (status >= 400) {
      throw new AxiosError('erro', undefined, config, undefined, response);
    }
    return response;
  });
  api.defaults.adapter = adapter;
  return adapter;
};

describe('api', () => {
  afterEach(() => {
    definirToken(null);
    definirAoNaoAutorizado(null);
  });

  it('deve enviar o token no header Authorization', async () => {
    const adapter = responderCom(200);
    definirToken('abc');

    await api.get('/posts');

    const config = adapter.mock.calls[0][0];
    expect(config.headers.Authorization).toBe('Bearer abc');
  });

  it('não deve enviar Authorization sem token', async () => {
    const adapter = responderCom(200);

    await api.get('/posts');

    expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });

  it('deve chamar o callback de não autorizado quando a API responder 401', async () => {
    responderCom(401);
    const aoNaoAutorizado = jest.fn();
    definirAoNaoAutorizado(aoNaoAutorizado);

    await expect(api.get('/posts')).rejects.toThrow();
    expect(aoNaoAutorizado).toHaveBeenCalledTimes(1);
  });

  it('não deve deslogar quando o 401 vier do próprio login', async () => {
    responderCom(401);
    const aoNaoAutorizado = jest.fn();
    definirAoNaoAutorizado(aoNaoAutorizado);

    await expect(api.post('/auth/login', {})).rejects.toThrow();
    expect(aoNaoAutorizado).not.toHaveBeenCalled();
  });
});
