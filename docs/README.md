# Documentação do Axis Condomínio

Esta pasta é a fonte de verdade técnica do projeto. A documentação deve evoluir junto com o código.

## Índice

- [01 - Visão geral](./01-visao-geral.md)
- [02 - Arquitetura](./02-arquitetura.md)
- [03 - Backend](./03-backend.md)
- [04 - Banco de dados](./04-banco-de-dados.md)
- [05 - API](./05-api.md)
- [06 - Fluxos de negócio](./06-fluxos-de-negocio.md)
- [07 - Infraestrutura](./07-infraestrutura.md)
- [08 - Frontend](./08-frontend.md)
- [09 - Segurança](./09-seguranca.md)
- [10 - Testes e qualidade](./10-testes.md)
- [11 - Operação e deploy](./11-operacao.md)
- [12 - Roadmap](./12-roadmap.md)

## Regra de documentação

Cada nova funcionalidade deve explicar: objetivo, domínio, telas/endpoints, dados persistidos, regras de negócio, dependências, eventos, erros esperados e como testar.

## Ambientes

- Desenvolvimento: Docker Compose + execução local do backend/frontend.
- Homologação: mesma arquitetura, com variáveis e recursos separados.
- Produção: containers, PostgreSQL gerenciado, Redis, MongoDB e RabbitMQ gerenciados ou isolados.

## Princípio arquitetural

O sistema começa como **monólito modular**. Redis, MongoDB e RabbitMQ são componentes de infraestrutura com responsabilidades claras; eles não transformam automaticamente o projeto em microsserviços. A extração de serviços será feita somente quando houver necessidade real.
