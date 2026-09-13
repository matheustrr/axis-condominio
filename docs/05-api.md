# 05 - API

Base local: `http://localhost:3000`
Swagger: `GET /docs`

## Autenticação

- `POST /auth/bootstrap` — cria condomínio + primeiro ADMIN.
- `POST /auth/login` — retorna JWT.
- `GET /auth/me` — usuário autenticado.

## Gestão

- `GET /dashboard` — indicadores.
- `GET /condominiums` — condomínio do usuário.
- `GET /condominiums/:id` — estrutura completa.
- `POST /condominiums/:condominiumId/blocks` — cria bloco.
- `POST /blocks/:blockId/units` — cria unidade.
- `POST /units/:unitId/residents` — cria morador.

## Comunicados

- `GET /condominiums/:condominiumId/notices`
- `POST /condominiums/:condominiumId/notices`

## Ocorrências

- `GET /condominiums/:condominiumId/incidents`
- `POST /condominiums/:condominiumId/incidents`

## Financeiro

- `GET /condominiums/:condominiumId/charges`
- `POST /condominiums/:condominiumId/charges`

## Reservas

- `GET /condominiums/:condominiumId/reservations`
- `POST /condominiums/:condominiumId/reservations`
- `PATCH /reservations/:id/status`

## Health

- `GET /health`
- `GET /health/db`

Todas as rotas privadas usam `Authorization: Bearer <token>`.
