import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { IPost } from '@/interfaces/IPost';
import { formatarData, nomeDoAutor, resumir } from '@/utils/posts';
import { cores, espacamento, fonte, raio } from '@/theme';

interface CardPostProps {
  post: IPost;
  onPress?: (post: IPost) => void;
}

/** Card da lista: título, descrição curta, autor e data. */
export function CardPost({ post, onPress }: CardPostProps) {
  const autor = nomeDoAutor(post);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${post.titulo}, por ${autor}`}
      disabled={!onPress}
      onPress={() => onPress?.(post)}
      style={({ pressed }) => [styles.card, pressed && styles.pressionado]}
    >
      <Text style={styles.titulo} numberOfLines={2}>
        {post.titulo}
      </Text>
      <Text style={styles.resumo}>{resumir(post.conteudo)}</Text>
      <View style={styles.rodape}>
        <Text style={styles.autor} numberOfLines={1}>
          {autor}
        </Text>
        <Text style={styles.data}>{formatarData(post.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.branco,
    borderRadius: raio.md,
    padding: espacamento.lg,
    gap: espacamento.sm,
    borderLeftWidth: 4,
    borderLeftColor: cores.primaria,
    // Sombra: elevation no Android, shadow* no iOS.
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pressionado: { opacity: 0.85 },
  titulo: {
    fontSize: fonte.titulo,
    fontWeight: 'bold',
    color: cores.escura,
  },
  resumo: {
    fontSize: fonte.normal,
    color: cores.texto,
    lineHeight: 20,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacamento.sm,
  },
  autor: {
    flexShrink: 1,
    fontSize: fonte.pequena,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  data: { fontSize: fonte.pequena, color: cores.textoSecundario },
});
