import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRequisicao } from '@/hooks/useRequisicao';
import type { IUsuario } from '@/interfaces/IUsuario';
import type { UsuarioForm } from '@/schemas/usuarioSchema';
import { perfisAtribuiveis, podeAlterarUsuario } from '@/utils/permissoes';
import { Botao } from '@/components/Botao';
import { FormUsuario } from '@/components/FormUsuario';
import { cores, espacamento, fonte } from '@/theme';

/** Edição de usuário, com as mesmas restrições que a API aplica. */
export default function EditarUsuario() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { usuarioLogado } = useAuth();

  const buscar = useCallback(
    async () => (await api.get<IUsuario>(`/usuarios/${id}`)).data,
    [id]
  );
  const {
    dados: usuario,
    carregando,
    erro,
    recarregar,
  } = useRequisicao(buscar, 'Erro ao carregar o usuário');

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={cores.secundaria}
          accessibilityLabel="Carregando usuário"
        />
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro} accessibilityRole="alert">
          {erro || 'Usuário não encontrado'}
        </Text>
        <Botao titulo="Tentar novamente" onPress={recarregar} />
      </View>
    );
  }

  if (!podeAlterarUsuario(usuarioLogado, usuario)) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro} accessibilityRole="alert">
          Professores não podem gerenciar Administradores.
        </Text>
        <Botao
          titulo="Voltar"
          variante="secundaria"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const salvar = async ({ senha, ...dados }: UsuarioForm) => {
    // Senha em branco não é enviada: a API mantém a atual.
    await api.put(
      `/usuarios/${usuario._id}`,
      senha ? { ...dados, senha } : dados
    );
    router.back();
  };

  return (
    <FormUsuario
      modo="editar"
      perfis={perfisAtribuiveis(usuarioLogado?.perfil)}
      perfilBloqueado={usuario._id === usuarioLogado?.id}
      valoresIniciais={{
        nome: usuario.nome,
        email: usuario.email,
        senha: '',
        perfil: usuario.perfil,
      }}
      onSalvar={salvar}
    />
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamento.xl,
    gap: espacamento.md,
  },
  erro: { fontSize: fonte.media, color: cores.erro, textAlign: 'center' },
});
