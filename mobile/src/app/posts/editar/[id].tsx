import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePost } from '@/hooks/usePost';
import type { PostForm } from '@/schemas/postSchema';
import { eAutorOuAdmin } from '@/utils/permissoes';
import { Botao } from '@/components/Botao';
import { FormPost } from '@/components/FormPost';
import { cores, espacamento, fonte } from '@/theme';

/**
 * Edição de post. A rota já exige Professor ou Administrador; aqui ainda se
 * confere se o usuário é o autor ou Administrador, como faz a API.
 */
export default function EditarPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { usuarioLogado } = useAuth();
  const { post, carregando, erro, recarregar } = usePost(id);

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={cores.secundaria}
          accessibilityLabel="Carregando post"
        />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro} accessibilityRole="alert">
          {erro || 'Post não encontrado'}
        </Text>
        <Botao titulo="Tentar novamente" onPress={recarregar} />
      </View>
    );
  }

  if (!eAutorOuAdmin(usuarioLogado, post)) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro} accessibilityRole="alert">
          Você só pode alterar seus próprios posts.
        </Text>
        <Botao
          titulo="Voltar"
          variante="secundaria"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const salvar = async (dados: PostForm) => {
    await api.put(`/posts/${post._id}`, dados);
    // O detalhe recarrega sozinho ao voltar a ficar visível.
    router.back();
  };

  return (
    <FormPost
      textoBotao="Salvar alterações"
      valoresIniciais={{ titulo: post.titulo, conteudo: post.conteudo }}
      onSalvar={salvar}
    />
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamento.xl,
    gap: espacamento.md,
  },
  erro: { fontSize: fonte.media, color: cores.erro, textAlign: 'center' },
});
