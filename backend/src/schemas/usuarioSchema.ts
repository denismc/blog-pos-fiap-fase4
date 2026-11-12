import { z } from 'zod';

export const criarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(20),
  perfil: z.enum(['Administrador', 'Professor', 'Aluno'] as const, {
    error: 'Perfil inválido',
  }),
});

export const atualizarUsuarioSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  email: z.email('Email inválido').optional(),
  senha: z.string().min(6).max(20).optional(),
  perfil: z
    .enum(['Administrador', 'Professor', 'Aluno'] as const, {
      error: 'Perfil inválido',
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  senha: z.string({ error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
});

export const listarUsuariosQuerySchema = z.object({
  perfil: z
    .enum(['Administrador', 'Professor', 'Aluno'] as const, {
      error: 'Perfil inválido',
    })
    .optional(),
  page: z.coerce.number().int().min(1, 'page deve ser maior ou igual a 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'limit deve ser maior ou igual a 1')
    .max(50, 'limit deve ser no máximo 50')
    .default(10),
});
