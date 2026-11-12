import express from 'express';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { UsuarioController } from '../controllers/usuarioController.js';
import { validarSchema } from '../middlewares/validarSchema.js';
import { autorizar } from '../middlewares/autorizar.js';
import {
  criarUsuarioSchema,
  atualizarUsuarioSchema,
} from '../schemas/usuarioSchema.js';

const router = express.Router();
const repository = new UsuarioRepository();
const controller = new UsuarioController(repository);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Criar novo usuário
 *     description: Administrador cria qualquer perfil; Professor cria apenas Professores e Alunos.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - perfil
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               senha:
 *                 type: string
 *                 example: senha123
 *               perfil:
 *                 type: string
 *                 enum: [Administrador, Professor, Aluno]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado
 */
router.post('/', autorizar('Administrador', 'Professor'), validarSchema(criarUsuarioSchema), (req, res) => controller.criarUsuario(req, res));

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar usuários (paginado, com filtro por perfil)
 *     description: Restrito a Administrador e Professor. Resultados ordenados por nome.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: perfil
 *         schema:
 *           type: string
 *           enum: [Administrador, Professor, Aluno]
 *         description: Filtra pelo perfil (omitido = todos)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Página de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 itens:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *                 total:
 *                   type: integer
 *                   example: 23
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Parâmetros de paginação ou perfil inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado
 */
router.get('/', autorizar('Administrador', 'Professor'), (req, res) => controller.listarUsuarios(req, res));

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     description: Restrito a Administrador e Professor.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', autorizar('Administrador', 'Professor'), (req, res) => controller.buscarUsuario(req, res));

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     description: Administrador edita qualquer usuário; Professor edita apenas Professores e Alunos e não pode promover ninguém a Administrador.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva Atualizado
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               senha:
 *                 type: string
 *                 example: novasenha123
 *               perfil:
 *                 type: string
 *                 enum: [Administrador, Professor, Aluno]
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/:id', autorizar('Administrador', 'Professor'), validarSchema(atualizarUsuarioSchema), (req, res) => controller.atualizarUsuario(req, res));

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Deletar usuário
 *     description: Administrador exclui qualquer usuário; Professor exclui apenas Professores e Alunos.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', autorizar('Administrador', 'Professor'), (req, res) => controller.deletarUsuario(req, res));

export default router;