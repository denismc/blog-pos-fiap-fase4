import { z } from 'zod';

/**
 * Mesmas regras do loginSchema do backend (backend/src/schemas/usuarioSchema.ts).
 * O email é aparado antes de validar: o teclado do celular costuma inserir um
 * espaço no fim ao autocompletar.
 */
export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email('Email inválido')),
  senha: z
    .string({ error: 'Senha é obrigatória' })
    .min(1, 'Senha é obrigatória'),
});

export type LoginForm = z.infer<typeof loginSchema>;
