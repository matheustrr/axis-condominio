# 06 - Fluxos de negócio

## Primeiro acesso

1. Cliente chama `POST /auth/bootstrap`.
2. Sistema cria condomínio e ADMIN em uma transação PostgreSQL.
3. Senha é armazenada como hash bcrypt.
4. JWT é emitido.
5. Auditoria registra o bootstrap.

## Login

1. E-mail é buscado no PostgreSQL.
2. bcrypt compara a senha.
3. JWT é emitido com o contexto do condomínio e papel.
4. Requisições privadas validam o token.

## Reserva

1. Morador/admin envia área e intervalo.
2. Zod valida datas.
3. Sistema procura sobreposição na mesma área.
4. Se houver conflito, retorna 409.
5. Se não houver, cria reserva.
6. Morador recebe PENDING; gestor pode criar CONFIRMED.
7. Evento RabbitMQ e auditoria são publicados.

## Comunicado

1. Gestor cria comunicado.
2. PostgreSQL persiste.
3. Evento `notice.created` é publicado.
4. Um consumidor futuro poderá disparar notificação.

## Cobrança

1. Gestor informa unidade, valor e vencimento.
2. Sistema valida que a unidade pertence ao condomínio.
3. PostgreSQL salva a cobrança.
4. Evento `charge.created` fica disponível para jobs futuros.

## Dashboard

1. Usuário autenticado fornece `condominiumId` pelo JWT.
2. Sistema consulta agregações.
3. Resultado é cacheado no Redis por 30 segundos.
4. Alterações relevantes invalidam caches específicos.
