# Blog Pós FIAP

API e front-end de um blog acadêmico com posts, autores e controle de acesso por perfil (Administrador, Professor, Aluno), com autenticação e cadastro de usuários com foco em segurança, boas práticas e arquitetura escalável.

> 📱 **Fase 4 em andamento:** desenvolvimento do aplicativo mobile em React Native. O planejamento e o progresso das entregas estão em [`docs/plano-fase4.md`](docs/plano-fase4.md).

## 🚀 Tecnologias

**Backend**
- Node.js + TypeScript
- Express
- MongoDB + Mongoose
- Argon2id (hash de senha com pepper)
- JWT (autenticação)
- Zod (validação)
- Docker

**Frontend**
- React + TypeScript
- Vite
- React Hook Form + Zod
- Axios

## 🔐 Segurança

- Senhas com hash Argon2id + pepper
- Autenticação via JWT com expiração configurável
- Autorização por perfil (Administrador, Professor, Aluno)
- Variáveis sensíveis isoladas em `.env`
- Validação de dados no backend e frontend

## 🏗️ Arquitetura

O projeto segue o padrão **MVC + Repository Pattern**:

```
Controller → Repository → Model → MongoDB
```

- **Controller** → recebe a requisição e retorna a resposta
- **Repository** → abstrai o acesso ao banco de dados
- **Model** → define o schema do MongoDB
- **Middleware** → autenticação, autorização e validação

O Repository Pattern permite trocar o banco de dados sem alterar os controllers, e facilita os testes unitários com mocks.

## 🖥️ Front-end

### Setup inicial

```bash
cd frontend
npm install
npm run dev       # ambiente de desenvolvimento (http://localhost:5173)
npm run build     # build de produção (gera frontend/dist)
```

Se preferir rodar via Docker em vez de local, veja a seção "🐳 Rodando com Docker" mais abaixo — nesse caso não precisa do `npm install` manual.

### Arquitetura da aplicação

- **React + TypeScript + Vite**, sem roteador (`react-router`): a tela ativa é controlada por estado local em `App.tsx` (`tela: 'posts' | 'usuarios'`), já que a aplicação tem poucas telas e a navegação depende fortemente do perfil logado.
- **Autenticação via Context API** (`src/contexts/AuthContext.tsx`): centraliza `usuarioLogado`, `login` e `logout`, evitando repassar esses dados por props em cada componente. O hook `useAuth()` dá acesso a esse estado em qualquer componente da árvore.
- **Integração com a API** (`src/services/api.ts`): uma instância única do Axios com dois interceptors — um injeta o token JWT em toda requisição, o outro desloga automaticamente o usuário se a API responder 401.
- **Formulários** (`FormPost`, `FormUsuario`, `Login`): usam `react-hook-form` + `zod` (`src/schemas/`) para validação — o mesmo padrão de schema usado no backend, também validado no cliente antes de enviar.
- **Componentes por tela**:
  - `screens/TelaPosts.tsx` — lista/busca/cria/edita/exclui posts (Administrador e Professor)
  - `screens/TelaPostsAluno.tsx` — lista somente leitura em formato de cards (Aluno)
  - `screens/TelaUsuarios.tsx` — gestão de usuários (Administrador)
  - `components/PostDetalhe.tsx` — conteúdo completo do post + comentários (`components/Comentarios.tsx`)
- **Estilização**: CSS puro (`src/App.css`), sem biblioteca de estilização — responsivo via media queries (breakpoints em 768px e 480px). Em telas pequenas, a navegação do header vira um menu suspenso (ícone ☰) e as tabelas (Posts/Usuários) viram cartões empilhados em vez de rolagem horizontal.
- **Ícones**: SVGs inline em `components/Icones.tsx`, sem dependência externa de ícones.

### Guia de uso

1. **Login** — tela inicial, exige e-mail/senha de um usuário cadastrado (veja a seção "👤 Usuários padrão" mais abaixo).
2. **Administrador**: acessa as abas "Posts" e "Usuários" no header. Pode criar/editar/excluir qualquer post e qualquer usuário.
3. **Professor**: acessa só a aba "Posts". Pode criar posts e editar/excluir apenas os que ele mesmo criou.
4. **Aluno**: não tem abas de navegação — vê direto a lista de posts em cards, com busca, acesso somente leitura, e pode comentar nos posts.
5. **Comentários**: qualquer perfil autenticado pode comentar ao abrir um post; só o autor do comentário ou um Administrador pode excluí-lo.
6. **Mobile**: em telas estreitas, o menu de navegação e o usuário logado saem do header e passam a ficar atrás do ícone ☰ no canto superior direito.

## 🧪 Testes

O projeto usa **Jest + ts-jest** para testes unitários do backend. `npm test` já roda com `--coverage`, e o `jest.config.ts` tem um `coverageThreshold` global de 20% (statements, branches, functions e lines) — se a cobertura cair abaixo disso, os testes falham. Isso atende ao requisito de cobertura mínima de 20% do código.

**Rodar os testes:**

```bash
cd backend
npm test
```

**Cobertura atual:** ~42% statements / ~44% lines (bem acima do mínimo de 20% exigido), com foco nos controllers — em especial `postController` e `comentarioController`, que cobrem as regras de propriedade (autor vs. Administrador) e a checagem de existência do post ao comentar.

| Controller | Testes |
|------------|--------|
| `criarUsuario` | 2 |
| `atualizarUsuario` | 3 |
| `listarUsuarios` | 2 |
| `buscarUsuario` | 2 |
| `deletarUsuario` | 2 |
| `criarPost` | 2 |
| `listarPosts` | 2 |
| `buscarPost` | 2 |
| `pesquisarPosts` | 2 |
| `atualizarPost` | 5 |
| `deletarPost` | 4 |
| `criarComentario` | 3 |
| `listarComentarios` | 3 |
| `deletarComentario` | 5 |
| **Total** | **39** |

