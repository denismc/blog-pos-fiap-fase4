import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useRecarregarAoVoltar } from '@/hooks/useRecarregarAoVoltar';
import type { IUsuario } from '@/interfaces/IUsuario';
import type { Perfil } from '@/interfaces/IUsuarioLogado';
import { podeAlterarUsuario, podeExcluirUsuario } from '@/utils/permissoes';
import { confirmar } from '@/utils/confirmar';
import { mensagemDeErro } from '@/utils/erros';
import { Botao } from '@/components/Botao';
import { Paginacao } from '@/components/Paginacao';
import { Segmentado, type Opcao } from '@/components/Segmentado';
import { cores, espacamento, fonte, raio } from '@/theme';

const ABAS: Opcao<Perfil>[] = [
  { valor: 'Professor', rotulo: 'Professores' },
  { valor: 'Aluno', rotulo: 'Alunos' },
];
const ABA_ADMIN: Opcao<Perfil> = {
  valor: 'Administrador',
  rotulo: 'Admins',
};

/**
 * Gestão de usuários (Professor e Administrador): lista paginada por perfil,
 * com cadastro, edição e exclusão.
 */
export default function AdminUsuarios() {
  const router = useRouter();
  const { usuarioLogado } = useAuth();
  const [perfil, setPerfil] = useState<Perfil>('Professor');
  const [page, setPage] = useState(1);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const {
    resultado,
    carregando,
    trocandoPagina,
    atualizando,
    erro,
    recarregar,
  } = useUsuarios(perfil, page);
  useRecarregarAoVoltar(recarregar);

  // Só o Administrador vê (e gerencia) outros Administradores.
  const abas =
    usuarioLogado?.perfil === 'Administrador' ? [...ABAS, ABA_ADMIN] : ABAS;

  const mudarPerfil = (novo: Perfil) => {
    setPerfil(novo);
    setPage(1);
  };

  const excluir = async (usuario: IUsuario) => {
    const ok = await confirmar(
      'Excluir usuário',
      `Tem certeza que deseja excluir ${usuario.nome}? Essa ação não pode ser desfeita.`
    );
    if (!ok) return;

    setExcluindoId(usuario._id);
    try {
      await api.delete(`/usuarios/${usuario._id}`);
      // Era o último da página: volta uma (a troca de página já recarrega).
      if (resultado && resultado.itens.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await recarregar();
      }
    } catch (err) {
      Alert.alert('Erro', mensagemDeErro(err, 'Erro ao excluir o usuário'));
    } finally {
      setExcluindoId(null);
    }
  };

  const cabecalho = (
    <View style={styles.cabecalho}>
      <Botao
        titulo="+ Novo usuário"
        onPress={() =>
          router.push({ pathname: '/admin/usuarios/novo', params: { perfil } })
        }
      />
      <Segmentado opcoes={abas} valor={perfil} onChange={mudarPerfil} />
      {trocandoPagina ? (
        <ActivityIndicator
          color={cores.secundaria}
          accessibilityLabel="Carregando página"
        />
      ) : null}
    </View>
  );

  const rodape =
    resultado && !erro && resultado.total > 0 ? (
      <View style={styles.rodape}>
        <Paginacao
          page={page}
          totalPages={resultado.totalPages}
          total={resultado.total}
          onMudarPagina={setPage}
          desabilitado={trocandoPagina}
        />
      </View>
    ) : null;

  const renderizarVazio = () => {
    if (carregando) {
      return (
        <ActivityIndicator
          style={styles.aviso}
          size="large"
          color={cores.secundaria}
          accessibilityLabel="Carregando usuários"
        />
      );
    }
    if (erro) {
      return (
        <View style={styles.aviso}>
          <Text style={styles.erro} accessibilityRole="alert">
            {erro}
          </Text>
          <Botao titulo="Tentar novamente" onPress={recarregar} />
        </View>
      );
    }
    return (
      <Text style={[styles.aviso, styles.vazio]}>
        Nenhum usuário com esse perfil.
      </Text>
    );
  };

  const renderizarUsuario = ({ item }: { item: IUsuario }) => {
    const eVoce = item._id === usuarioLogado?.id;
    const excluindo = excluindoId === item._id;
    return (
      <View style={[styles.item, excluindo && styles.excluindo]}>
        <View style={styles.info}>
          <Text style={styles.nome}>
            {item.nome}
            {eVoce ? <Text style={styles.voce}> (você)</Text> : null}
          </Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <View style={styles.acoes}>
          {podeAlterarUsuario(usuarioLogado, item) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Editar ${item.nome}`}
              disabled={excluindo}
              hitSlop={6}
              onPress={() => router.push(`/admin/usuarios/${item._id}`)}
            >
              <Text style={styles.editar}>Editar</Text>
            </Pressable>
          ) : null}
          {podeExcluirUsuario(usuarioLogado, item) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Excluir ${item.nome}`}
              disabled={excluindo}
              hitSlop={6}
              onPress={() => void excluir(item)}
            >
              <Text style={styles.excluir}>
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      // Enquanto a nova página não chega, não mostra a lista antiga.
      data={trocandoPagina ? [] : (resultado?.itens ?? [])}
      keyExtractor={(usuario) => usuario._id}
      renderItem={renderizarUsuario}
      ListHeaderComponent={cabecalho}
      ListEmptyComponent={trocandoPagina ? undefined : renderizarVazio}
      ListFooterComponent={rodape ?? undefined}
      ItemSeparatorComponent={Separador}
      contentContainerStyle={styles.lista}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={recarregar}
          colors={[cores.secundaria]}
          tintColor={cores.secundaria}
        />
      }
    />
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  lista: { padding: espacamento.lg, flexGrow: 1 },
  cabecalho: { gap: espacamento.md, marginBottom: espacamento.lg },
  rodape: { marginTop: espacamento.lg },
  separador: { height: espacamento.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    backgroundColor: cores.branco,
    borderRadius: raio.md,
    padding: espacamento.lg,
  },
  excluindo: { opacity: 0.5 },
  info: { flex: 1, gap: espacamento.xs },
  nome: { fontSize: fonte.media, fontWeight: 'bold', color: cores.escura },
  voce: { fontWeight: 'normal', color: cores.textoSecundario },
  email: { fontSize: fonte.normal, color: cores.textoSecundario },
  acoes: { gap: espacamento.md, alignItems: 'flex-end' },
  editar: {
    fontSize: fonte.normal,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
  excluir: { fontSize: fonte.normal, fontWeight: 'bold', color: cores.erro },
  aviso: { marginTop: espacamento.xl, gap: espacamento.md },
  erro: { fontSize: fonte.media, color: cores.erro, textAlign: 'center' },
  vazio: {
    fontSize: fonte.media,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
});
