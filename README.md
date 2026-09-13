# Administração de Condomínio

SaaS para gestão condominial, desenvolvido com arquitetura modular e preparado para crescimento.

## Stack

### Backend
- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- Redis
- MongoDB
- RabbitMQ

### Frontend
- React
- TypeScript
- Vite

## Domínios

- Autenticação e usuários
- Condomínios
- Blocos
- Unidades
- Moradores
- Comunicados
- Reservas de áreas
- Ocorrências
- Financeiro
- Auditoria
- Notificações

## Arquitetura

O projeto começa como um **monólito modular**. PostgreSQL é a fonte principal dos dados transacionais. Redis entra para cache, sessões, rate limiting e locks. MongoDB fica para auditoria, histórico e documentos flexíveis. RabbitMQ processa tarefas assíncronas, como notificações e jobs.

A divisão em microserviços será feita somente quando houver uma necessidade real de escala ou isolamento.

## Executar infraestrutura

```bash
docker compose up -d
```

## Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

API: `http://localhost:3000`

Swagger: `http://localhost:3000/docs`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Primeira entrega

A fundação já inclui API Fastify, modelo relacional inicial, CRUD de condomínio, blocos, unidades, moradores, comunicados, ocorrências, financeiro, infraestrutura Docker, dashboard React e CI.

As próximas entregas devem aprofundar autenticação/autorização, regras de negócio, reservas com conflito de horários, cobrança, auditoria, Redis, RabbitMQ, MongoDB, testes e observabilidade.
