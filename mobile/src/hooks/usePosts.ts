import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import type { IPost } from '@/interfaces/IPost';
import { mensagemDeErro } from '@/utils/erros';

interface UsePosts {
  posts: IPost[];
  /** Primeira carga (mostra o indicador no meio da tela). */
  carregando: boolean;
  /** Recarga pelo "puxar para atualizar" (mostra o indicador no topo). */
  atualizando: boolean;
  erro: string;
  recarregar: () => Promise<void>;
}

type Resultado = { posts: IPost[]; erro: '' } | { posts: null; erro: string };

/** Busca na API sem mexer em estado: quem chama decide o que atualizar. */
async function buscarPosts(): Promise<Resultado> {
  try {
    const { data } = await api.get<IPost[]>('/posts');
    return { posts: data, erro: '' };
  } catch (err) {
    return {
      posts: null,
      erro: mensagemDeErro(err, 'Erro ao carregar os posts'),
    };
  }
}

/** Carrega a lista de posts (já vem do mais novo para o mais antigo). */
export function usePosts(): UsePosts {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const aplicar = useCallback((resultado: Resultado) => {
    if (resultado.posts) setPosts(resultado.posts);
    setErro(resultado.erro);
  }, []);

  useEffect(() => {
    // Evita atualizar estado se a tela fechar antes da resposta.
    let ativo = true;
    void buscarPosts().then((resultado) => {
      if (!ativo) return;
      aplicar(resultado);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, [aplicar]);

  const recarregar = useCallback(async () => {
    setAtualizando(true);
    aplicar(await buscarPosts());
    setAtualizando(false);
  }, [aplicar]);

  return { posts, carregando, atualizando, erro, recarregar };
}
