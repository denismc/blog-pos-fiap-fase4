import { useCallback } from 'react';
import api from '@/services/api';
import type { IComentario } from '@/interfaces/IComentario';
import { useRequisicao } from './useRequisicao';

/** Comentários de um post (do mais antigo para o mais novo), com envio e exclusão. */
export function useComentarios(postId: string) {
  const buscar = useCallback(
    async () =>
      (
        await api.get<IComentario[]>('/comentarios', {
          params: { post: postId },
        })
      ).data,
    [postId]
  );
  const { dados, recarregar, ...resto } = useRequisicao(
    buscar,
    'Erro ao carregar os comentários'
  );

  /** Erros sobem para a tela, que decide como mostrar. */
  const enviar = useCallback(
    async (conteudo: string) => {
      await api.post('/comentarios', { conteudo, post: postId });
      await recarregar();
    },
    [postId, recarregar]
  );

  const excluir = useCallback(
    async (id: string) => {
      await api.delete(`/comentarios/${id}`);
      await recarregar();
    },
    [recarregar]
  );

  return { comentarios: dados ?? [], recarregar, enviar, excluir, ...resto };
}
