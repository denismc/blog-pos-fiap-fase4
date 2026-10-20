# Plano da Fase 4 — Aplicativo mobile (React Native)

Objetivo: desenvolver o front-end mobile do blog em React Native, consumindo o backend Node.js já existente, para docentes e estudantes.

## Decisões de arquitetura

- **Mesmo repositório**, com o app em uma pasta nova `mobile/`, ao lado de `backend/` e `frontend/`. Cada pasta mantém seu próprio `package.json` (sem npm workspaces, que conflitam com o bundler Metro).
- **Expo + TypeScript**: permite testar no celular via Expo Go (Android e iOS) mesmo desenvolvendo no Windows.
- **Sem Docker para o app**: o app roda no celular/emulador, não em servidor. O Docker continua subindo backend + MongoDB.
- **URL da API por variável de ambiente** (`EXPO_PUBLIC_API_URL`), pois no celular `localhost` é o próprio aparelho:
  - Emulador Android: `http://10.0.2.2:3000/api`
  - Celular físico: `http://<IP-do-PC-na-rede>:3000/api`
  - Demonstração: URL do backend publicado no Render

## Fluxo de trabalho

Cada entrega tem sua própria branch, com Pull Request e merge na `main`.

## Entregas

### Preparação
- [x] **0** · `docs/migracao-fase4` — README apontando para o repositório da fase 4 e este plano

### Backend
- [ ] **1** · `feat/usuarios-permissao-professor` — Professor pode criar, editar e excluir Professores e Alunos (nunca Administradores); Aluno não lista usuários
- [ ] **2** · `feat/usuarios-paginacao` — `GET /usuarios?perfil=&page=&limit=` paginado e filtrado por perfil; ajuste da tela de usuários do front-end web
- [ ] **3** · `feat/posts-permissao-professor` — *a decidir pelo grupo:* professor pode editar/excluir posts de outros professores?

### Mobile
- [ ] **4** · `feat/mobile-setup` — projeto Expo, estrutura de pastas, tema, lint/prettier
- [ ] **5** · `feat/mobile-auth` — cliente da API, contexto de autenticação, login e rotas protegidas por perfil
- [ ] **6** · `feat/mobile-lista-posts` — página principal com título, autor, descrição curta e busca
- [ ] **7** · `feat/mobile-detalhe-post` — leitura do post completo e comentários
- [ ] **8** · `feat/mobile-form-post` — criação e edição de posts
- [ ] **9** · `feat/mobile-admin-posts` — página administrativa com editar/excluir
- [ ] **10** · `feat/mobile-gestao-usuarios` — listagem paginada, criação e edição de professores e alunos

### Qualidade e documentação
- [ ] **11** · `ci/mobile` — workflow de CI do app (lint + checagem de tipos)
- [ ] **12** · `docs/readme-mobile` — setup, arquitetura e guia de uso do mobile no README
- [ ] **13** · `docs/relato-desafios` — documento de arquitetura e relato de experiências e desafios

### Fora do repositório
- [ ] Vídeo de demonstração (máx. 15 min)

## Mapa dos requisitos

| Requisito do Tech Challenge | Entregas |
|---|---|
| 1. Página principal (lista de posts) | 6 |
| 2. Leitura de post (+ comentários) | 7 |
| 3. Criação de postagens | 8 |
| 4. Edição de postagens | 3, 8 |
| 5–7. Criação, edição e listagem de professores | 1, 2, 10 |
| 8. Mesmas páginas para alunos | 1, 2, 10 |
| 9. Página administrativa | 3, 9 |
| 10. Autenticação e autorização | 5 |
| Técnicos: React Native, hooks, estilização | 4–10 |
| Técnicos: integração com back-end | 1, 2, 5–10 |
| Técnicos: documentação | 12, 13 |
