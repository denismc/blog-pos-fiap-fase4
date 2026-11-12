import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import api, { definirAoNaoAutorizado, definirToken } from '@/services/api';
import { carregarSessao, limparSessao, salvarSessao } from '@/services/sessao';
import type {
  IRespostaLogin,
  IUsuarioLogado,
} from '@/interfaces/IUsuarioLogado';

interface AuthContextValue {
  usuarioLogado: IUsuarioLogado | null;
  /** true enquanto a sessão salva no aparelho ainda está sendo lida. */
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuarioLogado, setUsuarioLogado] = useState<IUsuarioLogado | null>(
    null
  );
  const [carregando, setCarregando] = useState(true);

  const logout = useCallback(async () => {
    definirToken(null);
    setUsuarioLogado(null);
    await limparSessao();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const { data } = await api.post<IRespostaLogin>('/auth/login', {
      email,
      senha,
    });
    await salvarSessao(data);
    definirToken(data.token);
    setUsuarioLogado(data.usuario);
  }, []);

  // Restaura a sessão salva ao abrir o app.
  useEffect(() => {
    carregarSessao()
      .then((sessao) => {
        if (sessao) {
          definirToken(sessao.token);
          setUsuarioLogado(sessao.usuario);
        }
      })
      .finally(() => setCarregando(false));
  }, []);

  // Token expirado/inválido em qualquer chamada → desloga.
  useEffect(() => {
    definirAoNaoAutorizado(() => {
      void logout();
    });
    return () => definirAoNaoAutorizado(null);
  }, [logout]);

  const valor = useMemo(
    () => ({ usuarioLogado, carregando, login, logout }),
    [usuarioLogado, carregando, login, logout]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider');
  }
  return contexto;
}
