import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { AxiosError, AxiosHeaders } from 'axios';
import NovoPost from '@/app/posts/novo';
import EditarPost from '@/app/posts/editar/[id]';
import api from '@/services/api';
import type { IPost } from '@/interfaces/IPost';
import type { IUsuarioLogado } from '@/interfaces/IUsuarioLogado';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

let mockUsuario: IUsuarioLogado;
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ usuarioLogado: mockUsuario }),
}));

const mockRouter = { back: jest.fn(), replace: jest.fn() };
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'p1' }),
  useRouter: () => mockRouter,
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

const post: IPost = {
  _id: 'p1',
  titulo: 'Título original',
  conteudo: 'Conteúdo original do post.',
  autor: { _id: 'prof1', nome: 'Professor Silva' },
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

const preencher = async (titulo: string, conteudo: string) => {
  await fireEvent.changeText(screen.getByLabelText('Título'), titulo);
  await fireEvent.changeText(screen.getByLabelText('Conteúdo'), conteudo);
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUsuario = professor;
});

describe('Novo post', () => {
  it('deve validar os campos sem chamar a API', async () => {
    await render(<NovoPost />);

    await preencher('ab', 'curto');
    await fireEvent.press(screen.getByRole('button', { name: 'Publicar' }));

    expect(
      await screen.findByText('Título deve ter pelo menos 3 caracteres')
    ).toBeOnTheScreen();
    expect(
      screen.getByText('Conteúdo deve ter pelo menos 10 caracteres')
    ).toBeOnTheScreen();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('deve criar o post e abrir o detalhe dele', async () => {
    mockPost.mockResolvedValue({ data: { ...post, _id: 'novo1' } });
    await render(<NovoPost />);

    await preencher(' Meu post ', 'Um conteúdo com tamanho suficiente.');
    await fireEvent.press(screen.getByRole('button', { name: 'Publicar' }));

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith('/posts/novo1')
    );
    expect(mockPost).toHaveBeenCalledWith('/posts', {
      titulo: 'Meu post',
      conteudo: 'Um conteúdo com tamanho suficiente.',
    });
  });

  it('deve mostrar o erro da API', async () => {
    mockPost.mockRejectedValue(erroDaApi(403, 'Acesso negado'));
    await render(<NovoPost />);

    await preencher('Meu post', 'Um conteúdo com tamanho suficiente.');
    await fireEvent.press(screen.getByRole('button', { name: 'Publicar' }));

    expect(await screen.findByText('Acesso negado')).toBeOnTheScreen();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});

describe('Editar post', () => {
  it('deve vir preenchido e salvar as alterações', async () => {
    mockGet.mockResolvedValue({ data: post });
    mockPut.mockResolvedValue({ data: post });
    await render(<EditarPost />);

    expect(
      await screen.findByDisplayValue('Título original')
    ).toBeOnTheScreen();
    expect(
      screen.getByDisplayValue('Conteúdo original do post.')
    ).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Título'), 'Título novo');
    await fireEvent.press(
      screen.getByRole('button', { name: 'Salvar alterações' })
    );

    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled());
    expect(mockGet).toHaveBeenCalledWith('/posts/p1');
    expect(mockPut).toHaveBeenCalledWith('/posts/p1', {
      titulo: 'Título novo',
      conteudo: 'Conteúdo original do post.',
    });
  });

  it('deve permitir ao Administrador editar post de outro autor', async () => {
    mockUsuario = {
      id: 'adm',
      nome: 'Admin',
      email: 'x@x.com',
      perfil: 'Administrador',
    };
    mockGet.mockResolvedValue({ data: post });
    await render(<EditarPost />);

    expect(
      await screen.findByDisplayValue('Título original')
    ).toBeOnTheScreen();
  });

  it('deve bloquear Professor que não é o autor', async () => {
    mockUsuario = { ...professor, id: 'prof2' };
    mockGet.mockResolvedValue({ data: post });
    await render(<EditarPost />);

    expect(
      await screen.findByText('Você só pode alterar seus próprios posts.')
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText('Título')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('deve mostrar erro quando o post não existe', async () => {
    mockGet.mockRejectedValue(erroDaApi(404, 'Post não encontrado'));
    await render(<EditarPost />);

    expect(await screen.findByText('Post não encontrado')).toBeOnTheScreen();
  });
});
