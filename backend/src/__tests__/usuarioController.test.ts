import { UsuarioController } from '../controllers/usuarioController.js';
import { IUsuarioRepository } from '../repositories/IUsuarioRepository.js';
import { Request, Response } from 'express';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockRepository: jest.Mocked<IUsuarioRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const usuarioBase = {
  email: 'usuario@email.com',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};
const admin = { ...usuarioBase, _id: '10', nome: 'Admin', perfil: 'Administrador' as const };
const professor = { ...usuarioBase, _id: '20', nome: 'Professor B', perfil: 'Professor' as const };
const aluno = { ...usuarioBase, _id: '30', nome: 'Aluno', perfil: 'Aluno' as const };
const professorLogado = { id: '21', perfil: 'Professor' };
const ERRO_ADMIN = { erro: 'Professores não podem gerenciar Administradores' };

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];
  return res;
};

describe('UsuarioController', () => {
  let controller: UsuarioController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsuarioController(mockRepository);
  });

describe('criarUsuario', () => {
    it('deve criar usuário e retornar 201', async () => {
    const usuarioCriado = {
        _id: '1',
        nome: 'João',
        email: 'joao@email.com',
        perfil: 'Aluno' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
    };
    mockRepository.create.mockResolvedValue(usuarioCriado);

    const req = {
        body: {
        nome: 'João',
        email: 'joao@email.com',
        senha: 'senha123',
        perfil: 'Aluno',
        },
    } as unknown as Request;
    const res = mockResponse();

    await controller.criarUsuario(req, res);

    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar 400 quando ocorrer erro', async () => {
      mockRepository.create.mockRejectedValue(new Error('Email duplicado'));

      const req = {
        body: {
          nome: 'João',
          email: 'joao@email.com',
          senha: 'senha123',
          perfil: 'Aluno',
        },
      } as unknown as Request;
      const res = mockResponse();

      await controller.criarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Email duplicado' });
    });

    it('deve permitir que professor crie aluno', async () => {
      mockRepository.create.mockResolvedValue(aluno);

      const req = {
        body: { nome: 'Aluno', email: 'aluno@email.com', senha: 'senha123', perfil: 'Aluno' },
        usuario: professorLogado,
      } as unknown as Request;
      const res = mockResponse();

      await controller.criarUsuario(req, res);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar 403 quando professor tenta criar administrador', async () => {
      const req = {
        body: { nome: 'Novo Admin', email: 'novo@email.com', senha: 'senha123', perfil: 'Administrador' },
        usuario: professorLogado,
      } as unknown as Request;
      const res = mockResponse();

      await controller.criarUsuario(req, res);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(ERRO_ADMIN);
    });
  });

  describe('atualizarUsuario', () => {
    it('deve retornar 404 quando usuário não encontrado', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const req = {
        params: { id: '999' },
        body: { nome: 'João Atualizado' },
        usuario: { id: '1', perfil: 'Administrador' },
      } as unknown as Request;
      const res = mockResponse();

      await controller.atualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado' });
    });

    it('deve retornar 403 quando admin tenta alterar o próprio perfil', async () => {
      const usuarioAtual = {
        _id: '1',
        nome: 'Admin',
        email: 'admin@email.com',
        perfil: 'Administrador' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockRepository.findById.mockResolvedValue(usuarioAtual);

      const req = {
        params: { id: '1' },
        body: { perfil: 'Aluno' },
        usuario: { id: '1', perfil: 'Administrador' },
      } as unknown as Request;
      const res = mockResponse();

      await controller.atualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        erro: 'Você não pode alterar seu próprio perfil',
      });
    });

    it('deve atualizar usuário e retornar 200', async () => {
      const usuarioAtual = {
        _id: '2',
        nome: 'Maria',
        email: 'maria@email.com',
        perfil: 'Aluno' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      const usuarioAtualizado = { ...usuarioAtual, nome: 'Maria Atualizada' };

      mockRepository.findById.mockResolvedValue(usuarioAtual);
      mockRepository.update.mockResolvedValue(usuarioAtualizado);

      const req = {
        params: { id: '2' },
        body: { nome: 'Maria Atualizada' },
        usuario: { id: '1', perfil: 'Administrador' },
      } as unknown as Request;
      const res = mockResponse();

      await controller.atualizarUsuario(req, res);

      expect(mockRepository.update).toHaveBeenCalledWith('2', expect.objectContaining({ nome: 'Maria Atualizada' }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve permitir que usuário edite os próprios dados sem enviar o perfil', async () => {
      mockRepository.findById.mockResolvedValue(admin);
      mockRepository.update.mockResolvedValue({ ...admin, nome: 'Admin Novo' });

      const req = {
        params: { id: '10' },
        body: { nome: 'Admin Novo' },
        usuario: { id: '10', perfil: 'Administrador' },
      } as unknown as Request;
      const res = mockResponse();

      await controller.atualizarUsuario(req, res);

      expect(mockRepository.update).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve permitir que professor edite outro professor', async () => {
      mockRepository.findById.mockResolvedValue(professor);
      mockRepository.update.mockResolvedValue({ ...professor, nome: 'Professor B2' });

      const req = {
        params: { id: '20' },
        body: { nome: 'Professor B2', perfil: 'Professor' },
        usuario: professorLogado,
      } as unknown as Request;
      const res = mockResponse();

      await controller.atualizarUsuario(req, res);

      expect(mockRepository.update).toHaveBeenCalledWith('20', expect.objectContaining({ nome: 'Professor B2' }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 403 quando professor tenta editar administrador', async () => {
      mockRepository.findById.mockResolvedValue(admin);

      const req = {
        params: { id: '10' },
        body: { nome: 'Outro nome' },
        usuario: professorLogado,
      } as unknown as Request;
      const res = mockResponse();

      await controller.atualizarUsuario(req, res);

      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(ERRO_ADMIN);
    });

    it('deve retornar 403 quando professor tenta promover alguém a administrador', async () => {
      mockRepository.findById.mockResolvedValue(aluno);

      const req = {
        params: { id: '30' },
        body: { perfil: 'Administrador' },
        usuario: professorLogado,
      } as unknown as Request;
      const res = mockResponse();

      await controller.atualizarUsuario(req, res);

      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(ERRO_ADMIN);
    });
  });

  describe('listarUsuarios', () => {
    it('deve retornar lista de usuários com status 200', async () => {
      const usuarios = [
        { _id: '1', nome: 'João', email: 'joao@email.com', perfil: 'Aluno' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      mockRepository.findAll.mockResolvedValue(usuarios);

      const req = {} as Request;
      const res = mockResponse();

      await controller.listarUsuarios(req, res);

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(usuarios);
    });

    it('deve retornar status 500 quando ocorrer erro', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Erro no banco'));

      const req = {} as Request;
      const res = mockResponse();

      await controller.listarUsuarios(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro no banco' });
    });
  });

  describe('buscarUsuario', () => {
    it('deve retornar usuário com status 200 quando encontrado', async () => {
      const usuario = { _id: '1', nome: 'João', email: 'joao@email.com', perfil: 'Aluno' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      mockRepository.findById.mockResolvedValue(usuario);

      const req = { params: { id: '1' } } as unknown as Request;
      const res = mockResponse();

      await controller.buscarUsuario(req, res);

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(usuario);
    });

    it('deve retornar status 404 quando usuário não encontrado', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const req = { params: { id: '999' } } as unknown as Request;
      const res = mockResponse();

      await controller.buscarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado' });
    });
  });

  describe('deletarUsuario', () => {
    it('deve retornar 403 quando usuário tenta excluir a si mesmo', async () => {
      const req = {
        params: { id: '1' },
        usuario: { id: '1', perfil: 'Administrador' },
      } as unknown as Request;
      const res = mockResponse();

      await controller.deletarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Você não pode excluir sua própria conta' });
    });

    it('deve deletar usuário com status 200', async () => {
      const usuario = { _id: '2', nome: 'Maria', email: 'maria@email.com', perfil: 'Aluno' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      mockRepository.findById.mockResolvedValue(usuario);
      mockRepository.delete.mockResolvedValue(usuario);

      const req = {
        params: { id: '2' },
        usuario: { id: '1', perfil: 'Administrador' },
      } as unknown as Request;
      const res = mockResponse();

      await controller.deletarUsuario(req, res);

      expect(mockRepository.delete).toHaveBeenCalledWith('2');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário deletado com sucesso' });
    });

    it('deve retornar 404 quando usuário a excluir não existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const req = {
        params: { id: '999' },
        usuario: { id: '1', perfil: 'Administrador' },
      } as unknown as Request;
      const res = mockResponse();

      await controller.deletarUsuario(req, res);

      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado' });
    });

    it('deve permitir que professor exclua aluno', async () => {
      mockRepository.findById.mockResolvedValue(aluno);
      mockRepository.delete.mockResolvedValue(aluno);

      const req = { params: { id: '30' }, usuario: professorLogado } as unknown as Request;
      const res = mockResponse();

      await controller.deletarUsuario(req, res);

      expect(mockRepository.delete).toHaveBeenCalledWith('30');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar 403 quando professor tenta excluir administrador', async () => {
      mockRepository.findById.mockResolvedValue(admin);

      const req = { params: { id: '10' }, usuario: professorLogado } as unknown as Request;
      const res = mockResponse();

      await controller.deletarUsuario(req, res);

      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(ERRO_ADMIN);
    });
  });
});