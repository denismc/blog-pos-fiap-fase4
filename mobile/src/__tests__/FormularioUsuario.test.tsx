import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { AxiosError, AxiosHeaders } from 'axios';
import NovoUsuario from '@/app/admin/usuarios/novo';
import EditarUsuario from '@/app/admin/usuarios/[id]';
import api from '@/services/api';
import type { IUsuario } from '@/interfaces/IUsuario';
import type { IUsuarioLogado } from '@/interfaces/IUsuarioLogado';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

let mockUsuario: IUsuarioLogado;
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ usuarioLogado: mockUsuario }),
}));

let mockParams: Record<string, string> = {};
const mockVoltar = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ back: mockVoltar }),
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockPut = api.put as jest.Mock;

const professor: IUsuarioLogado = {
  id: 'prof1',
  nome: 'Professor Silva',
  email: 'p@p.com',
  perfil: 'Professor',
};

const aluno: IUsuario = {
  _id: 'al1',
  nome: 'Aluno Costa',
  email: 'aluno@escola.com',
  perfil: 'Aluno',
  createdAt: '2026-03-05T12:00:00',
  updatedAt: '2026-03-05T12:00:00',
};

const erroDaApi = (status: number, erro: string) => {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError(String(status), undefined, config, undefined, {
    status,
    data: { erro },
    statusText: '',
    headers: {},
    config,
  });
};

const aba = (nome: string) => screen.queryByRole('tab', { name: nome });

beforeEach(() => {
  jest.clearAllMocks();
  mockUsuario = professor;
  mockParams = {};
});

describe('Novo usuário', () => {
  it('Professor não tem a opção de criar Administrador', async () => {
    await render(<NovoUsuario />);

    expect(aba('Professor')).toBeOnTheScreen();
    expect(aba('Aluno')).toBeOnTheScreen();
    expect(aba('Administrador')).not.toBeOnTheScreen();
  });

  it('Administrador pode escolher qualquer perfil', async () => {
    mockUsuario = { ...professor, perfil: 'Administrador' };
    await render(<NovoUsuario />);

    expect(aba('Administrador')).toBeOnTheScreen();
  });

  it('deve validar sem chamar a API', async () => {
    await render(<NovoUsuario />);

    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(
      await screen.findByText('Nome deve ter pelo menos 2 caracteres')
    ).toBeOnTheScreen();
    expect(screen.getByText('Email inválido')).toBeOnTheScreen();
    expect(
      screen.getByText('Senha deve ter pelo menos 6 caracteres')
    ).toBeOnTheScreen();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('deve cadastrar com o perfil da aba de origem e voltar', async () => {
    mockParams = { perfil: 'Professor' };
    mockPost.mockResolvedValue({ data: {} });
    await render(<NovoUsuario />);

    expect(aba('Professor')).toBeSelected();
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Nova Pessoa');
    await fireEvent.changeText(
      screen.getByLabelText('Email'),
      'nova@escola.com'
    );
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => expect(mockVoltar).toHaveBeenCalled());
    expect(mockPost).toHaveBeenCalledWith('/usuarios', {
      nome: 'Nova Pessoa',
      email: 'nova@escola.com',
      senha: 'segredo1',
      perfil: 'Professor',
    });
  });

  it('deve mostrar o erro da API (ex.: email repetido)', async () => {
    mockPost.mockRejectedValue(erroDaApi(400, 'Email já cadastrado'));
    await render(<NovoUsuario />);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Nova Pessoa');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'x@escola.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(await screen.findByText('Email já cadastrado')).toBeOnTheScreen();
    expect(mockVoltar).not.toHaveBeenCalled();
  });
});

describe('Editar usuário', () => {
  beforeEach(() => {
    mockParams = { id: 'al1' };
  });

  it('deve vir preenchido e não enviar a senha em branco', async () => {
    mockGet.mockResolvedValue({ data: aluno });
    mockPut.mockResolvedValue({ data: aluno });
    await render(<EditarUsuario />);

    expect(await screen.findByDisplayValue('Aluno Costa')).toBeOnTheScreen();
    expect(aba('Aluno')).toBeSelected();

    await fireEvent.press(screen.getByRole('tab', { name: 'Professor' }));
    await fireEvent.press(
      screen.getByRole('button', { name: 'Salvar alterações' })
    );

    await waitFor(() => expect(mockVoltar).toHaveBeenCalled());
    expect(mockGet).toHaveBeenCalledWith('/usuarios/al1');
    expect(mockPut).toHaveBeenCalledWith('/usuarios/al1', {
      nome: 'Aluno Costa',
      email: 'aluno@escola.com',
      perfil: 'Professor',
    });
  });

  it('deve enviar a nova senha quando preenchida', async () => {
    mockGet.mockResolvedValue({ data: aluno });
    mockPut.mockResolvedValue({ data: aluno });
    await render(<EditarUsuario />);
    await screen.findByDisplayValue('Aluno Costa');

    await fireEvent.changeText(
      screen.getByLabelText('Nova senha (opcional)'),
      'novaSenha'
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Salvar alterações' })
    );

    await waitFor(() =>
      expect(mockPut).toHaveBeenCalledWith(
        '/usuarios/al1',
        expect.objectContaining({ senha: 'novaSenha' })
      )
    );
  });

  it('deve bloquear o perfil quando o usuário edita a si mesmo', async () => {
    mockParams = { id: 'prof1' };
    mockGet.mockResolvedValue({
      data: {
        ...aluno,
        _id: 'prof1',
        nome: 'Professor Silva',
        perfil: 'Professor',
      },
    });
    await render(<EditarUsuario />);

    expect(
      await screen.findByText('Você não pode alterar o seu próprio perfil.')
    ).toBeOnTheScreen();
    expect(aba('Aluno')).toBeDisabled();
  });

  it('Professor não pode editar um Administrador', async () => {
    mockGet.mockResolvedValue({ data: { ...aluno, perfil: 'Administrador' } });
    await render(<EditarUsuario />);

    expect(
      await screen.findByText(
        'Professores não podem gerenciar Administradores.'
      )
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText('Nome')).not.toBeOnTheScreen();
  });

  it('deve mostrar erro quando o usuário não existe', async () => {
    mockGet.mockRejectedValue(erroDaApi(404, 'Usuário não encontrado'));
    await render(<EditarUsuario />);

    expect(await screen.findByText('Usuário não encontrado')).toBeOnTheScreen();
  });
});
