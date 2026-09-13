# 03 - Backend

## Inicialização

`server.ts` cria a aplicação e abre a porta HTTP. `app.ts` registra plugins, documentação Swagger, health checks e rotas.

## Validação

Os payloads importantes passam por Zod antes de chegar ao Prisma. Erros de validação retornam HTTP 400.

## Autenticação

`POST /auth/bootstrap` cria o primeiro condomínio e administrador.
`POST /auth/login` valida e-mail/senha e retorna JWT.
`GET /auth/me` valida o token e retorna o usuário atual.

O JWT carrega `id`, `name`, `email`, `role` e `condominiumId`. Rotas privadas validam o token e isolam o acesso ao condomínio do usuário.

## Dashboard

`GET /dashboard` agrega contadores de blocos, unidades, moradores, ocorrências abertas, cobranças pendentes e reservas futuras. O resultado é armazenado no Redis por curto período.

## Auditoria

Ações relevantes chamam `audit()`, que grava documentos na coleção MongoDB `audit_logs`.

## Eventos

Ações relevantes chamam `publishEvent()`. O RabbitMQ usa o exchange `condominio.events` com routing keys por domínio.

## Próxima evolução

Separar as rotas atuais em módulos físicos (`modules/auth`, `modules/reservations`, etc.), adicionar services/repositories e testes de integração. A regra é não criar abstrações apenas por estética: cada camada precisa ter responsabilidade clara.
