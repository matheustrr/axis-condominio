# 12 - Roadmap

## Fase 1 — Fundação

- [x] Monólito modular inicial
- [x] PostgreSQL + Prisma
- [x] Docker Compose
- [x] Fastify + Swagger
- [x] React inicial
- [x] CI inicial
- [x] Documentação técnica

## Fase 2 — Segurança e domínio

- [x] Bootstrap do administrador
- [x] Login JWT
- [x] Autorização por papel/condomínio
- [x] Validação Zod
- [x] Reservas com conflito
- [x] Dashboard

## Fase 3 — Infra assíncrona

- [x] Adapter Redis
- [x] Adapter MongoDB para auditoria
- [x] Adapter RabbitMQ para eventos
- [ ] Consumidores de eventos
- [ ] Notificações/e-mail
- [ ] Rate limiting
- [ ] Locks distribuídos quando necessários

## Fase 4 — Produto completo

- [ ] Frontend autenticado completo
- [ ] Gestão de moradores e permissões
- [ ] Reservas com calendário
- [ ] Ocorrências com status e histórico
- [ ] Financeiro completo
- [ ] Relatórios
- [ ] Documentos

## Fase 5 — Qualidade/produção

- [ ] Testes unitários e integração
- [ ] Dockerfiles finais
- [ ] CI/CD completo
- [ ] Observabilidade
- [ ] Backups e recuperação
- [ ] Segurança avançada
- [ ] Performance/load test

## Fase 6 — Escala

Somente após métricas demonstrarem necessidade: filas dedicadas, workers independentes, read replicas, serviços separados e/ou microsserviços.
