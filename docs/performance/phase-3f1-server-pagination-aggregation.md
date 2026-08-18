# AURAFIN — FASE 3F.1

## Status de entrega

**PASS — PERF-HIGH-04 FIXED**

O caminho autenticado Supabase não chama mais `list()` para carregar o histórico integral. PF e PJ recebem uma página keyset e analytics agregados em centavos; os caminhos locais continuam compatíveis com o modo demo/importação.

## Auditoria de consumidores

| Área | Dependência auditada | Implementação 3F.1 |
| --- | --- | --- |
| PF extrato | lista, busca, tipo, período, totais | RPC keyset + analytics filtrados |
| PF overview | receitas, despesas, pró-labore, categorias | `get_personal_transaction_analytics` |
| PF relatórios/IRPF | períodos, categorias, export | analytics e CSV server-side |
| PF/PJ reconciliação | aportes PF, despesas pessoais PJ | analytics PJ e página protegida |
| PJ overview | faturamento, caixa, pró-labore, custos | `get_business_transaction_analytics` |
| PJ cash flow/DRE | receitas, despesas, impostos, períodos | analytics em centavos |
| PJ relatórios/contador | DRE e pacotes fiscais | analytics + CSV/JSON server-side |
| cartões/contas | página renderizada | somente registros da página; totais de conta/cartão permanecem nos repositórios próprios |

Filtros temporais usam `>= start_date` e `< end_date_exclusive`. A ordenação é sempre `transaction_date DESC, id DESC`; o cursor é o último registro da página. O limite é normalizado para 1–100, com padrão 50.

## Segurança

- RLS permanece habilitado; nenhuma policy anterior foi desabilitada.
- RPCs de transação são `SECURITY INVOKER`, `search_path` fixado e grants apenas para `authenticated`.
- PJ valida membership ativa por `auth.uid()` antes de retornar dados; chamadas cross-tenant são rejeitadas.
- A migration 0019 atualiza somente predicates de membership, preservando predicates RBAC por role.
- Nenhum `service_role`, segredo ou mudança de AAL2 foi introduzido no frontend.

## Evidência de performance

Baseline medido antes da mudança (benchmark 3F): PF 50k completo 128,680 ms; PJ 100k completo 3.796,375 ms. Payload sintético: PF 24.102.784 bytes; PJ 58.423.656 bytes.

Após a mudança, com 50k PF/100k PJ:

- PF página de 100: 25.988 bytes; chamada keyset 4,533 ms.
- PJ página de 100: 39.352 bytes; chamada keyset 3,728 ms.
- PF analytics: 4.138 bytes; chamada 111,876 ms.
- PJ analytics: 4.270 bytes; chamada 253,079 ms.

O browser não mantém o histórico completo; exportações são produzidas por RPC no PostgreSQL.

## Equivalência financeira

`node scripts/performance/financial-equivalence-benchmark.mjs` inseriu 50.000 PF e 100.000 PJ, incluindo registros deletados, datas repetidas e filtros half-open. A soma completa antiga (`SUM` por tipo) e os campos `total_receipts_cents`, `total_expenses_cents` e `balance_cents` dos RPCs foram **PASS**, diferença R$ 0,00. O teste também verificou limite 100, filtro de intervalo, `deleted_at` e cross-tenant.

## Gates

- SERVER PAGINATION PF: PASS
- SERVER PAGINATION PJ: PASS
- SERVER AGGREGATION PF: PASS
- SERVER AGGREGATION PJ: PASS
- FINANCIAL EQUIVALENCE: PASS (R$ 0,00)
- RLS: PASS
- CROSS-TENANT: PASS
- TYPECHECK/LINT: PASS
- BUILD: PASS
- NPM AUDIT: 0 high/critical
- PGTAP pós-migration 0001→0020: **108/108 PASS**
- Browser smoke (login, fallback, overflow, console): PASS; sem sessão autenticada não foi executado um teste destrutivo de criação de conta.

## Migrations

- `20260815000019_cached_tenant_membership_rls_performance.sql`
- `20260815000020_server_side_transaction_pagination_aggregation.sql`

## Files changed

- `src/App.tsx`
- `src/types.ts`
- `src/integrations/supabase/database.types.ts`
- `src/services/repositories/interfaces.ts`
- `src/services/repositories/supabase/SupabasePersonalTransactionRepository.ts`
- `src/services/repositories/supabase/SupabaseBusinessTransactionRepository.ts`
- `src/services/repositories/local/LocalPersonalTransactionRepository.ts`
- `src/services/repositories/local/LocalBusinessTransactionRepository.ts`
- `src/services/repositories/local/transactionRepositoryHelpers.ts`
- `src/components/PfTransactions.tsx`
- `src/components/PfOverview.tsx`
- `src/components/PfReportsView.tsx`
- `src/components/PfTaxPlanning.tsx`
- `src/components/PjOverview.tsx`
- `src/components/PjCashflow.tsx`
- `src/components/PjDreView.tsx`
- `src/components/PjReports.tsx`
- `src/components/PjAccounting.tsx`
- `src/components/PjAccountantHubView.tsx`
- `supabase/migrations/20260815000019_cached_tenant_membership_rls_performance.sql`
- `supabase/migrations/20260815000020_server_side_transaction_pagination_aggregation.sql`
- `supabase/tests/database/0019_cached_tenant_membership_performance_test.sql`
- `supabase/tests/database/0020_server_side_transaction_pagination_aggregation_test.sql`
- `scripts/performance/financial-equivalence-benchmark.mjs`

## Open findings

Nenhum finding bloqueante para PERF-HIGH-04. A suíte de browser autenticada completa (troca rápida de organização com contas reais e sessão restaurada) requer credenciais/sessão de teste e não foi simulada por submissão de formulário; a autorização equivalente foi coberta no SQL/RLS e pelo `scopedRequestGuard`.

## Final decision

**GO para Fase 3F.1.** Não iniciar Fase 3G, não criar commit e não fazer deploy.
