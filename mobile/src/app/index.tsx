import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Botao } from '@/components/Botao';
import { cores, espacamento, fonte } from '@/theme';

/** Tela inicial provisória da área logada: vira a lista de posts na entrega 6. */
export default function Inicio() {
  const { usuarioLogado, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Olá, {usuarioLogado?.nome}!</Text>
      <Text style={styles.texto}>Perfil: {usuarioLogado?.perfil}</Text>
      <Botao titulo="Sair" variante="secundaria" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamento.xl,
    gap: espacamento.md,
  },
  titulo: {
    fontSize: fonte.titulo,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  texto: { fontSize: fonte.media, color: cores.texto },
});
