import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Perfil } from '@/interfaces/IUsuarioLogado';
import type { UsuarioForm } from '@/schemas/usuarioSchema';
import { perfisAtribuiveis } from '@/utils/permissoes';
import { FormUsuario } from '@/components/FormUsuario';

/** Cadastro de usuário. O perfil já vem marcado com a aba de onde veio. */
export default function NovoUsuario() {
  const router = useRouter();
  const { usuarioLogado } = useAuth();
  const { perfil } = useLocalSearchParams<{ perfil?: Perfil }>();
  const perfis = perfisAtribuiveis(usuarioLogado?.perfil);
  const perfilInicial = perfil && perfis.includes(perfil) ? perfil : 'Aluno';

  const criar = async (dados: UsuarioForm) => {
    await api.post('/usuarios', dados);
    // A lista recarrega sozinha ao voltar a ficar visível.
    router.back();
  };

  return (
    <FormUsuario
      modo="criar"
      perfis={perfis}
      valoresIniciais={{
        nome: '',
        email: '',
        senha: '',
        perfil: perfilInicial,
      }}
      onSalvar={criar}
    />
  );
}
