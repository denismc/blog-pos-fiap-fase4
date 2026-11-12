import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { AxiosError, AxiosHeaders } from 'axios';
import Login from '@/app/login';

const mockLogin = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

const preencher = async (email: string, senha: string) => {
  await fireEvent.changeText(screen.getByLabelText('Email'), email);
  await fireEvent.changeText(screen.getByLabelText('Senha'), senha);
  await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
};

describe('Tela de login', () => {
  beforeEach(() => mockLogin.mockReset());

  it('deve mostrar erros de validação e não chamar a API', async () => {
    await render(<Login />);

    await preencher('email-invalido', '');

    expect(await screen.findByText('Email inválido')).toBeOnTheScreen();
    expect(screen.getByText('Senha é obrigatória')).toBeOnTheScreen();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('deve chamar login com o email sem espaços', async () => {
    mockLogin.mockResolvedValue(undefined);
    await render(<Login />);

    await preencher('aluno@aluno.com ', 'aluno123');

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith('aluno@aluno.com', 'aluno123')
    );
  });

  it('deve mostrar a mensagem de erro da API', async () => {
    const config = { headers: new AxiosHeaders() };
    mockLogin.mockRejectedValue(
      new AxiosError('401', undefined, config, undefined, {
        status: 401,
        data: { erro: 'Credenciais inválidas' },
        statusText: '',
        headers: {},
        config,
      })
    );
    await render(<Login />);

    await preencher('aluno@aluno.com', 'errada');

    expect(await screen.findByText('Credenciais inválidas')).toBeOnTheScreen();
  });
});
