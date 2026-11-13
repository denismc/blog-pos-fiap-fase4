import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacamento, fonte, raio } from '@/theme';

export interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
}

interface SegmentadoProps<T extends string> {
  opcoes: readonly Opcao<T>[];
  valor: T;
  onChange: (valor: T) => void;
  /** Rótulo acima das opções (usado em formulários). */
  rotulo?: string;
  desabilitado?: boolean;
}

/** Botões lado a lado para escolher uma opção (filtros e campos de perfil). */
export function Segmentado<T extends string>({
  opcoes,
  valor,
  onChange,
  rotulo,
  desabilitado = false,
}: SegmentadoProps<T>) {
  return (
    <View style={styles.campo}>
      {rotulo ? <Text style={styles.rotulo}>{rotulo}</Text> : null}
      <View
        style={[styles.grupo, desabilitado && styles.desabilitado]}
        accessibilityRole="tablist"
      >
        {opcoes.map((opcao) => {
          const ativo = opcao.valor === valor;
          return (
            <Pressable
              key={opcao.valor}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativo, disabled: desabilitado }}
              disabled={desabilitado}
              onPress={() => onChange(opcao.valor)}
              style={[styles.opcao, ativo && styles.opcaoAtiva]}
            >
              <Text style={[styles.texto, ativo && styles.textoAtivo]}>
                {opcao.rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  grupo: {
    flexDirection: 'row',
    backgroundColor: cores.branco,
    borderRadius: raio.sm,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
  },
  desabilitado: { opacity: 0.6 },
  opcao: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacamento.xs,
  },
  opcaoAtiva: { backgroundColor: cores.secundaria },
  texto: { fontSize: fonte.normal, color: cores.secundaria },
  textoAtivo: { color: cores.branco, fontWeight: 'bold' },
});
