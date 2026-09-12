# Administração de Condomínio

Sistema de administração de condomínio.

## Stack

- Backend: Node.js + TypeScript + Fastify
- Frontend: React + TypeScript
- PostgreSQL: dados transacionais e relacionais
- Redis: cache, sessões, rate limiting e locks
- MongoDB: auditoria, histórico e documentos flexíveis
- RabbitMQ: processamento assíncrono e notificações

## Arquitetura

Começaremos como um **monólito modular**, separando os domínios internamente. A extração para serviços independentes só acontecerá quando houver necessidade real de escala ou isolamento.

## Primeira etapa

A primeira entrega será a fundação do backend e da infraestrutura local, seguida pelos módulos de condomínio, blocos, unidades e moradores.
