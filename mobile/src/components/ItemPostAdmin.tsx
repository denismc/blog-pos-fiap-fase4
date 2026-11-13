import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { IPost } from '@/interfaces/IPost';
import { formatarData } from '@/utils/datas';
import { nomeDoAutor, resumir } from '@/utils/posts';
import { cores, espacamento, fonte, raio } from '@/theme';

interface ItemPostAdminProps {
  post: IPost;
  /** Mostra Editar/Excluir (autor do post ou Administrador). */
  podeAlterar: boolean;
  /** true enquanto a exclusão deste post está em andamento. */
  excluindo?: boolean;
  onAbrir: (post: IPost) => void;
  onEditar: (post: IPost) => void;
  onExcluir: (post: IPost) => void;
}

/** Linha da página administrativa: dados do post e as ações permitidas. */
export function ItemPostAdmin({
  post,
  podeAlterar,
  excluindo = false,
  onAbrir,
  onEditar,
  onExcluir,
}: ItemPostAdminProps) {
  return (
    <View style={[styles.item, excluindo && styles.excluindo]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${post.titulo}`}
        onPress={() => onAbrir(post)}
        style={styles.info}
      >
        <Text style={styles.titulo} numberOfLines={2}>
          {post.titulo}
        </Text>
        <Text style={styles.resumo} numberOfLines={2}>
          {resumir(post.conteudo, 100)}
        </Text>
        <Text style={styles.meta}>
          {nomeDoAutor(post)} · {formatarData(post.createdAt)}
        </Text>
      </Pressable>

      {podeAlterar ? (
        <View style={styles.acoes}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${post.titulo}`}
            disabled={excluindo}
            onPress={() => onEditar(post)}
            style={({ pressed }) => [
              styles.acao,
              pressed && styles.pressionado,
            ]}
          >
            <Text style={styles.editar}>Editar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Excluir ${post.titulo}`}
            accessibilityState={{ busy: excluindo, disabled: excluindo }}
            disabled={excluindo}
            onPress={() => onExcluir(post)}
            style={({ pressed }) => [
              styles.acao,
              pressed && styles.pressionado,
            ]}
          >
            <Text style={styles.excluir}>
              {excluindo ? 'Excluindo...' : 'Excluir'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.somenteLeitura}>
          Somente o autor ou um Administrador pode alterar este post.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: cores.branco,
    borderRadius: raio.md,
    padding: espacamento.lg,
    gap: espacamento.md,
  },
  excluindo: { opacity: 0.5 },
  info: { gap: espacamento.xs },
  titulo: {
    fontSize: fonte.media,
    fontWeight: 'bold',
    color: cores.escura,
  },
  resumo: { fontSize: fonte.normal, color: cores.texto },
  meta: { fontSize: fonte.pequena, color: cores.textoSecundario },
  acoes: {
    flexDirection: 'row',
    gap: espacamento.sm,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingTop: espacamento.md,
  },
  acao: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raio.sm,
    backgroundColor: cores.clara,
  },
  pressionado: { opacity: 0.7 },
  editar: {
    fontSize: fonte.normal,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  excluir: { fontSize: fonte.normal, fontWeight: 'bold', color: cores.erro },
  somenteLeitura: {
    fontSize: fonte.pequena,
    fontStyle: 'italic',
    color: cores.textoSecundario,
  },
});
