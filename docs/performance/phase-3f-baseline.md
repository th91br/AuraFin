# AuraFin — Fase 3F — Baseline de Performance

Data da coleta: 2026-08-15  
Ambiente: local, Windows, Node.js 22.20.0, npm 11.14.1  
Commit/worktree: árvore limpa antes da coleta  
Escopo: React 19 + TypeScript + Vite + Supabase/PostgreSQL

## Regras da coleta

- Nenhum arquivo de aplicação, migration ou configuração havia sido alterado quando este baseline foi coletado.
- Não foram usados dados financeiros reais.
- Nenhum teste de carga foi apontado para staging ou produção.
- Números indisponíveis estão explicitamente marcados; não foram estimados.

## Frontend — build de produção

Comando: `npm run build`

| Métrica | Baseline |
| --- | ---: |
| Módulos transformados | 1.813 |
| Tempo reportado pelo Vite | 25,92 s |
| Tempo de parede do comando | 28,478 s |
| JavaScript inicial | 975.951 bytes (953,08 KiB) |
| JavaScript inicial gzip | 221,67 kB |
| CSS inicial | 95.171 bytes (92,94 KiB) |
| CSS inicial gzip | 14,26 kB |
| Chunks JavaScript | 1 |
| Route chunks | 0 |

O Vite emitiu o alerta de chunk superior a 500 kB. O código-fonte tem 120 arquivos TypeScript/TSX/CSS, 24.755 linhas e nenhum `React.lazy` ou `import()` dinâmico. `src/App.tsx` importa eager todas as telas PF, PJ e modais; assim, o visitante não autenticado baixa também áreas que não pode renderizar.

## Frontend — render inicial local

O preview do build de produção foi aberto em `http://localhost:4173/`.

| Métrica | Baseline |
| --- | ---: |
| Nós DOM na landing page | 129 |
| Scripts locais carregados | 1 |
| Stylesheets locais carregados | 1 |
| Stylesheets externos | 1 (Google Fonts) |

O único script era `assets/index-DlDljrMR.js`, confirmando que todo o frontend estava no caminho inicial. LCP, INP e CLS não foram coletados: a superfície de automação disponível não expôs Performance Timeline. Eles permanecem `NOT AVAILABLE`, sem substituição por estimativa.

## Data fetching — inventário estático

O projeto não possui `@tanstack/react-query`/React Query instalado. O fetching é feito por effects e repositories Supabase.

| Métrica | Baseline |
| --- | ---: |
| Ocorrências de `.select('*')` | 26 |
| Ocorrências de `.range()` | 0 |
| Ocorrências de `.limit()` | 0 |
| Ocorrências de `.order()` | 10 |
| Ocorrências de `.rpc()` no frontend | 1 (`health_check`) |

Ao autenticar, `AppContent` dispara em paralelo 10 leituras PF (contas, transações, cartões, recorrências, orçamento, metas, reserva, dívidas, ativos e investimentos). Com organização ativa, dispara mais 2 leituras PJ (contas e transações). Esse total é um inventário do call chain, não uma captura de rede.

### Ownership de queries implementadas

| Repository/serviço | Tabela/RPC | Filtro de tenant | Ordenação/paginação | Cardinalidade esperada |
| --- | --- | --- | --- | --- |
| PersonalAccountRepository | `personal_accounts` | `user_id`, `status=active` | `created_at desc`; sem paginação | baixa |
| PersonalTransactionRepository | `personal_transactions` | `user_id`, `deleted_at is null` | `transaction_date desc`; sem paginação | muito alta |
| BusinessAccountRepository | `business_accounts` | `organization_id`, `status=active` | `created_at desc`; sem paginação | baixa |
| BusinessTransactionRepository | `business_transactions` | `organization_id`, `deleted_at is null` | `transaction_date desc`; sem paginação | muito alta |
| CreditCardRepository | `personal_credit_cards` | `user_id` | `created_at desc`; sem paginação | baixa |
| RecurrenceRepository | `recurrence_rules` | `user_id` | `next_due_date asc`; sem paginação | média |
| BudgetRepository | `budgets` | `user_id`, `period_month` | sem paginação | baixa por mês |
| GoalRepository | `goals`, `goal_contributions` | `user_id` | `created_at desc`; sem paginação | média |
| DebtRepository | `debts`, `debt_payments` | `user_id` | `created_at desc`; sem paginação | média |
| AssetRepository | `assets` | `user_id` | `created_at desc`; sem paginação | média |
| InvestmentRepository | `investments` | `user_id` | `created_at desc`; sem paginação | média |
| OrganizationContext | `organization_members` | `user_id`/`organization_id` | sem paginação | baixa |
| Legacy import PF/PJ | múltiplas tabelas | `user_id` ou `organization_id` | por registro; sem batch | alta durante importação |
| DocumentStorageService | `documents`, `document_links`, Storage | path PF/PJ e dono | URL assinada sob demanda | média/alta |
| HealthService | `health_check` | sessão/RLS | N/A | unitária |

### Gargalos observados antes da correção

1. As listas de transações PF e PJ transferem todo o histórico com `select('*')`, sem limite ou cursor, e alimentam agregações no navegador.
2. As tabelas de movimentações renderizam o resultado filtrado inteiro, sem paginação de UI.
3. A troca rápida de organização não descarta a promise da organização anterior. Uma resposta tardia da Org A pode substituir o estado visível já selecionado para a Org B, apesar de cada consulta continuar protegida por RLS.
4. Não há cache/deduplicação compartilhado; cada invalidação é manual e algumas ações recarregam listas completas.
5. Exportações CSV são montadas em memória a partir do array carregado no browser.

