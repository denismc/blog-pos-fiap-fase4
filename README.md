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

**Mobile**
- React Native + TypeScript
- Expo (SDK 58) + Expo Router
- ESLint (`eslint-config-expo`) + Prettier

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
  - `screens/TelaUsuarios.tsx` — gestão de usuários (Administrador), com filtro por perfil e paginação (`components/Paginacao.tsx`)
  - `components/PostDetalhe.tsx` — conteúdo completo do post + comentários (`components/Comentarios.tsx`)
- **Estilização**: CSS puro (`src/App.css`), sem biblioteca de estilização — responsivo via media queries (breakpoints em 768px e 480px). Em telas pequenas, a navegação do header vira um menu suspenso (ícone ☰) e as tabelas (Posts/Usuários) viram cartões empilhados em vez de rolagem horizontal.
- **Ícones**: SVGs inline em `components/Icones.tsx`, sem dependência externa de ícones.

### Guia de uso

1. **Login** — tela inicial, exige e-mail/senha de um usuário cadastrado (veja a seção "👤 Usuários padrão" mais abaixo).
2. **Administrador**: acessa as abas "Posts" e "Usuários" no header. Pode criar/editar/excluir qualquer post e qualquer usuário. A aba "Usuários" lista 10 por página, ordenados por nome, com filtro por perfil.
3. **Professor**: acessa só a aba "Posts". Pode criar posts e editar/excluir apenas os que ele mesmo criou.
4. **Aluno**: não tem abas de navegação — vê direto a lista de posts em cards, com busca, acesso somente leitura, e pode comentar nos posts.
5. **Comentários**: qualquer perfil autenticado pode comentar ao abrir um post; só o autor do comentário ou um Administrador pode excluí-lo.
6. **Mobile**: em telas estreitas, o menu de navegação e o usuário logado saem do header e passam a ficar atrás do ícone ☰ no canto superior direito.

## 📱 Mobile

> Em desenvolvimento. Hoje o app tem login com sessão persistida, rotas protegidas, a lista de posts com busca, a leitura do post com comentários, a criação e edição de posts, a página administrativa de posts e a gestão de professores e alunos. As demais telas chegam nas próximas entregas do [plano](docs/plano-fase4.md).

### Setup inicial

Pré-requisitos: Node.js 22+ e o app **Expo Go** no celular (Android ou iOS), ou um emulador Android.

```bash
cd mobile
npm install
cp .env.example .env   # ajuste EXPO_PUBLIC_API_URL (veja abaixo)
npm start              # abre o Metro; leia o QR code com o Expo Go
```

O backend precisa estar rodando (veja "🐳 Rodando com Docker"). No celular, `localhost` é o próprio aparelho, então a URL da API vem de `EXPO_PUBLIC_API_URL`:

| Onde o app roda | `EXPO_PUBLIC_API_URL` |
|-----------------|-----------------------|
| Emulador Android | `http://10.0.2.2:3000/api` |
| Celular físico (mesma rede Wi-Fi do PC) | `http://<IP-do-PC>:3000/api` |
| Backend publicado | `https://<servico>.onrender.com/api` |

Scripts úteis (dentro de `mobile/`): `npm test`, `npm run test:coverage`, `npm run lint`, `npm run typecheck`, `npm run format` e `npm run format:check`.

Para entrar, use um dos usuários da seção "👤 Usuários padrão".

### Arquitetura da aplicação

