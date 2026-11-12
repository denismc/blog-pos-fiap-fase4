import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';
import { cores, espacamento, fonte, raio } from '@/theme';

type Variante = 'primaria' | 'secundaria' | 'perigo';

interface BotaoProps extends Omit<PressableProps, 'children'> {
  titulo: string;
  variante?: Variante;
  carregando?: boolean;
}

const corDeFundo: Record<Variante, string> = {
  primaria: cores.primaria,
  secundaria: cores.secundaria,
  perigo: cores.erro,
};

export function Botao({
  titulo,
  variante = 'primaria',
  carregando = false,
  disabled,
  style,
  ...props
}: BotaoProps) {
  const desabilitado = disabled || carregando;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado, busy: carregando }}
      disabled={desabilitado}
      style={(estado) => [
        styles.botao,
        { backgroundColor: corDeFundo[variante] },
        estado.pressed && styles.pressionado,
        desabilitado && styles.desabilitado,
        typeof style === 'function' ? style(estado) : style,
      ]}
      {...props}
    >
      {carregando ? (
        <ActivityIndicator color={cores.branco} />
      ) : (
        <Text style={styles.texto}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 48,
    paddingHorizontal: espacamento.xl,
    borderRadius: raio.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: 0.85 },
  desabilitado: { opacity: 0.6 },
  texto: {
    color: cores.branco,
    fontSize: fonte.media,
    fontWeight: 'bold',
  },
});
