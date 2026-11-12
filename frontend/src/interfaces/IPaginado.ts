export interface IPaginado<T> {
  itens: T[];
  total: number;
  page: number;
  totalPages: number;
}
