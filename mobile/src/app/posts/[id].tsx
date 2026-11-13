import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { usePost } from '@/hooks/usePost';
import { useRecarregarAoVoltar } from '@/hooks/useRecarregarAoVoltar';
import { nomeDoAutor } from '@/utils/posts';
import { podeAlterarPost } from '@/utils/permissoes';
import { formatarData } from '@/utils/datas';
import { Botao } from '@/components/Botao';
import { Comentarios } from '@/components/Comentarios';
import { cores, espacamento, fonte, raio } from '@/theme';

/** Leitura do post completo, com os comentários logo abaixo. */
export default function DetalhePost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { usuarioLogado } = useAuth();
  const { post, carregando, erro, recarregar } = usePost(id);
  // Depois de editar, o post volta atualizado.
  useRecarregarAoVoltar(recarregar);

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
      <View style={[styles.centro, styles.erroContainer]}>
        <Text style={styles.erro} accessibilityRole="alert">
          {erro || 'Post não encontrado'}
        </Text>
        <Botao titulo="Tentar novamente" onPress={recarregar} />
        <Botao
          titulo="Voltar"
          variante="secundaria"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const foiAtualizado = post.updatedAt !== post.createdAt;
  const podeEditar = podeAlterarPost(usuarioLogado, post);

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen options={{ title: post.titulo }} />
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.post}>
          <Text style={styles.titulo} accessibilityRole="header">
            {post.titulo}
          </Text>
          <View>
            <Text style={styles.autor}>Por {nomeDoAutor(post)}</Text>
            <Text style={styles.meta}>
              Publicado em {formatarData(post.createdAt)}
              {foiAtualizado
                ? ` · Atualizado em ${formatarData(post.updatedAt)}`
                : ''}
            </Text>
          </View>
          <Text style={styles.texto}>{post.conteudo}</Text>
          {podeEditar ? (
            <Botao
              titulo="Editar post"
              variante="secundaria"
              onPress={() => router.push(`/posts/editar/${post._id}`)}
            />
          ) : null}
        </View>

        <Comentarios postId={post._id} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  erroContainer: { padding: espacamento.xl, gap: espacamento.md },
  erro: { fontSize: fonte.media, color: cores.erro, textAlign: 'center' },
  conteudo: { padding: espacamento.lg, gap: espacamento.xl },
  post: {
    backgroundColor: cores.branco,
    borderRadius: raio.md,
    padding: espacamento.lg,
    gap: espacamento.md,
  },
  titulo: {
    fontSize: fonte.grande,
    fontWeight: 'bold',
    color: cores.escura,
  },
  autor: {
    fontSize: fonte.normal,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  meta: { fontSize: fonte.pequena, color: cores.textoSecundario },
  texto: { fontSize: fonte.media, color: cores.texto, lineHeight: 24 },
});
