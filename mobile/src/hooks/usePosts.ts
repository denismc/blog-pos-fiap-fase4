import api from '@/services/api';
import type { IPost } from '@/interfaces/IPost';
import { useRequisicao } from './useRequisicao';

const buscarPosts = async () => (await api.get<IPost[]>('/posts')).data;

/** Lista de posts (já vem do mais novo para o mais antigo). */
export function usePosts() {
  const { dados, ...resto } = useRequisicao(
    buscarPosts,
    'Erro ao carregar os posts'
  );
  return { posts: dados ?? [], ...resto };
}
