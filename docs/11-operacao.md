# 11 - Operação e deploy

## Desenvolvimento

1. Subir infraestrutura com Docker Compose.
2. Criar `backend/.env` a partir de `.env.example`.
3. Instalar dependências do backend/frontend.
4. Executar `prisma generate`.
5. Aplicar migrations.
6. Iniciar API e frontend.

## Homologação

Builds devem vir do CI. Banco e filas devem ser recursos separados do desenvolvimento. Variáveis de ambiente são próprias do ambiente.

## Produção

Backend e frontend devem ser empacotados em imagens versionadas. PostgreSQL deve ter backup, monitoramento e política de recuperação. Redis, MongoDB e RabbitMQ devem ter persistência/configuração adequada ao seu papel.

## Observabilidade

Próxima fase: logs estruturados, métricas Prometheus, dashboards Grafana, tracing OpenTelemetry e alertas. Health checks não substituem métricas.

## Rollback

Deploy deve ser versionado por commit/imagem. Migrations incompatíveis precisam seguir estratégia expand/contract quando houver usuários em produção.
