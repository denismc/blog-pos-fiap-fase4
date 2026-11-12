import { z } from 'zod';

/** Mesmas regras do criarComentarioSchema do backend (o post vai na rota). */
export const comentarioSchema = z.object({
  conteudo: z
    .string()
    .trim()
    .min(1, 'Comentário não pode ser vazio')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres'),
});

export type ComentarioForm = z.infer<typeof comentarioSchema>;
