# 04 - Banco de dados

## Modelos principais

- `Condominium`: organização principal.
- `Block`: bloco pertencente ao condomínio.
- `Unit`: unidade/apartamento do bloco.
- `Resident`: morador vinculado à unidade.
- `User`: identidade autenticável e papel de acesso.
- `Notice`: comunicado.
- `Reservation`: reserva de área comum.
- `Incident`: ocorrência/manutenção.
- `Charge`: cobrança vinculada à unidade.

## Integridade

O PostgreSQL mantém as relações e usa `onDelete: Cascade` onde os dados dependem diretamente do pai. Índices e constraints evitam duplicidade de bloco/unidade e aceleram consultas por condomínio e datas.

## Reserva

Existe índice por condomínio e intervalo. A regra de conflito é: duas reservas da mesma área entram em conflito quando `startA < endB` e `endA > startB`, desde que nenhuma esteja cancelada.

## Financeiro

Valores usam `Decimal(12,2)`, evitando representar dinheiro como ponto flutuante no banco.

## Auditoria

Logs de auditoria ficam no MongoDB para manter o modelo transacional do PostgreSQL focado no domínio.

## Migrações

Alterações no schema devem gerar migration Prisma e ser revisadas antes de chegar à produção. Nunca editar o banco de produção manualmente como primeira opção.
