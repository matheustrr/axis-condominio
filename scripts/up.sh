#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Axis Condomínio: inicialização completa"

command -v docker >/dev/null 2>&1 || { echo "Docker não encontrado."; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "Docker Compose não encontrado."; exit 1; }

if [ ! -f .env ]; then
  if [ -f backend/.env.example ]; then
    cp backend/.env.example .env
    echo "==> .env criado a partir de backend/.env.example"
  else
    echo "ERRO: backend/.env.example não encontrado."
    exit 1
  fi
fi

echo "==> Subindo PostgreSQL, Redis, MongoDB e RabbitMQ"
docker compose up -d

echo "==> Aguardando serviços"
sleep 5

echo "==> Serviços ativos"
docker compose ps

echo ""
echo "==> Para iniciar backend:"
echo "    cd backend && npm install && npx prisma generate && npm run dev"
echo ""
echo "==> Para iniciar frontend:"
echo "    cd frontend && npm install && npm run dev"
echo ""
echo "==> API: http://localhost:3000"
echo "==> Swagger: http://localhost:3000/docs"
echo "==> PostgreSQL: localhost:5432"
echo "==> Redis: localhost:6379"
echo "==> MongoDB: localhost:27017"
echo "==> RabbitMQ: localhost:5672"
echo "==> RabbitMQ Management: http://localhost:15672"
