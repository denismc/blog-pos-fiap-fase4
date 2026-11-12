import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useComentarios } from '@/hooks/useComentarios';
import {
  comentarioSchema,
  type ComentarioForm,
} from '@/schemas/comentarioSchema';
import type { IComentario } from '@/interfaces/IComentario';
import { eAutorOuAdmin } from '@/utils/permissoes';
import { formatarDataHora } from '@/utils/datas';
import { mensagemDeErro } from '@/utils/erros';
import { confirmar } from '@/utils/confirmar';
import { Botao } from './Botao';
import { CampoTexto } from './CampoTexto';
import { cores, espacamento, fonte, raio } from '@/theme';

interface ComentariosProps {
  postId: string;
}

/** Lista de comentários do post, com formulário para comentar. */
export function Comentarios({ postId }: ComentariosProps) {
  const { usuarioLogado } = useAuth();
  const { comentarios, carregando, erro, recarregar, enviar, excluir } =
    useComentarios(postId);
  const [erroEnvio, setErroEnvio] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComentarioForm>({
    resolver: zodResolver(comentarioSchema),
    defaultValues: { conteudo: '' },
  });

  const comentar = async ({ conteudo }: ComentarioForm) => {
    setErroEnvio('');
    try {
      await enviar(conteudo);
      reset();
    } catch (err) {
      setErroEnvio(mensagemDeErro(err, 'Erro ao enviar comentário'));
    }
  };

  const removerComentario = async (comentario: IComentario) => {
    const ok = await confirmar(
      'Excluir comentário',
      'Tem certeza que deseja excluir este comentário?'
    );
    if (!ok) return;
    try {
      await excluir(comentario._id);
    } catch (err) {
      Alert.alert('Erro', mensagemDeErro(err, 'Erro ao excluir comentário'));
    }
  };

  const renderizarLista = () => {
    if (carregando) {
      return <Text style={styles.aviso}>Carregando comentários...</Text>;
    }
    if (erro) {
      return (
        <View style={styles.bloco}>
          <Text style={styles.erro} accessibilityRole="alert">
            {erro}
          </Text>
          <Botao
            titulo="Tentar novamente"
            variante="secundaria"
            onPress={recarregar}
          />
        </View>
      );
    }
    if (comentarios.length === 0) {
      return <Text style={styles.aviso}>Nenhum comentário ainda.</Text>;
    }
    return comentarios.map((comentario) => (
      <View key={comentario._id} style={styles.comentario}>
        <View style={styles.cabecalho}>
          <View style={styles.meta}>
            <Text style={styles.autor}>
              {comentario.autor?.nome ?? 'Autor desconhecido'}
            </Text>
            <Text style={styles.data}>
              {formatarDataHora(comentario.createdAt)}
            </Text>
          </View>
          {eAutorOuAdmin(usuarioLogado, comentario) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir comentário"
              hitSlop={8}
              onPress={() => void removerComentario(comentario)}
            >
              <Text style={styles.excluir}>Excluir</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.conteudo}>{comentario.conteudo}</Text>
      </View>
    ));
  };

  return (
    <View style={styles.bloco}>
      <Text style={styles.titulo}>
        Comentários{carregando || erro ? '' : ` (${comentarios.length})`}
      </Text>

      <Controller
        control={control}
        name="conteudo"
        render={({ field: { onChange, onBlur, value } }) => (
          <CampoTexto
            rotulo="Seu comentário"
            placeholder="Escreva um comentário..."
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            erro={errors.conteudo?.message ?? (erroEnvio || undefined)}
            multiline
            maxLength={1000}
            style={styles.campo}
          />
        )}
      />
      <Botao
        titulo="Comentar"
        carregando={isSubmitting}
        onPress={() => void handleSubmit(comentar)()}
      />

      {renderizarLista()}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: espacamento.md },
  titulo: {
    fontSize: fonte.titulo,
    fontWeight: 'bold',
    color: cores.escura,
  },
  campo: {
    minHeight: 80,
    paddingTop: espacamento.md,
    textAlignVertical: 'top',
  },
  aviso: { fontSize: fonte.normal, color: cores.textoSecundario },
  erro: { fontSize: fonte.normal, color: cores.erro },
  comentario: {
    backgroundColor: cores.branco,
    borderRadius: raio.sm,
    padding: espacamento.md,
    gap: espacamento.xs,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: espacamento.sm,
  },
  meta: { flexShrink: 1 },
  autor: {
    fontSize: fonte.normal,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  data: { fontSize: fonte.pequena, color: cores.textoSecundario },
  excluir: { fontSize: fonte.normal, fontWeight: 'bold', color: cores.erro },
  conteudo: { fontSize: fonte.normal, color: cores.texto, lineHeight: 20 },
});