- **Expo + TypeScript** com **Expo Router**: navegação baseada em arquivos. Cada arquivo em `src/app/` é uma tela, e o `_layout.tsx` define a pilha de navegação.
- **Tema centralizado** (`src/theme`): cores, espaçamentos e tamanhos de fonte. São as mesmas cores do front-end web, e os estilos usam `StyleSheet` do React Native.
- **Configuração** (`src/config/env.ts`): URL da API lida de `EXPO_PUBLIC_API_URL`.
- **Imports com alias** `@/` apontando para `src/` (ex.: `import { cores } from '@/theme'`).
- **Autenticação via Context API** (`src/contexts/AuthContext.tsx`): expõe `usuarioLogado`, `login` e `logout`, como no web. A sessão (token + usuário) fica no **armazenamento seguro do aparelho** com `expo-secure-store` (Keychain/Keystore), em vez do `localStorage`, e é restaurada ao abrir o app.
- **Rotas protegidas** (`src/app/_layout.tsx`): usam `Stack.Protected` do Expo Router. Sem usuário logado só existe a tela de login. As telas de criar e editar post, a página administrativa e a gestão de usuários ficam em `Stack.Protected` aninhados que só existem para Professor e Administrador: para o Aluno essas rotas não existem, nem abrindo o link direto. Ao logar ou deslogar, o Expo Router redireciona sozinho, sem navegação manual.
- **Cliente da API** (`src/services/api.ts`): uma instância do Axios. Um interceptor injeta o token JWT, e outro chama o `logout` quando a API responde 401 (token expirado). No mobile não existe `window.location`, então o redirecionamento fica a cargo das rotas protegidas.
- **Formulários** com `react-hook-form` + `zod` (`src/schemas/`), no mesmo padrão do web. Os componentes reutilizáveis ficam em `src/components/` (`Botao`, `CampoTexto`, `CampoBusca`, `CardPost`, `Comentarios`, `FormPost`, `ItemPostAdmin`, `FormUsuario`, `Paginacao`, `Segmentado`).
- **Lista de posts** (`src/app/index.tsx`): página principal com título, descrição curta, autor e data de cada post, em uma `FlatList` com "puxar para atualizar". Tocar no card abre o post.
- **Hooks de dados** (`src/hooks/`): `useRequisicao` concentra o padrão de toda tela que lê da API (carregando, erro, recarregar e proteção contra resposta que chega depois de a tela fechar). `usePosts`, `usePost` e `useComentarios` são construídos sobre ele.
- **Busca** (`src/utils/posts.ts`): filtra na hora, sem nova chamada à API, por título, conteúdo ou nome do autor, como no web. No mobile ela também ignora acentos ("introducao" acha "Introdução").
- **Leitura do post** (`src/app/posts/[id].tsx`): rota dinâmica do Expo Router. Busca o post atualizado na API e mostra o texto completo, autor, data de publicação e de atualização.
- **Criação e edição de posts** (`src/app/posts/novo.tsx` e `src/app/posts/editar/[id].tsx`): as duas telas usam o mesmo `FormPost`, validado com `postSchema` (mesmas regras do backend: título de 3 a 150 caracteres e conteúdo com pelo menos 10). O botão "+ Novo post" aparece na lista para Professor e Administrador, e o "Editar post" aparece no detalhe só para o autor do post ou para o Administrador. A tela de edição confere essa regra de novo, caso seja aberta por link. Depois de publicar, o app abre o post criado. Depois de salvar, volta ao detalhe.
- **Página administrativa** (`src/app/admin/posts.tsx`): aberta pelo botão "Gerenciar posts" da tela inicial. Lista **todos** os posts, com busca e o filtro "Todos os posts" / "Meus posts". Editar e Excluir aparecem só para o autor do post ou para o Administrador (`podeAlterarPost` em `src/utils/permissoes.ts`), e os demais posts mostram que são somente leitura. A exclusão pede confirmação e recarrega a lista.
- **Gestão de usuários** (`src/app/admin/usuarios/`): aberta pelo botão "Usuários" da tela inicial. Lista paginada (10 por página, com Anterior/Próxima) usando o `GET /usuarios?perfil=&page=&limit=` da entrega 2, em abas **Professores** e **Alunos**. O Administrador também vê a aba de Administradores. Cadastro e edição usam o mesmo `FormUsuario`, validado com `usuarioSchema` (mesmas regras do backend). As regras da API também valem na tela (`src/utils/permissoes.ts`): o Professor não vê a opção de perfil Administrador nem edita Administradores, ninguém altera o próprio perfil, e ninguém exclui a própria conta. Na edição, a senha em branco mantém a atual. Excluir pede confirmação, e se a página atual ficar vazia o app volta para a anterior.
- **Recarregar ao voltar** (`src/hooks/useRecarregarAoVoltar.ts`): a lista e o detalhe recarregam quando voltam a ficar visíveis (via `useFocusEffect`), então um post criado ou editado já aparece atualizado.
- **Comentários** (`src/components/Comentarios.tsx`): lista do mais antigo para o mais novo e formulário validado com zod (mesmo limite de 1000 caracteres do backend). O botão de excluir aparece só para o autor do comentário ou para o Administrador (`eAutorOuAdmin` em `src/utils/permissoes.ts`), e a exclusão pede confirmação com o `Alert` nativo (`src/utils/confirmar.ts`).
- **Permissões por perfil** (`src/utils/permissoes.ts`): Professor e Administrador gerenciam posts e usuários, e o Aluno só visualiza. A API continua sendo quem garante essas regras; no app elas só decidem o que é exibido.

## 🧪 Testes

**Backend:** o projeto usa **Jest + ts-jest** para os testes unitários. `npm test` já roda com `--coverage`, e o `jest.config.ts` tem um `coverageThreshold` global de 20% (statements, branches, functions e lines) — se a cobertura cair abaixo disso, os testes falham. Isso atende ao requisito de cobertura mínima de 20% do código.

**Rodar os testes:**

```bash
cd backend
npm test
```

**Cobertura atual:** ~48% statements / ~51% lines (bem acima do mínimo de 20% exigido), com foco nos controllers e no middleware de autorização — em especial `postController` e `comentarioController`, que cobrem as regras de propriedade (autor vs. Administrador) e a checagem de existência do post ao comentar, e `usuarioController`, que cobre o que o Professor pode ou não fazer com outros usuários.

| Controller / middleware | Testes |
|------------|--------|
| `autorizar` (middleware) | 4 |
| `criarUsuario` | 4 |
| `atualizarUsuario` | 7 |
| `listarUsuarios` | 8 |
| `buscarUsuario` | 2 |
| `deletarUsuario` | 5 |
| `criarPost` | 2 |
| `listarPosts` | 2 |
| `buscarPost` | 2 |
| `pesquisarPosts` | 2 |
| `atualizarPost` | 5 |
| `deletarPost` | 4 |
| `criarComentario` | 3 |
| `listarComentarios` | 3 |
| `deletarComentario` | 5 |
| **Total** | **58** |

