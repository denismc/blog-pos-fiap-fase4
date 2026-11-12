import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginForm } from '@/schemas/loginSchema';
import { mensagemDeErro } from '@/utils/erros';
import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { cores, espacamento, fonte, raio } from '@/theme';

export default function Login() {
  const { login } = useAuth();
  const [erroApi, setErroApi] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  });

  const entrar = async ({ email, senha }: LoginForm) => {
    setErroApi('');
    try {
      await login(email, senha);
      // Sem navegação manual: o layout troca para a área logada.
    } catch (err) {
      setErroApi(mensagemDeErro(err, 'Erro ao fazer login'));
    }
  };

  // Ignora o evento do botão/teclado: o handleSubmit espera um evento web.
  const enviar = () => void handleSubmit(entrar)();

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView
        style={styles.tela}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.caixa}>
            <Image
              source={require('../../assets/logo.jpg')}
              style={styles.logo}
              accessibilityIgnoresInvertColors
            />
            <Text style={styles.titulo}>Blog Pós FIAP</Text>

            {erroApi ? (
              <Text style={styles.erroApi} accessibilityRole="alert">
                {erroApi}
              </Text>
            ) : null}

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
                  textContentType="emailAddress"
                />
              )}
            />

            <Controller
              control={control}
              name="senha"
              render={({ field: { onChange, onBlur, value } }) => (
                <CampoTexto
                  rotulo="Senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  erro={errors.senha?.message}
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={enviar}
                />
              )}
            />

            <Botao titulo="Entrar" carregando={isSubmitting} onPress={enviar} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.escura },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espacamento.lg,
  },
  caixa: {
    backgroundColor: cores.branco,
    borderRadius: raio.md,
    padding: espacamento.xl,
    gap: espacamento.lg,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: raio.md,
    alignSelf: 'center',
  },
  titulo: {
    fontSize: fonte.grande,
    fontWeight: 'bold',
    color: cores.escura,
    textAlign: 'center',
  },
  erroApi: {
    backgroundColor: '#fdecea',
    color: cores.erro,
    padding: espacamento.md,
    borderRadius: raio.sm,
    fontSize: fonte.normal,
  },
});
