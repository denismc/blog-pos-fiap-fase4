import { StyleSheet, Text, View } from 'react-native';
import { API_URL } from '@/config/env';
import { cores, espacamento, fonte } from '@/theme';

/** Tela provisória: substituída pelo login/lista de posts nas próximas entregas. */
export default function Inicio() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Blog FIAP</Text>
      <Text style={styles.texto}>App mobile em construção.</Text>
      <Text style={styles.api}>API: {API_URL}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamento.xl,
    gap: espacamento.sm,
  },
  titulo: {
    fontSize: fonte.grande,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  texto: {
    fontSize: fonte.media,
    color: cores.texto,
  },
  api: {
    fontSize: fonte.pequena,
    color: cores.textoSecundario,
  },
});
