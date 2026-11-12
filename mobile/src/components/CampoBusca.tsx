import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { cores, espacamento, fonte, raio } from '@/theme';

interface CampoBuscaProps {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

/** Campo de busca com botão para limpar o texto. */
export function CampoBusca({
  valor,
  onChange,
  placeholder = 'Buscar...',
}: CampoBuscaProps) {
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Buscar posts"
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSecundario}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={styles.input}
      />
      {valor ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={8}
          onPress={() => onChange('')}
          style={styles.limpar}
        >
          <Text style={styles.limparTexto}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.sm,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: espacamento.md,
    fontSize: fonte.media,
    color: cores.texto,
  },
  limpar: { paddingHorizontal: espacamento.md },
  limparTexto: { fontSize: fonte.media, color: cores.textoSecundario },
});
