import { IUsuario } from '../interfaces/IUsuario.js';
import { ICriarUsuario } from '../interfaces/ICriarUsuario.js';
import { IFiltroUsuarios } from '../interfaces/IPaginacao.js';

export interface IUsuarioRepository {
  findPaginado(filtro: IFiltroUsuarios): Promise<{ itens: IUsuario[]; total: number }>;
  findById(id: string): Promise<IUsuario | null>;
  findByEmail(email: string): Promise<(IUsuario & { senha: string }) | null>;
  create(dados: ICriarUsuario): Promise<IUsuario>;
  update(id: string, dados: Partial<IUsuario>): Promise<IUsuario | null>;
  delete(id: string): Promise<IUsuario | null>;
}
