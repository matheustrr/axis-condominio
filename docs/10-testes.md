# 10 - Testes

## Pirâmide

- unitários para regras puras;
- integração para rotas + PostgreSQL;
- contratos para payloads e respostas;
- poucos testes E2E para fluxos críticos.

## Casos prioritários

1. bootstrap cria condomínio e ADMIN.
2. login aceita senha correta e rejeita senha errada.
3. usuário não acessa outro condomínio.
4. reserva conflitante retorna 409.
5. cobrança rejeita unidade de outro condomínio.
6. dashboard retorna indicadores.
7. evento não deve impedir resposta principal quando RabbitMQ está indisponível.
8. cache não deve impedir o sistema de funcionar quando Redis está indisponível.

## CI

O GitHub Actions deve executar instalação, geração do Prisma, build e testes. Antes de exigir `npm ci`, os lockfiles devem estar versionados.
