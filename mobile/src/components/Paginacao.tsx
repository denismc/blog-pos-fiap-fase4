import { StyleSheet, Text, View } from 'react-native';
import { Botao } from './Botao';
import { cores, espacamento, fonte } from '@/theme';

interface PaginacaoProps {
  page: number;
  totalPages: number;
  total: number;
  onMudarPagina: (page: number) => void;
  desabilitado?: boolean;
}

/** Anterior / Próxima com a página atual, no padrão da Paginacao do web. */
export function Paginacao({
  page,
  totalPages,
  total,
  onMudarPagina,
  desabilitado = false,
}: PaginacaoProps) {
  if (totalPages <= 1) {
    return (
      <Text style={styles.total}>
        {total === 1 ? '1 usuário' : `${total} usuários`}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <Botao
        titulo="Anterior"
        variante="secundaria"
        style={styles.botao}
        disabled={desabilitado || page <= 1}
        onPress={() => onMudarPagina(page - 1)}
      />
      <View style={styles.info}>
        <Text style={styles.pagina}>
          Página {page} de {totalPages}
        </Text>
        <Text style={styles.total}>{total} usuários</Text>
      </View>
      <Botao
        titulo="Próxima"
        variante="secundaria"
        style={styles.botao}
        disabled={desabilitado || page >= totalPages}
        onPress={() => onMudarPagina(page + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.sm,
  },
  botao: { paddingHorizontal: espacamento.md },
  info: { flex: 1, alignItems: 'center' },
  pagina: { fontSize: fonte.normal, fontWeight: 'bold', color: cores.escura },
  total: {
    fontSize: fonte.pequena,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
});
