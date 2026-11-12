import { autorizar } from '../middlewares/autorizar.js';
import { Request, Response, NextFunction } from 'express';
import { jest, describe, it, expect } from '@jest/globals';

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];
  return res;
};

const executar = (perfilLogado?: string) => {
  const req = (perfilLogado ? { usuario: { id: '1', perfil: perfilLogado } } : {}) as unknown as Request;
  const res = mockResponse();
  const next = jest.fn() as unknown as NextFunction;

  autorizar('Administrador', 'Professor')(req, res, next);

  return { res, next };
};

describe('autorizar', () => {
  it.each(['Administrador', 'Professor'])('deve permitir acesso ao perfil %s', (perfil) => {
    const { res, next } = executar(perfil);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deve retornar 403 para perfil não autorizado', () => {
    const { res, next } = executar('Aluno');

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Acesso negado' });
  });

  it('deve retornar 403 quando não há usuário autenticado', () => {
    const { res, next } = executar();

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
