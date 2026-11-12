import { Alert } from 'react-native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { AxiosError, AxiosHeaders } from 'axios';
import DetalhePost from '@/app/posts/[id]';
import api from '@/services/api';
import type { IPost } from '@/interfaces/IPost';
import type { IComentario } from '@/interfaces/IComentario';
import type { IUsuarioLogado } from '@/interfaces/IUsuarioLogado';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

let mockUsuario: IUsuarioLogado;
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ usuarioLogado: mockUsuario }),
}));

const mockVoltar = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useFocusEffect: jest.fn(),
  useLocalSearchParams: () => ({ id: 'p1' }),
  useRouter: () => ({ back: mockVoltar, push: mockPush }),
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockDelete = api.delete as jest.Mock;

const post: IPost = {
  _id: 'p1',
  titulo: 'Introdução ao Node.js',
  conteudo: 'Node.js é um runtime JavaScript construído sobre o V8.',
  autor: { _id: 'prof1', nome: 'Professor Silva' },
  createdAt: '2026-03-05T12:00:00',
  updatedAt: '2026-03-07T12:00:00',
};

const comentario = (
  id: string,
  autorId: string,
  conteudo: string
): IComentario => ({
  _id: id,
  conteudo,
  autor: { _id: autorId, nome: `Usuário ${autorId}` },
  post: 'p1',
  createdAt: '2026-03-06T14:30:00',
  updatedAt: '2026-03-06T14:30:00',
});

