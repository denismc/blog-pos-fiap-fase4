import type { IPost } from '@/interfaces/IPost';
import {
  AUTOR_DESCONHECIDO,
  filtrarPosts,
  nomeDoAutor,
  resumir,
} from '@/utils/posts';

const criarPost = (dados: Partial<IPost>): IPost => ({
  _id: '1',
  titulo: 'Título',
  conteudo: 'Conteúdo',
  autor: { _id: 'a1', nome: 'Professor' },
  createdAt: '2026-03-05T12:00:00.000Z',
  updatedAt: '2026-03-05T12:00:00.000Z',
  ...dados,
});

const posts = [
  criarPost({
    _id: '1',
    titulo: 'Introdução ao Node.js',
    conteudo: 'Runtime JavaScript',
  }),
  criarPost({ _id: '2', titulo: 'React Native', conteudo: 'Apps com Expo' }),
  criarPost({
    _id: '3',
    titulo: 'Bancos de dados',
    conteudo: 'MongoDB e Mongoose',
    autor: { _id: 'a2', nome: 'Maria Souza' },
  }),
];

const ids = (lista: IPost[]) => lista.map((post) => post._id);

describe('filtrarPosts', () => {
  it('deve devolver todos os posts quando a busca está vazia', () => {
    expect(filtrarPosts(posts, '   ')).toBe(posts);
  });

  it('deve buscar no título sem diferenciar maiúsculas e acentos', () => {
    expect(ids(filtrarPosts(posts, 'INTRODUCAO'))).toEqual(['1']);
  });

  it('deve buscar no conteúdo', () => {
    expect(ids(filtrarPosts(posts, 'expo'))).toEqual(['2']);
  });

  it('deve buscar pelo nome do autor', () => {
    expect(ids(filtrarPosts(posts, ' maria '))).toEqual(['3']);
  });

  it('deve devolver lista vazia quando nada combina', () => {
    expect(filtrarPosts(posts, 'python')).toEqual([]);
  });
});

describe('nomeDoAutor', () => {
  it('deve usar um texto padrão quando o autor foi excluído', () => {
    expect(nomeDoAutor(criarPost({ autor: null }))).toBe(AUTOR_DESCONHECIDO);
  });
});

describe('resumir', () => {
  it('deve manter textos curtos inteiros', () => {
    expect(resumir('Texto curto', 140)).toBe('Texto curto');
  });

  it('deve cortar sem quebrar a última palavra', () => {
    expect(resumir('Um texto bem comprido aqui', 12)).toBe('Um texto…');
  });

  it('deve juntar quebras de linha e espaços repetidos', () => {
    expect(resumir('Linha 1\n\nLinha   2', 140)).toBe('Linha 1 Linha 2');
  });
});
