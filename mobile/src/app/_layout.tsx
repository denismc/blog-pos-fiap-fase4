import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
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
