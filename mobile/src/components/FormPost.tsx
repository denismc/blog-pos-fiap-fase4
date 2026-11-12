import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, type PostForm } from '@/schemas/postSchema';
import { mensagemDeErro } from '@/utils/erros';
import { Botao } from './Botao';
import { CampoTexto } from './CampoTexto';
import { cores, espacamento, fonte, raio } from '@/theme';

interface FormPostProps {
  valoresIniciais?: PostForm;
  textoBotao: string;
  /** Erros lançados aqui viram a mensagem no topo do formulário. */
  onSalvar: (dados: PostForm) => Promise<void>;
}

/** Formulário de post, compartilhado pelas telas de criação e de edição. */
export function FormPost({
  valoresIniciais = { titulo: '', conteudo: '' },
  textoBotao,
  onSalvar,
}: FormPostProps) {
  const [erroApi, setErroApi] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: valoresIniciais,
  });

  const salvar = async (dados: PostForm) => {
    setErroApi('');
    try {
      await onSalvar(dados);
    } catch (err) {
      setErroApi(mensagemDeErro(err, 'Erro ao salvar o post'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {erroApi ? (
          <Text style={styles.erroApi} accessibilityRole="alert">
            {erroApi}
          </Text>
        ) : null}

        <Controller
          control={control}
          name="titulo"
          render={({ field: { onChange, onBlur, value } }) => (
            <CampoTexto
              rotulo="Título"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              erro={errors.titulo?.message}
              maxLength={150}
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="conteudo"
          render={({ field: { onChange, onBlur, value } }) => (
            <CampoTexto
              rotulo="Conteúdo"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              erro={errors.conteudo?.message}
              multiline
              style={styles.conteudoInput}
            />
          )}
        />

        <Botao
          titulo={textoBotao}
          carregando={isSubmitting}
          onPress={() => void handleSubmit(salvar)()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: espacamento.lg, gap: espacamento.lg },
  conteudoInput: {
    minHeight: 220,
    paddingTop: espacamento.md,
    textAlignVertical: 'top',
  },
  erroApi: {
    backgroundColor: '#fdecea',
    color: cores.erro,
    padding: espacamento.md,
    borderRadius: raio.sm,
    fontSize: fonte.normal,
  },
});
