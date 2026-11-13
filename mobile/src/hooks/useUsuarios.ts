import { useCallback } from 'react';
import api from '@/services/api';
import type { IPaginado, IUsuario } from '@/interfaces/IUsuario';
import type { Perfil } from '@/interfaces/IUsuarioLogado';
import { useRequisicao } from './useRequisicao';

export const LIMITE_POR_PAGINA = 10;

type PaginaDeUsuarios = IPaginado<IUsuario> & { perfil: Perfil };

/**
 * Uma página de usuários de um perfil (GET /usuarios?perfil=&page=&limit=).
 * Trocar o perfil ou a página refaz a busca.
 */
export function useUsuarios(perfil: Perfil, page: number) {
  const buscar = useCallback(async (): Promise<PaginaDeUsuarios> => {
    const { data } = await api.get<IPaginado<IUsuario>>('/usuarios', {
      params: { perfil, page, limit: LIMITE_POR_PAGINA },
    });
    // Guarda o filtro junto da resposta para saber se ela é a da tela atual.
    return { ...data, perfil };
  }, [perfil, page]);

  const { dados, ...resto } = useRequisicao(
    buscar,
    'Erro ao carregar os usuários'
  );

  /** Já existe resposta, mas de outra página/perfil: a nova está a caminho. */
  const trocandoPagina =
    !!dados && (dados.page !== page || dados.perfil !== perfil);

  return { resultado: dados, trocandoPagina, ...resto };
}
