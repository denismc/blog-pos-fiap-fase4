import { Alert } from 'react-native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { AxiosError, AxiosHeaders } from 'axios';
import AdminPosts from '@/app/admin/posts';
import api from '@/services/api';
import type { IPost } from '@/interfaces/IPost';
import type { IUsuarioLogado } from '@/interfaces/IUsuarioLogado';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), delete: jest.fn() },
}));

let mockUsuario: IUsuarioLogado;
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ usuarioLogado: mockUsuario }),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: () => ({ push: mockPush }),
}));

const mockGet = api.get as jest.Mock;
const mockDelete = api.delete as jest.Mock;

const professor: IUsuarioLogado = {
  id: 'prof1',
  nome: 'Professor Silva',
  email: 'p@p.com',
  perfil: 'Professor',
};
const admin: IUsuarioLogado = {
  id: 'adm',
  nome: 'Admin',
  email: 'x@x.com',
  perfil: 'Administrador',
};

const criarPost = (id: string, titulo: string, autorId: string): IPost => ({
  _id: id,
  titulo,
  conteudo: `Conteúdo do post ${titulo}.`,
  autor: { _id: autorId, nome: `Autor ${autorId}` },
  createdAt: '2026-03-05T12:00:00',
  updatedAt: '2026-03-05T12:00:00',
});

const posts = [
  criarPost('p1', 'Meu post', 'prof1'),
  criarPost('p2', 'Post de outro', 'prof2'),
];

/** Simula o toque num dos botões da caixa de confirmação. */
const responderConfirmacao = (estilo: 'destructive' | 'cancel') =>
  jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, botoes) => {
    botoes?.find((b) => b.style === estilo)?.onPress?.();
  });

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

describe('Página administrativa de posts', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    mockUsuario = professor;
    mockGet.mockResolvedValue({ data: posts });
  });

  it('deve listar todos os posts, inclusive os de outros autores', async () => {
    await render(<AdminPosts />);

    expect(await screen.findByText('Meu post')).toBeOnTheScreen();
    expect(screen.getByText('Post de outro')).toBeOnTheScreen();
    expect(screen.getByText('2 posts')).toBeOnTheScreen();
  });

  it('Professor só vê editar/excluir nos próprios posts', async () => {
    await render(<AdminPosts />);
    await screen.findByText('Meu post');

    expect(
      screen.getByRole('button', { name: 'Editar Meu post' })
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Excluir Meu post' })
    ).toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Editar Post de outro' })
    ).not.toBeOnTheScreen();
    expect(
      screen.getByText(
        'Somente o autor ou um Administrador pode alterar este post.'
      )
    ).toBeOnTheScreen();
  });

  it('Administrador vê editar/excluir em todos os posts', async () => {
    mockUsuario = admin;
    await render(<AdminPosts />);
    await screen.findByText('Meu post');

    expect(screen.getAllByRole('button', { name: /^Editar / })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /^Excluir / })).toHaveLength(
      2
    );
  });

  it('deve filtrar "Meus posts" e pela busca', async () => {
    await render(<AdminPosts />);
    await screen.findByText('Post de outro');

    await fireEvent.press(screen.getByRole('tab', { name: 'Meus posts' }));
    expect(screen.queryByText('Post de outro')).not.toBeOnTheScreen();
    expect(screen.getByText('1 post')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Todos os posts' }));
    await fireEvent.changeText(screen.getByLabelText('Buscar posts'), 'outro');
    expect(screen.queryByText('Meu post')).not.toBeOnTheScreen();
    expect(screen.getByText('Post de outro')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Buscar posts'), 'xyz');
    expect(screen.getByText('Nenhum post encontrado.')).toBeOnTheScreen();
  });

  it('deve navegar para novo, abrir e editar', async () => {
    await render(<AdminPosts />);
    await screen.findByText('Meu post');

    await fireEvent.press(screen.getByRole('button', { name: '+ Novo post' }));
    await fireEvent.press(
      screen.getByRole('button', { name: 'Abrir Post de outro' })
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Editar Meu post' })
    );

    expect(mockPush.mock.calls).toEqual([
      ['/posts/novo'],
      ['/posts/p2'],
      ['/posts/editar/p1'],
    ]);
  });

  it('deve excluir depois da confirmação e recarregar a lista', async () => {
    responderConfirmacao('destructive');
    mockDelete.mockResolvedValue({ data: {} });
    await render(<AdminPosts />);
    await screen.findByText('Meu post');

    mockGet.mockResolvedValue({ data: [posts[1]] });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir Meu post' })
    );

    await waitFor(() =>
      expect(screen.queryByText('Meu post')).not.toBeOnTheScreen()
    );
    expect(mockDelete).toHaveBeenCalledWith('/posts/p1');
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('não deve excluir quando o usuário cancela', async () => {
    responderConfirmacao('cancel');
    await render(<AdminPosts />);
    await screen.findByText('Meu post');

    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir Meu post' })
    );

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('deve avisar quando a API recusa a exclusão', async () => {
    const alerta = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((titulo, _m, botoes) => {
        if (titulo === 'Excluir post') {
          botoes?.find((b) => b.style === 'destructive')?.onPress?.();
        }
      });
    mockDelete.mockRejectedValue(
      erroDaApi(403, 'Você só pode excluir seus próprios posts')
    );
    await render(<AdminPosts />);
    await screen.findByText('Meu post');

    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir Meu post' })
    );

    await waitFor(() =>
      expect(alerta).toHaveBeenCalledWith(
        'Erro',
        'Você só pode excluir seus próprios posts'
      )
    );
    expect(screen.getByText('Meu post')).toBeOnTheScreen();
  });

  it('deve mostrar erro de carregamento com opção de tentar de novo', async () => {
    mockGet.mockRejectedValueOnce(new Error('falhou'));
    await render(<AdminPosts />);

    expect(
      await screen.findByText('Erro ao carregar os posts')
    ).toBeOnTheScreen();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Tentar novamente' })
    );
    expect(await screen.findByText('Meu post')).toBeOnTheScreen();
  });
});
