import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useRecarregarAoVoltar } from '@/hooks/useRecarregarAoVoltar';
import type { IPost } from '@/interfaces/IPost';
import { filtrarPosts } from '@/utils/posts';
import { podeAlterarPost } from '@/utils/permissoes';
import { confirmar } from '@/utils/confirmar';
import { mensagemDeErro } from '@/utils/erros';
import { Botao } from '@/components/Botao';
import { CampoBusca } from '@/components/CampoBusca';
import { ItemPostAdmin } from '@/components/ItemPostAdmin';
import { cores, espacamento, fonte, raio } from '@/theme';

type Filtro = 'todos' | 'meus';

/**
 * Página administrativa (Professor e Administrador): todos os posts, com
 * editar/excluir só para o autor do post ou para o Administrador.
 */
export default function AdminPosts() {
  const router = useRouter();
  const { usuarioLogado } = useAuth();
  const { posts, carregando, atualizando, erro, recarregar } = usePosts();
  const [termoBusca, setTermoBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  useRecarregarAoVoltar(recarregar);

  const postsVisiveis = useMemo(() => {
    const doFiltro =
      filtro === 'meus'
        ? posts.filter((post) => post.autor?._id === usuarioLogado?.id)
        : posts;
    return filtrarPosts(doFiltro, termoBusca);
  }, [posts, filtro, termoBusca, usuarioLogado?.id]);

  const excluir = async (post: IPost) => {
    const ok = await confirmar(
      'Excluir post',
      `Tem certeza que deseja excluir "${post.titulo}"? Essa ação não pode ser desfeita.`
    );
    if (!ok) return;

    setExcluindoId(post._id);
    try {
      await api.delete(`/posts/${post._id}`);
      await recarregar();
    } catch (err) {
      Alert.alert('Erro', mensagemDeErro(err, 'Erro ao excluir o post'));
    } finally {
      setExcluindoId(null);
    }
  };

  const cabecalho = (
    <View style={styles.cabecalho}>
      <Botao titulo="+ Novo post" onPress={() => router.push('/posts/novo')} />
      <CampoBusca
        valor={termoBusca}
        onChange={setTermoBusca}
        placeholder="Buscar por título, conteúdo ou professor..."
      />
      <View style={styles.filtros} accessibilityRole="tablist">
        {(
          [
            ['todos', 'Todos os posts'],
            ['meus', 'Meus posts'],
          ] as const
        ).map(([valor, rotulo]) => {
          const ativo = filtro === valor;
          return (
            <Pressable
              key={valor}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativo }}
              onPress={() => setFiltro(valor)}
              style={[styles.filtro, ativo && styles.filtroAtivo]}
            >
              <Text
                style={[styles.filtroTexto, ativo && styles.filtroTextoAtivo]}
              >
                {rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!carregando && !erro ? (
        <Text style={styles.contagem}>
          {postsVisiveis.length === 1
            ? '1 post'
            : `${postsVisiveis.length} posts`}
        </Text>
      ) : null}
    </View>
  );

  const renderizarVazio = () => {
    if (carregando) {
      return (
        <ActivityIndicator
          style={styles.aviso}
          size="large"
          color={cores.secundaria}
          accessibilityLabel="Carregando posts"
        />
      );
    }
    if (erro) {
      return (
        <View style={styles.aviso}>
          <Text style={styles.erro} accessibilityRole="alert">
            {erro}
          </Text>
          <Botao titulo="Tentar novamente" onPress={recarregar} />
        </View>
      );
    }
    return (
      <Text style={[styles.aviso, styles.semPosts]}>
        {termoBusca.trim() || filtro === 'meus'
          ? 'Nenhum post encontrado.'
          : 'Nenhum post publicado ainda.'}
      </Text>
    );
  };

  return (
    <FlatList
      data={postsVisiveis}
      keyExtractor={(post) => post._id}
      renderItem={({ item }) => (
        <ItemPostAdmin
          post={item}
          podeAlterar={podeAlterarPost(usuarioLogado, item)}
          excluindo={excluindoId === item._id}
          onAbrir={(post) => router.push(`/posts/${post._id}`)}
          onEditar={(post) => router.push(`/posts/editar/${post._id}`)}
          onExcluir={(post) => void excluir(post)}
        />
      )}
      ListHeaderComponent={cabecalho}
      ListEmptyComponent={renderizarVazio}
      ItemSeparatorComponent={Separador}
      contentContainerStyle={styles.lista}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={recarregar}
          colors={[cores.secundaria]}
          tintColor={cores.secundaria}
        />
      }
    />
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  lista: { padding: espacamento.lg, flexGrow: 1 },
  cabecalho: { gap: espacamento.md, marginBottom: espacamento.lg },
  filtros: {
    flexDirection: 'row',
    backgroundColor: cores.branco,
    borderRadius: raio.sm,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  filtro: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtroAtivo: { backgroundColor: cores.secundaria },
  filtroTexto: { fontSize: fonte.normal, color: cores.secundaria },
  filtroTextoAtivo: { color: cores.branco, fontWeight: 'bold' },
  contagem: { fontSize: fonte.pequena, color: cores.textoSecundario },
  separador: { height: espacamento.md },
  aviso: { marginTop: espacamento.xl, gap: espacamento.md },
  erro: { fontSize: fonte.media, color: cores.erro, textAlign: 'center' },
  semPosts: {
    fontSize: fonte.media,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
});
