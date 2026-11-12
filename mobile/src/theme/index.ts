/**
 * Tema do app: mesmas cores do front-end web (frontend/src/index.css),
 * para manter a identidade visual entre as duas interfaces.
 */
export const cores = {
  escura: '#3d146e',
  primaria: '#ed145b',
  secundaria: '#7b2fbe',
  clara: '#f5f0ff',
  texto: '#0d0d0d',
  textoSecundario: '#777777',
  branco: '#ffffff',
  borda: '#dddddd',
  erro: '#c62828',
} as const;

export const espacamento = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const fonte = {
  pequena: 12,
  normal: 14,
  media: 16,
  titulo: 20,
  grande: 24,
} as const;

export const raio = {
  sm: 6,
  md: 10,
} as const;
