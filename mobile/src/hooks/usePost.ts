import { useCallback } from 'react';
import api from '@/services/api';
import type { IPost } from '@/interfaces/IPost';
import { useRequisicao } from './useRequisicao';

/** Um post pelo id (busca de novo na API para mostrar a versão atual). */
export function usePost(id: string) {
  const buscar = useCallback(
    async () => (await api.get<IPost>(`/posts/${id}`)).data,
    [id]
  );
  const { dados, ...resto } = useRequisicao(buscar, 'Erro ao carregar o post');
  return { post: dados, ...resto };
}
