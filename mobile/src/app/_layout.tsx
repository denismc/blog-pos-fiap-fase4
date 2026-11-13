import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { podeGerenciarPosts } from '@/utils/permissoes';
import { cores } from '@/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Navegacao />
    </AuthProvider>
  );
}

/**
 * Rotas protegidas: sem usuário logado só existe a tela de login; com usuário
 * logado o login some da pilha. O Expo Router redireciona sozinho quando
 * `usuarioLogado` muda (login, logout ou token expirado).
 */
function Navegacao() {
  const { usuarioLogado, carregando } = useAuth();
  const logado = !!usuarioLogado;

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={cores.secundaria} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.escura },
        headerTintColor: cores.branco,
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: cores.clara },
      }}
    >
      <Stack.Protected guard={logado}>
        <Stack.Screen name="index" options={{ title: 'Blog FIAP' }} />
        <Stack.Screen name="posts/[id]" options={{ title: 'Post' }} />

        {/* Rotas por perfil: Aluno não chega nelas nem digitando o link. */}
        <Stack.Protected guard={podeGerenciarPosts(usuarioLogado?.perfil)}>
          <Stack.Screen name="posts/novo" options={{ title: 'Novo post' }} />
          <Stack.Screen
            name="posts/editar/[id]"
            options={{ title: 'Editar post' }}
          />
          <Stack.Screen
            name="admin/posts"
            options={{ title: 'Gerenciar posts' }}
          />
        </Stack.Protected>
      </Stack.Protected>

      <Stack.Protected guard={!logado}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.clara,
  },
});