/** Responde GET /posts/p1 e GET /comentarios conforme os dados dados. */
const responderGet = (comentarios: IComentario[]) => {
  mockGet.mockImplementation(async (url: string) =>
    url === '/comentarios' ? { data: comentarios } : { data: post }
  );
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

describe('Detalhe do post', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsuario = {
      id: 'aluno1',
      nome: 'Aluno',
      email: 'a@a.com',
      perfil: 'Aluno',
    };
  });

  it('deve mostrar o post completo e os comentários', async () => {
    responderGet([comentario('c1', 'aluno1', 'Ótimo post!')]);
    await render(<DetalhePost />);

    expect(
      await screen.findByText(
        'Node.js é um runtime JavaScript construído sobre o V8.'
      )
    ).toBeOnTheScreen();
    expect(screen.getByText('Por Professor Silva')).toBeOnTheScreen();
    expect(
      screen.getByText('Publicado em 05/03/2026 · Atualizado em 07/03/2026')
    ).toBeOnTheScreen();
    expect(await screen.findByText('Ótimo post!')).toBeOnTheScreen();
    expect(screen.getByText('06/03/2026 às 14:30')).toBeOnTheScreen();
    expect(screen.getByText('Comentários (1)')).toBeOnTheScreen();
    expect(mockGet).toHaveBeenCalledWith('/posts/p1');
    expect(mockGet).toHaveBeenCalledWith('/comentarios', {
      params: { post: 'p1' },
    });
  });

  it('deve mostrar erro e permitir voltar quando o post não existe', async () => {
    mockGet.mockRejectedValue(erroDaApi(404, 'Post não encontrado'));
    await render(<DetalhePost />);

    expect(await screen.findByText('Post não encontrado')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockVoltar).toHaveBeenCalled();
  });

  it('deve avisar quando não há comentários', async () => {
    responderGet([]);
    await render(<DetalhePost />);

    expect(
      await screen.findByText('Nenhum comentário ainda.')
    ).toBeOnTheScreen();
  });

  it('deve validar o comentário vazio sem chamar a API', async () => {
    responderGet([]);
    await render(<DetalhePost />);
    await screen.findByText('Nenhum comentário ainda.');

    await fireEvent.changeText(screen.getByLabelText('Seu comentário'), '   ');
    await fireEvent.press(screen.getByRole('button', { name: 'Comentar' }));

    expect(
      await screen.findByText('Comentário não pode ser vazio')
    ).toBeOnTheScreen();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('deve enviar o comentário e recarregar a lista', async () => {
    responderGet([]);
    mockPost.mockResolvedValue({ data: {} });
    await render(<DetalhePost />);
    await screen.findByText('Nenhum comentário ainda.');

    responderGet([comentario('c1', 'aluno1', 'Muito bom')]);
    await fireEvent.changeText(
      screen.getByLabelText('Seu comentário'),
      ' Muito bom '
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Comentar' }));

    expect(await screen.findByText('Muito bom')).toBeOnTheScreen();
    expect(mockPost).toHaveBeenCalledWith('/comentarios', {
      conteudo: 'Muito bom',
      post: 'p1',
    });
    expect(screen.getByLabelText('Seu comentário')).toHaveDisplayValue('');
  });

  it('deve mostrar o erro da API ao comentar', async () => {
    responderGet([]);
    mockPost.mockRejectedValue(erroDaApi(400, 'Comentário inválido'));
    await render(<DetalhePost />);
    await screen.findByText('Nenhum comentário ainda.');

    await fireEvent.changeText(screen.getByLabelText('Seu comentário'), 'Oi');
    await fireEvent.press(screen.getByRole('button', { name: 'Comentar' }));

    expect(await screen.findByText('Comentário inválido')).toBeOnTheScreen();
  });

  it('deve mostrar "Excluir" só nos comentários do próprio usuário', async () => {
    responderGet([
      comentario('c1', 'aluno1', 'Meu comentário'),
      comentario('c2', 'outro', 'Comentário de outro'),
    ]);
    await render(<DetalhePost />);
    await screen.findByText('Comentário de outro');

    expect(
      screen.getAllByRole('button', { name: 'Excluir comentário' })
    ).toHaveLength(1);
  });

  it('deve permitir ao Administrador excluir qualquer comentário', async () => {
    mockUsuario = {
      id: 'adm',
      nome: 'Admin',
      email: 'x@x.com',
      perfil: 'Administrador',
    };
    responderGet([
      comentario('c1', 'aluno1', 'Um'),
      comentario('c2', 'outro', 'Dois'),
    ]);
    await render(<DetalhePost />);
    await screen.findByText('Dois');

    expect(
      screen.getAllByRole('button', { name: 'Excluir comentário' })
    ).toHaveLength(2);
  });

  it('deve excluir o comentário depois da confirmação', async () => {
    // Simula o toque no botão "Excluir" da caixa de confirmação.
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, botoes) => {
      botoes?.find((b) => b.style === 'destructive')?.onPress?.();
    });
    responderGet([comentario('c1', 'aluno1', 'Apagar este')]);
    mockDelete.mockResolvedValue({ data: {} });
    await render(<DetalhePost />);
    await screen.findByText('Apagar este');

    responderGet([]);
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir comentário' })
    );

    await waitFor(() =>
      expect(screen.getByText('Nenhum comentário ainda.')).toBeOnTheScreen()
    );
    expect(mockDelete).toHaveBeenCalledWith('/comentarios/c1');
  });

  it('não deve excluir quando o usuário cancela', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, botoes) => {
      botoes?.find((b) => b.style === 'cancel')?.onPress?.();
    });
    responderGet([comentario('c1', 'aluno1', 'Fica')]);
    await render(<DetalhePost />);
    await screen.findByText('Fica');

    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir comentário' })
    );

    expect(mockDelete).not.toHaveBeenCalled();
    expect(screen.getByText('Fica')).toBeOnTheScreen();
  });

  describe('botão de editar', () => {
    const casos: [string, IUsuarioLogado, boolean][] = [
      [
        'Aluno',
        { id: 'aluno1', nome: 'A', email: 'a@a.com', perfil: 'Aluno' },
        false,
      ],
      [
        'Professor autor',
        { id: 'prof1', nome: 'P', email: 'p@p.com', perfil: 'Professor' },
        true,
      ],
      [
        'outro Professor',
        { id: 'prof2', nome: 'Q', email: 'q@q.com', perfil: 'Professor' },
        false,
      ],
      [
        'Administrador',
        { id: 'adm', nome: 'X', email: 'x@x.com', perfil: 'Administrador' },
        true,
      ],
    ];

    it.each(casos)('%s: aparece = %s', async (_nome, usuario, aparece) => {
      mockUsuario = usuario;
      responderGet([]);
      await render(<DetalhePost />);
      await screen.findByText('Nenhum comentário ainda.');

      const botao = screen.queryByRole('button', { name: 'Editar post' });
      if (aparece) {
        await fireEvent.press(botao!);
        expect(mockPush).toHaveBeenCalledWith('/posts/editar/p1');
      } else {
        expect(botao).not.toBeOnTheScreen();
      }
    });
  });
});
