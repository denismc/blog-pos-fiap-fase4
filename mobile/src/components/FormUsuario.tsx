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
import {
  criarUsuarioSchema,
  editarUsuarioSchema,
  type UsuarioForm,
} from '@/schemas/usuarioSchema';
import type { Perfil } from '@/interfaces/IUsuarioLogado';
import { mensagemDeErro } from '@/utils/erros';
import { Botao } from './Botao';
import { CampoTexto } from './CampoTexto';
import { Segmentado } from './Segmentado';
import { cores, espacamento, fonte, raio } from '@/theme';

interface FormUsuarioProps {
  modo: 'criar' | 'editar';
  valoresIniciais: UsuarioForm;
  /** Perfis que aparecem como opção (depende de quem está logado). */
  perfis: Perfil[];
  /** true quando o usuário edita a si mesmo: a API não deixa trocar o próprio perfil. */
  perfilBloqueado?: boolean;
  onSalvar: (dados: UsuarioForm) => Promise<void>;
}

/** Formulário de usuário, compartilhado pelas telas de criação e de edição. */
export function FormUsuario({
  modo,
  valoresIniciais,
  perfis,
  perfilBloqueado = false,
  onSalvar,
}: FormUsuarioProps) {
  const [erroApi, setErroApi] = useState('');
  const editando = modo === 'editar';

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioForm>({
    resolver: zodResolver(editando ? editarUsuarioSchema : criarUsuarioSchema),
    defaultValues: valoresIniciais,
  });

  const salvar = async (dados: UsuarioForm) => {
    setErroApi('');
    try {
      await onSalvar(dados);
    } catch (err) {
      setErroApi(mensagemDeErro(err, 'Erro ao salvar o usuário'));
    }
  };

  // Garante que o perfil atual apareça mesmo se não for atribuível
  // (ex.: Administrador editando a si mesmo com o perfil bloqueado).
  const opcoesPerfil = (
    perfis.includes(valoresIniciais.perfil)
      ? perfis
      : [valoresIniciais.perfil, ...perfis]
  ).map((perfil) => ({ valor: perfil, rotulo: perfil }));

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
          name="nome"
          render={({ field: { onChange, onBlur, value } }) => (
            <CampoTexto
              rotulo="Nome"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              erro={errors.nome?.message}
              maxLength={100}
              autoComplete="name"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <CampoTexto
              rotulo="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              erro={errors.email?.message}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          )}
        />

        <Controller
          control={control}
          name="senha"
          render={({ field: { onChange, onBlur, value } }) => (
            <CampoTexto
              rotulo={editando ? 'Nova senha (opcional)' : 'Senha'}
              placeholder={
                editando ? 'Deixe em branco para manter a atual' : undefined
              }
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              erro={errors.senha?.message}
              secureTextEntry
              maxLength={20}
              autoComplete="new-password"
            />
          )}
        />

        <Controller
          control={control}
          name="perfil"
          render={({ field: { onChange, value } }) => (
            <Segmentado
              rotulo="Perfil"
              opcoes={opcoesPerfil}
              valor={value}
              onChange={onChange}
              desabilitado={perfilBloqueado}
            />
          )}
        />
        {perfilBloqueado ? (
          <Text style={styles.dica}>
            Você não pode alterar o seu próprio perfil.
          </Text>
        ) : null}

        <Botao
          titulo={editando ? 'Salvar alterações' : 'Cadastrar'}
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
  dica: {
    fontSize: fonte.pequena,
    color: cores.textoSecundario,
    marginTop: -espacamento.sm,
  },
  erroApi: {
    backgroundColor: '#fdecea',
    color: cores.erro,
    padding: espacamento.md,
    borderRadius: raio.sm,
    fontSize: fonte.normal,
  },
});
