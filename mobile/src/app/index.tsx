import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { filtrarPosts } from '@/utils/posts';
import { Botao } from '@/components/Botao';
import { CampoBusca } from '@/components/CampoBusca';
import { CardPost } from '@/components/CardPost';
import { cores, espacamento, fonte } from '@/theme';

/** Página principal: lista de posts com busca por palavra-chave. */
export default function ListaPosts() {
  const { usuarioLogado, logout } = useAuth();
  const { posts, carregando, atualizando, erro, recarregar } = usePosts();
  const [termoBusca, setTermoBusca] = useState('');

  const postsFiltrados = useMemo(
    () => filtrarPosts(posts, termoBusca),
    [posts, termoBusca]
  );

  const cabecalho = (
    <View style={styles.cabecalho}>
      <Text style={styles.saudacao}>
        Olá, {usuarioLogado?.nome}{' '}
        <Text style={styles.perfil}>({usuarioLogado?.perfil})</Text>
      </Text>
      <CampoBusca
        valor={termoBusca}
        onChange={setTermoBusca}
        placeholder="Buscar por título, conteúdo ou professor..."
      />
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
        {termoBusca.trim()
          ? 'Nenhum post encontrado para essa busca.'
          : 'Nenhum post publicado ainda.'}
      </Text>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sair"
              hitSlop={8}
              onPress={logout}
            >
              <Text style={styles.sair}>Sair</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={postsFiltrados}
        keyExtractor={(post) => post._id}
        renderItem={({ item }) => <CardPost post={item} />}
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
    </>
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  lista: { padding: espacamento.lg, flexGrow: 1 },
  cabecalho: { gap: espacamento.md, marginBottom: espacamento.lg },
  saudacao: {
    fontSize: fonte.media,
    fontWeight: 'bold',
    color: cores.escura,
  },
  perfil: { fontWeight: 'normal', color: cores.textoSecundario },
  separador: { height: espacamento.md },
  aviso: { marginTop: espacamento.xl, gap: espacamento.md },
  erro: { fontSize: fonte.media, color: cores.erro, textAlign: 'center' },
  semPosts: {
    fontSize: fonte.media,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
  sair: { color: cores.branco, fontSize: fonte.media, fontWeight: 'bold' },
});