## Banco de dados — inventário estático

A cadeia contém 17 migrations (`0001` a `0017`). A leitura do SQL encontrou 41 declarações de tabela, 44 declarações de índice, 87 declarações de policy, 17 definições de função e 1 view. Esses números descrevem o histórico de migrations; objetos substituídos/removidos fazem com que não sejam uma contagem garantida do schema efetivo.

Índices já existentes e diretamente alinhados às queries críticas:

- `idx_personal_tx_user_date (user_id, transaction_date desc)`;
- `idx_business_tx_org_date (organization_id, transaction_date desc)`;
- `idx_org_members_user_org (user_id, organization_id, status)`;
- `idx_receivables_org_due (organization_id, due_date, status)`;
- `idx_payables_org_due (organization_id, due_date, status)`;
- índices de tenant/status para contas, cartões, clientes, fornecedores, projetos, faturas e conciliações.

A view `public.v_defaulters` preserva `security_invoker = true`, filtra recebíveis vencidos/abertos e usa join de cliente por chave primária. Nenhum índice novo está justificado apenas pela leitura estática.

### Benchmark e query plans

`NOT AVAILABLE` neste baseline. O Docker Desktop não estava ativo; o pipe do engine não existia e a sessão não teve permissão para iniciar `com.docker.service`. Por isso não foram executados:

- `supabase db reset`;
- carga sintética PF 100/5k/50k e PJ 500/25k/100k;
- `ANALYZE`, `EXPLAIN (ANALYZE, BUFFERS)`;
- pgTAP;
- benchmarks das RPCs financeiras;
- `pg_stat_statements`/`pg_stat_user_indexes`.

Nenhuma migration de performance será criada sem esses planos e medições.

## Baseline de segurança e isolamento

- RLS permanece habilitado nas tabelas financeiras.
- As queries PF incluem `user_id`; as queries PJ incluem `organization_id`.
- `v_defaulters` mantém `security_invoker = true`.
- As RPCs financeiras de `0016` mantêm AAL2, RBAC, advisory locks e idempotência.
- O risco de resposta tardia cross-org está na aceitação do resultado pelo estado React, não em bypass de RLS.

## Budgets derivados do baseline

Estes budgets são guardrails de regressão para esta fase, derivados do artifact atual e da correção proposta:

- JavaScript inicial: reduzir de forma material o baseline de 975.951 bytes e manter abaixo de 500 kB minificado.
- Maior chunk: nenhum chunk próprio da aplicação acima de 500 kB minificado.
- Rotas/telas não iniciais: fora do caminho JavaScript da landing page.
- Troca de tenant: zero aceitação de resposta obsoleta.
- Listas financeiras crescentes: nenhuma renderização DOM ilimitada.
- Banco: zero índice novo sem `EXPLAIN` antes/depois.

## Estado do baseline

Frontend build: `PASS WITH PERFORMANCE WARNING`  
Data fetching: `FAIL` para escala por full-history loads e ausência de paginação  
Cross-tenant response safety: `FAIL` na camada de estado React  
Database runtime: `NOT AVAILABLE` por bloqueio local  
Security controls: `PRESERVED` na inspeção estática

## Adendo — baseline de banco coletado antes da Migration 0019

O registro inicial acima preserva a indisponibilidade do Docker no primeiro instante da coleta. Ainda antes de qualquer alteração de schema, o engine local foi iniciado e a cadeia 0001–0017 foi restaurada. Este adendo substitui o estado `NOT AVAILABLE` apenas para o baseline de banco.

O script `scripts/performance/database-query-benchmark.mjs` criou exclusivamente fixtures sintéticas dentro de uma transação e executou `ROLLBACK` ao final. Nenhum ambiente remoto e nenhum dado financeiro real foram usados. A suíte existente também foi executada antes da mudança: 3 arquivos, 74 testes pgTAP, todos aprovados.

| Perfil/query com RLS | Linhas | Execução baseline | Payload JSON |
| --- | ---: | ---: | ---: |
| PF full list small | 100 | 0,905 ms | não medido |
| PF full list medium | 5.000 | 7,409 ms | 2.402.778 bytes |
| PF full list large | 50.000 | 128,680 ms | 24.102.784 bytes |
| PF keyset page | 100 de 50.000 | 1,387 ms | projeção reduzida |
| PF aggregate anual | 24.752 de 50.000 | 73,860 ms | agregado |
| PJ full list small | 500 | 17,562 ms | não medido |
| PJ full list medium | 25.000 | 1.646,453 ms | 14.593.650 bytes |
| PJ full list large | 100.000 | 3.796,375 ms | 58.423.656 bytes |
| PJ keyset page | 100 de 100.000 | 7,624 ms | projeção reduzida |
| PJ aggregate anual | 49.859 de 100.000 | 1.471,222 ms | agregado |
| `v_defaulters` | 100 de 100.000 recebíveis | 26,761 ms | projeção da view |

O plano PJ large acumulou aproximadamente 300 mil buffer hits porque `is_organization_member` era avaliada por linha. O comparativo controlado, no mesmo banco e na mesma transação, mediu 1.204,744 ms na policy vigente, 1.584,413 ms com wrapper escalar e 61,535 ms com o conjunto de organizações materializado uma vez. Somente o terceiro candidato demonstrou benefício, de 94,9%, e seguiu para a Migration 0019.

Estado corrigido do baseline de banco: `FAIL` para overhead de RLS PJ em escala; planos e evidência disponíveis. A migration de auth `0018` já existente no worktree manteve seu próprio versionamento; a otimização foi numerada como `0019` para evitar colisão de versão.
