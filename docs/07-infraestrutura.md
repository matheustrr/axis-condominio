# 07 - Infraestrutura

## Docker Compose

O Compose sobe PostgreSQL, Redis, MongoDB e RabbitMQ para desenvolvimento.

### PostgreSQL
Fonte transacional do sistema.

### Redis
Cache e dados temporários. O sistema continua funcional se o cache estiver indisponível.

### MongoDB
Armazena auditoria.

### RabbitMQ
Exchange `condominio.events` para eventos assíncronos.

## Variáveis

As URLs ficam em `backend/.env.example`. Segredos reais nunca devem ser commitados.

## Health checks futuros

Produção deve verificar banco, Redis, MongoDB e RabbitMQ separadamente e expor métricas de latência/erro.

## Escala

Primeiro escalar verticalmente e otimizar consultas/cache. Quando necessário, escalar réplicas do backend atrás de um load balancer. Só depois considerar extração de serviços específicos.
