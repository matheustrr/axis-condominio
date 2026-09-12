# 09 - Segurança

## Autenticação

JWT com expiração de 8 horas. Senhas nunca são persistidas em texto puro; bcrypt é usado para hash.

## Autorização

O papel e o `condominiumId` fazem parte do contexto autenticado. Rotas devem sempre verificar se o recurso pertence ao condomínio do usuário.

## Validação

Payloads externos devem ser validados antes de chegar à camada de persistência.

## Segredos

`JWT_SECRET` e credenciais de infraestrutura ficam em variáveis de ambiente. O arquivo `.env.example` contém apenas exemplos.

## Próximas proteções

- rate limiting por IP/usuário com Redis;
- refresh tokens e revogação quando necessário;
- política de senha;
- headers de segurança;
- logs sem dados sensíveis;
- auditoria de ações administrativas;
- revisão de autorização por endpoint;
- backup e criptografia em produção.