## 📋 Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

## ⚙️ Configuração

**1 → Clone o repositório**
```bash
git clone https://github.com/denismc/blog-pos-fiap-fase4.git
cd blog-pos-fiap-fase4
```

**2 → Configure as variáveis de ambiente do backend**
```bash
cp backend/.env.example backend/.env
```

Edite o `backend/.env` com seus valores:

```env
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/blog-pos-fiap
PEPPER=substitua_por_uma_string_longa_e_aleatoria
JWT_SECRET=substitua_por_uma_string_longa_e_aleatoria
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

**3 → Configure as variáveis de ambiente do frontend**
```bash
cp frontend/.env.example frontend/.env
```

Edite o `frontend/.env` com seus valores:

```env
VITE_API_URL=http://localhost:3000/api
```

## 🐳 Rodando com Docker

**Desenvolvimento**
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

**Produção**
```bash
docker-compose up -d --build
```

**Resetar o banco (apaga os dados e roda o seed do zero)**
```bash
docker-compose -f docker-compose.dev.yml down -v
```
> ⚠️ `down` sozinho só para os containers — os dados continuam no volume e o seed não roda de novo. Só o `-v` limpa o volume de fato.

**Rodando mais de uma cópia na mesma máquina**

Os nomes dos containers usam `${COMPOSE_PROJECT_NAME}`, que por padrão é o nome da pasta do projeto. Como o `git clone` sempre cria uma pasta chamada `blog-pos-fiap-fase4`, duas cópias clonadas em lugares diferentes ainda colidem por padrão (mesmo nome de projeto = mesmos containers/volume). Pra rodar duas instâncias isoladas ao mesmo tempo, use a flag `-p` com um nome diferente para cada uma:
```bash
docker-compose -p meu-teste -f docker-compose.dev.yml up -d --build
```

## 🌐 Acessos

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 (dev) / http://localhost:80 (prod) |
| Backend API | http://localhost:3000 |
| MongoDB | localhost:27017 |

## 👤 Usuários padrão

Na primeira execução (banco vazio), um usuário de cada perfil é criado automaticamente:

| Perfil | Nome | Email | Senha |
|--------|------|-------|-------|
| Administrador | Administrador | admin@admin.com | admin123 |
| Professor | Professor A | professora@professora.com | professor123 |
| Professor | Professor B | professorb@professorb.com | professor123 |
| Aluno | Aluno | aluno@aluno.com | aluno123 |

> ⚠️ Altere as senhas padrão após o primeiro acesso!

## 🔌 Endpoints

Documentação interativa completa (Swagger) em `http://localhost:3000/api/docs`.

**Auth**

| Método | Rota | Acesso |
|--------|------|--------|
| POST | `/api/auth/login` | Público |

**Usuários**

| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/api/usuarios` | Autenticado |
| GET | `/api/usuarios/:id` | Autenticado |
| POST | `/api/usuarios` | Administrador |
| PUT | `/api/usuarios/:id` | Administrador |
| DELETE | `/api/usuarios/:id` | Administrador |

**Posts**

| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/api/posts` | Autenticado (Administrador, Professor, Aluno) |
| GET | `/api/posts/:id` | Autenticado (Administrador, Professor, Aluno) |
| GET | `/api/posts/search?q=` | Autenticado (Administrador, Professor, Aluno) |
| POST | `/api/posts` | Administrador, Professor |
| PUT | `/api/posts/:id` | Administrador (qualquer post) ou Professor (somente o próprio) |
| DELETE | `/api/posts/:id` | Administrador (qualquer post) ou Professor (somente o próprio) |

Regras de negócio de `Posts`:
- O campo `autor` de um post nunca vem do corpo da requisição em `POST` — é sempre o usuário autenticado (via token).
- Em `PUT`, o campo `autor` só pode ser alterado por um Administrador; se um Professor enviá-lo, o valor é ignorado.
- Alunos têm acesso somente de leitura (listar, buscar e pesquisar).

**Comentários**

| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/api/comentarios?post=<id>` | Autenticado (Administrador, Professor, Aluno) |
| POST | `/api/comentarios` | Autenticado (Administrador, Professor, Aluno) |
| DELETE | `/api/comentarios/:id` | Autor do comentário ou Administrador |

Regras de negócio de `Comentários`:
- O campo `autor` nunca vem do corpo da requisição — é sempre o usuário autenticado (via token), igual em `Posts`.
- Ao criar um comentário, o backend confirma que o `post` referenciado existe (404 caso contrário).
- Qualquer perfil autenticado pode comentar; a exclusão é restrita ao autor do comentário ou a um Administrador.

## 📁 Estrutura

```
├── backend/
│   ├── src/
│   │   ├── config/       # Variáveis de ambiente
│   │   ├── controllers/  # Lógica de negócio
│   │   ├── interfaces/   # Tipos TypeScript (backend)
│   │   ├── middlewares/  # Autenticação, autorização e validação
│   │   ├── models/       # Schemas Mongoose
│   │   ├── routes/       # Rotas da API
│   │   ├── schemas/      # Schemas Zod
│   │   └── types/        # Extensões de tipos
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── contexts/     # Context API (usuário logado)
│   │   ├── interfaces/   # Tipos TypeScript (frontend)
│   │   ├── schemas/      # Schemas Zod
│   │   ├── screens/      # Telas por perfil (Posts, Usuários)
│   │   ├── services/     # Configuração do Axios
│   │   └── types/        # Extensões de tipos
│   └── ...
├── docker-compose.yml
└── docker-compose.dev.yml
```

## 📄 Licença

MIT