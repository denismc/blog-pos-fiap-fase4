import { z } from 'zod';

/*
 * Mesmas regras do criarUsuarioSchema do backend
 * (backend/src/schemas/usuarioSchema.ts).
 */
const nome = z
  .string()
  .trim()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres');

const email = z.string().trim().pipe(z.email('Email inválido'));

const senha = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(20, 'Senha deve ter no máximo 20 caracteres');

const perfil = z.enum(['Administrador', 'Professor', 'Aluno'] as const, {
  error: 'Perfil inválido',
});

export const criarUsuarioSchema = z.object({ nome, email, senha, perfil });

/** Na edição a senha é opcional: em branco mantém a senha atual. */
export const editarUsuarioSchema = z.object({
  nome,
  email,
  senha: senha.or(z.literal('')),
  perfil,
});

export type UsuarioForm = z.infer<typeof editarUsuarioSchema>;
