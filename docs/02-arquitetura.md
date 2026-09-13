# 02 - Arquitetura

## Estilo

**Monólito modular orientado a domínio.** Cada módulo possui uma responsabilidade de negócio e pode futuramente virar serviço independente.

```text
axis-condominio/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── auth.ts
│       ├── validation.ts
│       └── lib/
│           ├── prisma.ts
│           ├── redis.ts
│           ├── mongo.ts
│           └── rabbitmq.ts
├── frontend/
├── infra/
├── docs/
└── .github/workflows/
```

## PostgreSQL

É a fonte principal dos dados de negócio. Relacionamentos, integridade, transações e consultas administrativas ficam aqui.

## Redis

Não é a fonte oficial dos dados. É usado para acelerar consultas, guardar informações temporárias e futuramente implementar rate limiting e locks distribuídos.

## MongoDB

Recebe informações que não precisam participar do modelo transacional principal. O primeiro caso é `audit_logs`, registrando ações relevantes sem aumentar o modelo relacional.

## RabbitMQ

Transporta eventos para processamento assíncrono. Exemplos: `notice.created`, `incident.created`, `charge.created` e `reservation.created`. Consumidores poderão enviar notificações, e-mails e gerar documentos.

## Regra de consistência

Uma operação crítica deve ser confirmada no PostgreSQL antes de publicar efeitos assíncronos. Redis, MongoDB e RabbitMQ não substituem a transação principal.
