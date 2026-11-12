import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import ListaPosts from '@/app/index';
import api from '@/services/api';
import type { IPost } from '@/interfaces/IPost';
import type { Perfil } from '@/interfaces/IUsuarioLogado';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

let mockPerfil: Perfil = 'Aluno';
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    usuarioLogado: {
      id: 'u1',
      nome: 'Fulano',
      email: 'a@a.com',
      perfil: mockPerfil,
    },
    logout: jest.fn(),
  }),
}));

// O Stack.Screen só funciona dentro de um navegador; aqui ele não importa.
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useFocusEffect: jest.fn(),
  useRouter: () => ({ push: mockPush }),
}));

const mockGet = api.get as jest.Mock;

const posts: IPost[] = [
  {
    _id: '1',
    titulo: 'Introdução ao Node.js',
    conteudo: 'Node.js é um runtime JavaScript.',
    autor: { _id: 'a1', nome: 'Professor Silva' },
    createdAt: '2026-03-05T12:00:00.000Z',
    updatedAt: '2026-03-05T12:00:00.000Z',
  },
  {
    _id: '2',
    titulo: 'React Native',
    conteudo: 'Apps móveis com Expo.',
    autor: null,
    createdAt: '2026-03-06T12:00:00.000Z',
    updatedAt: '2026-03-06T12:00:00.000Z',
  },
];

describe('Lista de posts', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPush.mockReset();
    mockPerfil = 'Aluno';
  });

  it('não deve mostrar "Novo post" para o Aluno', async () => {
    mockGet.mockResolvedValue({ data: posts });
    await render(<ListaPosts />);
    await screen.findByText('React Native');

    expect(
      screen.queryByRole('button', { name: '+ Novo post' })
    ).not.toBeOnTheScreen();
  });

  it('deve abrir o formulário de novo post para o Professor', async () => {
    mockPerfil = 'Professor';
    mockGet.mockResolvedValue({ data: posts });
    await render(<ListaPosts />);

    await fireEvent.press(
      await screen.findByRole('button', { name: '+ Novo post' })
    );

    expect(mockPush).toHaveBeenCalledWith('/posts/novo');
  });

  it('deve listar título, descrição, autor e data', async () => {
    mockGet.mockResolvedValue({ data: posts });
    await render(<ListaPosts />);

    expect(await screen.findByText('Introdução ao Node.js')).toBeOnTheScreen();
    expect(
      screen.getByText('Node.js é um runtime JavaScript.')
    ).toBeOnTheScreen();
    expect(screen.getByText('Professor Silva')).toBeOnTheScreen();
    expect(screen.getByText('05/03/2026')).toBeOnTheScreen();
    expect(screen.getByText('Autor desconhecido')).toBeOnTheScreen();
    expect(mockGet).toHaveBeenCalledWith('/posts');
  });

  it('deve abrir o detalhe ao tocar no post', async () => {
    mockGet.mockResolvedValue({ data: posts });
    await render(<ListaPosts />);

    await fireEvent.press(
      await screen.findByRole('button', {
        name: 'React Native, por Autor desconhecido',
      })
    );

    expect(mockPush).toHaveBeenCalledWith('/posts/2');
  });

  it('deve filtrar pela busca e limpar o filtro', async () => {
    mockGet.mockResolvedValue({ data: posts });
    await render(<ListaPosts />);
    await screen.findByText('React Native');

    await fireEvent.changeText(screen.getByLabelText('Buscar posts'), 'node');

    expect(screen.getByText('Introdução ao Node.js')).toBeOnTheScreen();
    expect(screen.queryByText('React Native')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Limpar busca' }));

    expect(screen.getByText('React Native')).toBeOnTheScreen();
  });

  it('deve avisar quando a busca não encontra nada', async () => {
    mockGet.mockResolvedValue({ data: posts });
    await render(<ListaPosts />);
    await screen.findByText('React Native');

    await fireEvent.changeText(screen.getByLabelText('Buscar posts'), 'python');

    expect(
      screen.getByText('Nenhum post encontrado para essa busca.')
    ).toBeOnTheScreen();
  });

  it('deve avisar quando não há posts', async () => {
    mockGet.mockResolvedValue({ data: [] });
    await render(<ListaPosts />);

    expect(
      await screen.findByText('Nenhum post publicado ainda.')
    ).toBeOnTheScreen();
  });

  it('deve mostrar o erro e recarregar ao tentar novamente', async () => {
    mockGet
      .mockRejectedValueOnce(new Error('falhou'))
      .mockResolvedValueOnce({ data: posts });
    await render(<ListaPosts />);

    expect(
      await screen.findByText('Erro ao carregar os posts')
    ).toBeOnTheScreen();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Tentar novamente' })
    );

    await waitFor(() =>
      expect(screen.getByText('Introdução ao Node.js')).toBeOnTheScreen()
    );
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
