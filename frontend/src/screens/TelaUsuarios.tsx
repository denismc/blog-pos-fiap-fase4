import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import TabelaUsuarios from '../components/TabelaUsuarios';
import Paginacao from '../components/Paginacao';
import type { IPaginado } from '../interfaces/IPaginado';
import Modal from '../components/Modal';
import FormUsuario from '../components/FormUsuario';
import type { CriarUsuarioForm, AtualizarUsuarioForm } from '../schemas/usuarioSchema';
import type { IUsuario } from '../interfaces/IUsuario';
import type { IAxiosError } from '../interfaces/IAxiosError';
import { useAuth } from '../contexts/AuthContext';

const LIMITE_POR_PAGINA = 10;
type FiltroPerfil = '' | IUsuario['perfil'];

function TelaUsuarios() {
  const { usuarioLogado } = useAuth();
  const [resultado, setResultado] = useState<IPaginado<IUsuario>>({ itens: [], total: 0, page: 1, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [perfil, setPerfil] = useState<FiltroPerfil>('');
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<IUsuario | null>(null);

  const isAdmin = usuarioLogado?.perfil === 'Administrador';

  const carregarUsuarios = useCallback(async () => {
    const res = await api.get<IPaginado<IUsuario>>('/usuarios', {
      params: { page, limit: LIMITE_POR_PAGINA, perfil: perfil || undefined },
    });

    // Se a página atual ficou vazia (ex.: excluiu o último item dela), volta uma página.
    if (res.data.itens.length === 0 && page > 1) {
      setPage(page - 1);
      return;
    }
    setResultado(res.data);
  }, [page, perfil]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const mudarFiltroPerfil = (novoPerfil: FiltroPerfil) => {
    setPerfil(novoPerfil);
    setPage(1);
  };

  const abrirModalNovo = () => {
    setUsuarioEditando(null);
    setModalAberto(true);
  };

  const abrirModalEditar = async (id: string) => {
    const res = await api.get<IUsuario>(`/usuarios/${id}`);
    setUsuarioEditando(res.data);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setUsuarioEditando(null);
  };

  const salvarUsuario = async (dados: CriarUsuarioForm | AtualizarUsuarioForm) => {
    try {
      const payload = { ...dados };
      if (!payload.senha) delete payload.senha;

      if (usuarioEditando) {
        await api.put(`/usuarios/${usuarioEditando._id}`, payload);
      } else {
        await api.post('/usuarios', payload);
      }
      fecharModal();
      carregarUsuarios();
    } catch (err) {
      const mensagem = (err as IAxiosError).response?.data?.erro ?? 'Erro ao salvar usuário';
      alert(mensagem);
    }
  };

  const excluirUsuario = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      carregarUsuarios();
    } catch (err) {
      const mensagem = (err as IAxiosError).response?.data?.erro ?? 'Erro ao excluir usuário';
      alert(mensagem);
    }
  };

  return (
    <div>
      <div className="tela-toolbar">
        <label className="filtro-perfil">
          Perfil
          <select value={perfil} onChange={(e) => mudarFiltroPerfil(e.target.value as FiltroPerfil)}>
            <option value="">Todos</option>
            <option value="Administrador">Administrador</option>
            <option value="Professor">Professor</option>
            <option value="Aluno">Aluno</option>
          </select>
        </label>
        {isAdmin && (
          <button className="btn-novo" onClick={abrirModalNovo}>
            + Novo Usuário
          </button>
        )}
      </div>

      <TabelaUsuarios usuarios={resultado.itens} onEditar={abrirModalEditar} onExcluir={excluirUsuario} />

      <Paginacao page={resultado.page} totalPages={resultado.totalPages} total={resultado.total} onMudarPagina={setPage} />

      {modalAberto && (
        <Modal titulo={usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'} onFechar={fecharModal}>
          <FormUsuario usuarioInicial={usuarioEditando} onSalvar={salvarUsuario} onCancelar={fecharModal} />
        </Modal>
      )}
    </div>
  );
}

export default TelaUsuarios;
