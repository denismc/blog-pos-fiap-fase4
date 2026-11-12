import type { IPost } from '@/interfaces/IPost';

export const AUTOR_DESCONHECIDO = 'Autor desconhecido';

/** Faixa Unicode dos acentos que o normalize('NFD') separa da letra. */
const ACENTOS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Minúsculas e sem acentos: "Introdução" e "introducao" passam a ser iguais. */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(ACENTOS, '').toLowerCase();
}

export function nomeDoAutor(post: IPost): string {
  return post.autor?.nome ?? AUTOR_DESCONHECIDO;
}

/**
 * Filtra por título, conteúdo ou nome do autor, como a lista de cards do web.
 * A busca é local: a lista já foi carregada inteira e o filtro responde a cada
 * letra digitada sem nova chamada à API.
 */
export function filtrarPosts(posts: IPost[], termoBusca: string): IPost[] {
  const termo = normalizar(termoBusca.trim());
  if (!termo) return posts;

  return posts.filter((post) =>
    [post.titulo, post.conteudo, nomeDoAutor(post)].some((campo) =>
      normalizar(campo).includes(termo)
    )
  );
}

/** Corta o texto no limite, sem quebrar a última palavra, e acrescenta "…". */
export function resumir(texto: string, tamanho = 140): string {
  const limpo = texto.replace(/\s+/g, ' ').trim();
  if (limpo.length <= tamanho) return limpo;

  const corte = limpo.slice(0, tamanho);
  const ultimoEspaco = corte.lastIndexOf(' ');
  const semPalavraQuebrada =
    ultimoEspaco > 0 ? corte.slice(0, ultimoEspaco) : corte;
  return `${semPalavraQuebrada.trimEnd()}…`;
}

/**
 * Data no formato dd/mm/aaaa. Montada à mão para não depender do suporte a
 * Intl/locale pt-BR do motor JavaScript do aparelho.
 */
export function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${data.getFullYear()}`;
}
