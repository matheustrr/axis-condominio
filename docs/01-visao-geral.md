# 01 - Visão geral

## Objetivo

O Axis Condomínio é uma plataforma para administrar condomínios, unidades, moradores, reservas, comunicados, ocorrências e financeiro.

## Perfis

- **ADMIN**: administração completa do condomínio.
- **MANAGER**: gestão operacional e financeira.
- **RESIDENT**: consulta informações e solicita reservas/ocorrências permitidas.

## Módulos

1. Autenticação e autorização
2. Condomínios
3. Blocos e unidades
4. Moradores
5. Reservas
6. Comunicados
7. Ocorrências
8. Financeiro
9. Dashboard
10. Auditoria
11. Notificações assíncronas

## Como uma requisição percorre o sistema

Frontend → HTTP/JSON → Fastify → autenticação → validação Zod → regra de negócio → Prisma/PostgreSQL → eventos Redis/RabbitMQ/Mongo quando necessário → resposta HTTP.

## Responsabilidade de cada tecnologia

| Tecnologia | Responsabilidade |
|---|---|
| TypeScript | linguagem e tipagem |
| Fastify | servidor HTTP/API |
| React | interface web |
| PostgreSQL | dados transacionais e relacionais |
| Prisma | ORM e acesso ao PostgreSQL |
| Redis | cache, sessões futuras, rate limit e locks |
| MongoDB | auditoria e dados flexíveis |
| RabbitMQ | eventos e jobs assíncronos |
| Docker | ambiente reproduzível |
| GitHub Actions | CI |
