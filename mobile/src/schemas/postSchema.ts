import { z } from 'zod';

/**
 * Mesmas regras do criarPostSchema do backend (backend/src/schemas/postSchema.ts),
 * usadas tanto para criar quanto para editar. Os espaços nas pontas são
 * removidos antes de contar os caracteres.
 */
export const postSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(150, 'Título deve ter no máximo 150 caracteres'),
  conteudo: z
    .string()
    .trim()
    .min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
});

export type PostForm = z.infer<typeof postSchema>;
