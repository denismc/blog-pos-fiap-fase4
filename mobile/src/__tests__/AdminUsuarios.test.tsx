import { Alert } from 'react-native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import AdminUsuarios from '@/app/admin/usuarios';
import api from '@/services/api';
import type { IPaginado, IUsuario } from '@/interfaces/IUsuario';
import type { IUsuarioLogado, Perfil } from '@/interfaces/IUsuarioLogado';

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

const usuario = (id: string, nome: string, perfil: Perfil): IUsuario => ({
  _id: id,
  nome,
  email: `${id}@escola.com`,
  perfil,
  createdAt: '2026-03-05T12:00:00',
  updatedAt: '2026-03-05T12:00:00',
});

const pagina = (
  itens: IUsuario[],
  page = 1,
  totalPages = 1,
  total = itens.length
): IPaginado<IUsuario> => ({ itens, total, page, totalPages });

/** Responde GET /usuarios conforme o perfil e a página pedidos. */
const responder = (paginas: Partial<Record<Perfil, IPaginado<IUsuario>[]>>) => {
  mockGet.mockImplementation(
    async (
      _url: string,
      { params }: { params: { perfil: Perfil; page: number } }
    ) => ({
      data: paginas[params.perfil]?.[params.page - 1] ?? pagina([]),
    })
  );
};

const professores = [
  usuario('prof1', 'Professor Silva', 'Professor'),
  usuario('prof2', 'Professora Lima', 'Professor'),
];

describe('Gestão de usuários', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    mockUsuario = professor;
  });

  it('deve listar professores da primeira página, com limite de 10', async () => {
    responder({ Professor: [pagina(professores)] });
    await render(<AdminUsuarios />);

    expect(await screen.findByText('Professora Lima')).toBeOnTheScreen();
    expect(screen.getByText('prof2@escola.com')).toBeOnTheScreen();
    expect(screen.getByText('2 usuários')).toBeOnTheScreen();
    expect(mockGet).toHaveBeenCalledWith('/usuarios', {
      params: { perfil: 'Professor', page: 1, limit: 10 },
    });
  });

  it('deve trocar para a aba de alunos voltando para a página 1', async () => {
    responder({
      Professor: [pagina(professores, 1, 2, 12), pagina([], 2, 2, 12)],
      Aluno: [pagina([usuario('al1', 'Aluno Costa', 'Aluno')])],
    });
    await render(<AdminUsuarios />);
    await screen.findByText('Professora Lima');

    await fireEvent.press(screen.getByRole('button', { name: 'Próxima' }));
    await waitFor(() =>
      expect(mockGet).toHaveBeenLastCalledWith('/usuarios', {
        params: { perfil: 'Professor', page: 2, limit: 10 },
      })
    );

    await fireEvent.press(screen.getByRole('tab', { name: 'Alunos' }));

    expect(await screen.findByText('Aluno Costa')).toBeOnTheScreen();
    expect(mockGet).toHaveBeenLastCalledWith('/usuarios', {
      params: { perfil: 'Aluno', page: 1, limit: 10 },
    });
  });

  it('deve paginar com Anterior e Próxima', async () => {
    responder({
      Professor: [
        pagina(professores, 1, 2, 3),
        pagina([usuario('prof3', 'Professor Rocha', 'Professor')], 2, 2, 3),
      ],
    });
    await render(<AdminUsuarios />);
    await screen.findByText('Página 1 de 2');

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Próxima' }));

    expect(await screen.findByText('Professor Rocha')).toBeOnTheScreen();
    expect(screen.getByText('Página 2 de 2')).toBeOnTheScreen();
    expect(screen.queryByText('Professora Lima')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
  });

  it('só mostra a aba de Administradores para o Administrador', async () => {
    responder({ Professor: [pagina(professores)] });
    await render(<AdminUsuarios />);
    await screen.findByText('Professora Lima');
    expect(screen.queryByRole('tab', { name: 'Admins' })).not.toBeOnTheScreen();

    mockUsuario = { ...professor, id: 'adm', perfil: 'Administrador' };
    await render(<AdminUsuarios />);
    expect(
      await screen.findByRole('tab', { name: 'Admins' })
    ).toBeOnTheScreen();
  });

  it('não deixa excluir a própria conta, mas deixa editar', async () => {
    responder({ Professor: [pagina(professores)] });
    await render(<AdminUsuarios />);
    await screen.findByText('Professora Lima');

    expect(screen.getByText(' (você)')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Editar Professor Silva' })
    ).toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Excluir Professor Silva' })
    ).not.toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Excluir Professora Lima' })
    ).toBeOnTheScreen();
  });

  it('deve abrir o cadastro com o perfil da aba e a edição do usuário', async () => {
    responder({ Professor: [pagina(professores)] });
    await render(<AdminUsuarios />);
    await screen.findByText('Professora Lima');

    await fireEvent.press(
      screen.getByRole('button', { name: '+ Novo usuário' })
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Editar Professora Lima' })
    );

    expect(mockPush.mock.calls).toEqual([
      [{ pathname: '/admin/usuarios/novo', params: { perfil: 'Professor' } }],
      ['/admin/usuarios/prof2'],
    ]);
  });

  it('deve excluir após confirmar e voltar uma página se ela ficar vazia', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, botoes) => {
      botoes?.find((b) => b.style === 'destructive')?.onPress?.();
    });
    mockDelete.mockResolvedValue({ data: {} });
    responder({
      Professor: [
        pagina(professores, 1, 2, 3),
        pagina([usuario('prof3', 'Professor Rocha', 'Professor')], 2, 2, 3),
      ],
    });
    await render(<AdminUsuarios />);
    await screen.findByText('Página 1 de 2');
    await fireEvent.press(screen.getByRole('button', { name: 'Próxima' }));
    await screen.findByText('Professor Rocha');

    responder({ Professor: [pagina(professores, 1, 1, 2)] });
    await fireEvent.press(
      screen.getByRole('button', { name: 'Excluir Professor Rocha' })
    );

    expect(await screen.findByText('Professora Lima')).toBeOnTheScreen();
    expect(mockDelete).toHaveBeenCalledWith('/usuarios/prof3');
    expect(mockGet).toHaveBeenLastCalledWith('/usuarios', {
      params: { perfil: 'Professor', page: 1, limit: 10 },
    });
  });

  it('deve avisar quando não há usuários no perfil', async () => {
    responder({});
    await render(<AdminUsuarios />);

    expect(
      await screen.findByText('Nenhum usuário com esse perfil.')
    ).toBeOnTheScreen();
  });
});
