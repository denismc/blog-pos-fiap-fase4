import * as SecureStore from 'expo-secure-store';
import type { IUsuarioLogado } from '@/interfaces/IUsuarioLogado';

/**
 * Persistência da sessão no armazenamento seguro do aparelho
 * (Keychain no iOS, Keystore no Android) — o equivalente mobile do localStorage do web.
 */
const CHAVE_TOKEN = 'token';
const CHAVE_USUARIO = 'usuario';

export interface ISessao {
  token: string;
  usuario: IUsuarioLogado;
}

export async function salvarSessao({ token, usuario }: ISessao): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_TOKEN, token);
  await SecureStore.setItemAsync(CHAVE_USUARIO, JSON.stringify(usuario));
}

export async function carregarSessao(): Promise<ISessao | null> {
  const [token, usuario] = await Promise.all([
    SecureStore.getItemAsync(CHAVE_TOKEN),
    SecureStore.getItemAsync(CHAVE_USUARIO),
  ]);
  if (!token || !usuario) return null;

  try {
    return { token, usuario: JSON.parse(usuario) as IUsuarioLogado };
  } catch {
    return null;
  }
}

export async function limparSessao(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(CHAVE_TOKEN),
    SecureStore.deleteItemAsync(CHAVE_USUARIO),
  ]);
}
