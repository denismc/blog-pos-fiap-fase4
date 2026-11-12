import { isAxiosError } from 'axios';

/**
 * Extrai a mensagem de erro de uma chamada à API.
 * O backend responde erros no formato { erro: string }.
 */
export function mensagemDeErro(err: unknown, padrao: string): string {
  if (isAxiosError<{ erro?: string }>(err)) {
    if (err.response?.data?.erro) return err.response.data.erro;
    if (!err.response) {
      return 'Não foi possível conectar à API. Verifique a URL e sua conexão.';
    }
  }
  return padrao;
}
