import { IUsuarioRepository } from './IUsuarioRepository.js';
import { IUsuario } from '../interfaces/IUsuario.js';
import { ICriarUsuario } from '../interfaces/ICriarUsuario.js';
import { IAtualizarUsuario } from '../interfaces/IAtualizarUsuario.js';
import { IFiltroUsuarios } from '../interfaces/IPaginacao.js';
import Usuario from '../models/usuarioModel.js';

export class UsuarioRepository implements IUsuarioRepository {
  async findPaginado({ perfil, page, limit }: IFiltroUsuarios): Promise<{ itens: IUsuario[]; total: number }> {
    const filtro = perfil ? { perfil } : {};

    const [itens, total] = await Promise.all([
      Usuario.find(filtro)
        .sort({ nome: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Usuario.countDocuments(filtro),
    ]);

    return { itens, total };
  }

  async findById(id: string): Promise<IUsuario | null> {
    return await Usuario.findById(id).lean();
  }

  async findByEmail(email: string): Promise<(IUsuario & { senha: string }) | null> {
    return await Usuario.findOne({ email }).select('+senha').lean();
  }

  async create(dados: ICriarUsuario): Promise<IUsuario> {
    const usuario = new Usuario(dados);
    await usuario.save();
    return usuario.toObject();
  }

  async update(id: string, dados: IAtualizarUsuario): Promise<IUsuario | null> {
    return await Usuario.findByIdAndUpdate(id, dados, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async delete(id: string): Promise<IUsuario | null> {
    return await Usuario.findByIdAndDelete(id).lean();
  }
}