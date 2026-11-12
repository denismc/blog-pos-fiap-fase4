import { useRouter } from 'expo-router';
import api from '@/services/api';
import type { IPost } from '@/interfaces/IPost';
import type { PostForm } from '@/schemas/postSchema';
import { FormPost } from '@/components/FormPost';

/** Criação de post (rota protegida: só Professor e Administrador). */
export default function NovoPost() {
  const router = useRouter();

  const criar = async (dados: PostForm) => {
    const { data } = await api.post<IPost>('/posts', dados);
    // Troca o formulário pelo post criado: o "voltar" leva para a lista.
    router.replace(`/posts/${data._id}`);
  };

  return <FormPost textoBotao="Publicar" onSalvar={criar} />;
}
