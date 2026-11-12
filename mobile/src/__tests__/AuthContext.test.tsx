import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { definirToken } from '@/services/api';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

jest.mock('expo-secure-store', () => {
  const dados = new Map<string, string>();
  return {
    __dados: dados,
    getItemAsync: jest.fn(async (k: string) => dados.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      dados.set(k, v);
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      dados.delete(k);
    }),
  };
});

jest.mock('@/services/api', () => {
  const real = jest.requireActual('@/services/api');
  return {
    __esModule: true,
    ...real,
    default: { post: jest.fn() },
    definirToken: jest.fn(),
  };
});

const armazenamento = (
  SecureStore as unknown as { __dados: Map<string, string> }
).__dados;
const mockPost = api.post as jest.Mock;

const usuario = {
  id: '1',
  nome: 'Professor A',
  email: 'professora@professora.com',
  perfil: 'Professor' as const,
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const renderizar = async () => {
  const hook = await renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(hook.result.current.carregando).toBe(false));
  return hook;
};

describe('AuthContext', () => {
  beforeEach(() => {
    armazenamento.clear();
    jest.clearAllMocks();
  });

  it('deve começar deslogado quando não há sessão salva', async () => {
    const { result } = await renderizar();
    expect(result.current.usuarioLogado).toBeNull();
  });

  it('deve restaurar a sessão salva no aparelho', async () => {
    armazenamento.set('token', 'token-salvo');
    armazenamento.set('usuario', JSON.stringify(usuario));

    const { result } = await renderizar();

    expect(result.current.usuarioLogado).toEqual(usuario);
    expect(definirToken).toHaveBeenCalledWith('token-salvo');
  });

  it('deve fazer login, salvar a sessão e definir o token', async () => {
    mockPost.mockResolvedValue({ data: { token: 'novo-token', usuario } });
    const { result } = await renderizar();

    await act(() => result.current.login('professora@professora.com', '123'));

    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      email: 'professora@professora.com',
      senha: '123',
    });
    expect(result.current.usuarioLogado).toEqual(usuario);
    expect(armazenamento.get('token')).toBe('novo-token');
    expect(definirToken).toHaveBeenCalledWith('novo-token');
  });

  it('deve propagar o erro e continuar deslogado quando o login falha', async () => {
    mockPost.mockRejectedValue(new Error('Credenciais inválidas'));
    const { result } = await renderizar();

    await expect(
      act(() => result.current.login('x@x.com', 'errada'))
    ).rejects.toThrow('Credenciais inválidas');

    expect(result.current.usuarioLogado).toBeNull();
    expect(armazenamento.size).toBe(0);
  });

  it('deve fazer logout e limpar a sessão', async () => {
    armazenamento.set('token', 'token-salvo');
    armazenamento.set('usuario', JSON.stringify(usuario));
    const { result } = await renderizar();

    await act(() => result.current.logout());

    expect(result.current.usuarioLogado).toBeNull();
    expect(armazenamento.size).toBe(0);
    expect(definirToken).toHaveBeenLastCalledWith(null);
  });
});