**Mobile** (`mobile/`): **Jest + jest-expo + React Native Testing Library**.

```bash
cd mobile
npm test               # ou npm run test:coverage
```

A configuração do Jest (no `package.json`) tem um `coverageThreshold` global (80% de statements, functions e lines, e 70% de branches): se a cobertura cair abaixo disso, `npm run test:coverage` e o CI falham. O `testTimeout` é de 30 s porque, com o cache do Jest vazio (como no CI), o primeiro teste de cada arquivo inclui a transformação do React Native e passa dos 5 s padrão.

**Cobertura atual:** ~97% statements / ~97% lines.

| Arquivo testado | Testes |
|-----------------|--------|
| `utils/permissoes` | 19 |
| `schemas/loginSchema` | 4 |
| `utils/erros` | 3 |
| `services/api` (interceptors) | 4 |
| `contexts/AuthContext` | 5 |
| `app/login` (tela) | 3 |
| `utils/posts` (busca e resumo) | 9 |
| `utils/datas` | 3 |
| `schemas/postSchema` | 4 |
| `schemas/usuarioSchema` | 5 |
| `hooks/useRecarregarAoVoltar` | 1 |
| `app/index` (lista de posts) | 8 |
| `app/posts/[id]` (detalhe e comentários) | 14 |
| `app/posts/novo` e `app/posts/editar/[id]` (formulário) | 7 |
| `app/admin/posts` (página administrativa) | 9 |
| `app/admin/usuarios` (lista paginada) | 8 |
| `app/admin/usuarios/novo` e `[id]` (formulário) | 10 |
| **Total** | **116** |

## 🔄 CI/CD

Os workflows do GitHub Actions (`.github/workflows/`) rodam em todo PR e push para a `main`, cada um só quando a pasta dele muda:

| Workflow | O que faz |
|----------|-----------|
| `backend-ci-cd.yml` | Testes com cobertura e build. Na `main`, também publica a imagem no Docker Hub e dispara o deploy no Render |
| `frontend-ci.yml` | Build do front-end web (o Render publica o site sozinho a cada push na `main`) |
| `mobile-ci.yml` | Lint, formatação (Prettier), checagem de tipos, testes com o mínimo de cobertura e o bundle JavaScript do Android (`expo export`), que pega erros de import que os testes com mocks não pegam |

O app mobile não é publicado nas lojas: ele roda pelo **Expo Go** (veja "📱 Mobile").

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
| GET | `/api/usuarios?perfil=&page=&limit=` | Administrador, Professor |
| GET | `/api/usuarios/:id` | Administrador, Professor |
| POST | `/api/usuarios` | Administrador (qualquer perfil) ou Professor (somente Professor/Aluno) |
| PUT | `/api/usuarios/:id` | Administrador (qualquer usuário) ou Professor (somente Professor/Aluno) |
| DELETE | `/api/usuarios/:id` | Administrador (qualquer usuário) ou Professor (somente Professor/Aluno) |

- Um Professor nunca cria, edita, exclui ou promove um Administrador — a API responde `403` com `"Professores não podem gerenciar Administradores"`.
- Ninguém pode alterar o próprio perfil nem excluir a própria conta (vale para qualquer perfil).
- Alunos não acessam a listagem nem os dados de outros usuários (e-mails ficam protegidos).
- A listagem é paginada e ordenada por nome. Todos os parâmetros são opcionais: `perfil` (`Administrador`, `Professor` ou `Aluno`), `page` (padrão `1`) e `limit` (padrão `10`, máximo `50`). Valores inválidos retornam `400`.
- Formato da resposta: `{ "itens": [...], "total": 23, "page": 1, "totalPages": 3 }`.

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
├── .github/workflows/    # CI/CD (backend, frontend e mobile)
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
├── mobile/
│   ├── src/
│   │   ├── __tests__/    # Testes unitários (Jest + Testing Library)
│   │   ├── app/          # Telas e layouts (rotas do Expo Router: posts/..., admin/posts, admin/usuarios/...)
│   │   ├── components/   # Componentes reutilizáveis (Botao, CampoTexto, CardPost...)
│   │   ├── config/       # URL da API (EXPO_PUBLIC_API_URL)
│   │   ├── contexts/     # Context API (usuário logado)
│   │   ├── hooks/        # Hooks de dados (useRequisicao, usePosts, useUsuarios...)
│   │   ├── interfaces/   # Tipos TypeScript (mobile)
│   │   ├── schemas/      # Schemas Zod
│   │   ├── services/     # Axios e sessão (expo-secure-store)
│   │   ├── theme/        # Cores, espaçamentos e fontes
│   │   └── utils/        # Permissões, mensagens de erro e busca de posts
│   ├── assets/           # Ícones e splash
│   └── app.json          # Configuração do Expo
├── docs/                 # Plano de entregas da fase 4
├── docker-compose.yml
└── docker-compose.dev.yml
```

## 📄 Licença

MIT