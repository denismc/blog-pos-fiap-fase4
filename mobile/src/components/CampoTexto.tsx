import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { cores, espacamento, fonte, raio } from '@/theme';

interface CampoTextoProps extends TextInputProps {
  rotulo: string;
  erro?: string;
}

export function CampoTexto({ rotulo, erro, style, ...props }: CampoTextoProps) {
  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor={cores.textoSecundario}
        style={[styles.input, erro ? styles.inputComErro : null, style]}
        {...props}
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { gap: espacamento.xs },
  rotulo: {
    fontSize: fonte.normal,
    fontWeight: 'bold',
    color: cores.texto,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: espacamento.md,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.sm,
    backgroundColor: cores.branco,
    fontSize: fonte.media,
    color: cores.texto,
  },
  inputComErro: { borderColor: cores.erro },
  erro: { fontSize: fonte.pequena, color: cores.erro },
});
