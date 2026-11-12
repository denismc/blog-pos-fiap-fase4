import { create } from 'axios';
import { API_URL } from '@/config/env';

const api = create({ baseURL: API_URL, timeout: 15000 });

/*
 * O token fica em memória (o SecureStore é assíncrono e não deve ser lido a
 * cada requisição). Quem mantém esse valor atualizado é o AuthContext.
 */
let tokenAtual: string | null = null;
let aoNaoAutorizado: (() => void) | null = null;

export function definirToken(token: string | null): void {
  tokenAtual = token;
}

/** Registra o que fazer quando a API responder 401 (no app: logout). */
export function definirAoNaoAutorizado(callback: (() => void) | null): void {
  aoNaoAutorizado = callback;
}

api.interceptors.request.use((config) => {
  if (tokenAtual) config.headers.Authorization = `Bearer ${tokenAtual}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const eRotaDeLogin = error.config?.url?.includes('/auth/login');
    // Diferente do web, não há window.location: o logout limpa a sessão e o
    // Expo Router redireciona para o login pelas rotas protegidas.
    if (error.response?.status === 401 && !eRotaDeLogin) {
      aoNaoAutorizado?.();
    }
    return Promise.reject(error);
  }
);

export default api;
