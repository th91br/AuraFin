# AuraFin — Fase 3F — Performance & Scalability

Data: 2026-08-15  
Ambiente de execução: local  
Dados: exclusivamente sintéticos e descartados por `ROLLBACK`

## Sumário executivo

```text
AURAFIN — FASE 3F — PERFORMANCE & SCALABILITY

STATUS: FAIL — NO-GO PARA PRODUÇÃO

PERF HIGH: 4
PERF MEDIUM: 3
PERF LOW: 1
HIGH OPEN: 1

DATABASE: PASS PARA O ESCOPO PERFILADO
FRONTEND: PASS
DATA FETCHING: FAIL
SCALABILITY: FAIL PARA PF/PJ LARGE
```

A fase produziu ganhos materiais e comprovados no banco e no frontend sem relaxar RLS, RBAC, AAL2, locks, idempotência ou Storage. O NO-GO é deliberado: `personal_transactions` e `business_transactions` continuam sendo lidas como histórico completo pelo browser, sem paginação de servidor nem agregação coerente no Postgres. Colocar apenas um `limit` ocultaria registros e produziria saldos, DRE e relatórios incorretos; essa alternativa foi rejeitada.

## Baseline e método

O baseline completo está em `docs/performance/phase-3f-baseline.md`. Antes das mudanças foram medidos build, artifact, query inventory, cargas PF/PJ, planos com `EXPLAIN (ANALYZE, BUFFERS)`, overhead de RLS e `v_defaulters`.

Os scripts de banco abrem uma transação, criam fixtures sintéticas, executam `ANALYZE` e planos sob JWT `authenticated`, e encerram com `ROLLBACK`. Nenhum teste de carga foi executado em staging ou produção.

Classificação usada no ambiente local:

| Faixa | Interpretação |
| --- | --- |
| FAST | até 10 ms |
| ACCEPTABLE | acima de 10 ms até 100 ms |
| SLOW | acima de 100 ms até 1.000 ms |
| CRITICAL | acima de 1.000 ms |

Essas faixas são critérios comparativos locais, não SLA de produção.

## Findings

| ID | Severidade | Área | Gargalo e causa | Antes | Depois | Status |
| --- | --- | --- | --- | ---: | ---: | --- |
| PERF-HIGH-01 | HIGH | Frontend | Todas as telas e modais no único bundle inicial | 975.951 B; 221,67 kB gzip; 1 chunk | grafo inicial 538.447 B; 149.905 B gzip; maior chunk 219.365 B | FIXED |
| PERF-HIGH-02 | HIGH | Database/RLS | `is_organization_member` avaliada por linha nas policies PJ | 1.204,744 ms no comparativo controlado | 61,535 ms | FIXED |
| PERF-HIGH-03 | HIGH | Tenant state | Promise tardia da Org A podia substituir o estado visual da Org B | resultado obsoleto aceito | guard por `organizationId` e teste de regressão | FIXED |
| PERF-HIGH-04 | HIGH | Data fetching | Histórico PF/PJ completo transferido e agregado no browser | 24,10 MB em PF 50k; 58,42 MB em PJ 100k no baseline | projeção de colunas e DOM limitado, mas request ainda sem paginação de servidor | OPEN |
| PERF-MEDIUM-01 | MEDIUM | Render | Tabela PF renderizava todo o resultado filtrado | DOM proporcional ao histórico | 50 linhas por página | FIXED |
| PERF-MEDIUM-02 | MEDIUM | Payload | 26 ocorrências de `select('*')` | 26 | 0 | FIXED |
| PERF-MEDIUM-03 | MEDIUM | Legacy import | Upsert por registro nos imports PF/PJ | um request por item | inalterado; fluxo legado está desabilitado por feature flag | OPEN |
| PERF-LOW-01 | LOW | Delivery | Google Fonts permanece externo | 1 stylesheet externo | inalterado | ACCEPTED |

Não foi encontrado N+1 crítico no caminho normal do produto, loop de fetch infinito, criação repetida do client Supabase ou subscription Realtime sem cleanup. A instância Supabase permanece singleton.

## Database

### Resultado consolidado

```text
TABLES PROFILED: 5
CRITICAL QUERIES PROFILED: 11
EXPLAIN PLANS REVIEWED: 22 before/after ou candidatos
SLOW QUERIES FOUND: 2
SLOW QUERIES FIXED: 2
NEW INDEXES: 0
UNJUSTIFIED INDEXES: 0
SEQUENTIAL SCAN ISSUES: 0
RLS PERFORMANCE ISSUES: 1 encontrado, 1 corrigido
RPC PERFORMANCE: NOT MEASURED; invariantes cobertas por pgTAP
```

As tabelas diretamente exercitadas foram `personal_transactions`, `business_transactions`, `receivables`, `clients` e `organization_members`. Os índices históricos de tenant/data já suportavam as consultas; criar novos índices não foi justificado pelos planos. Seq Scan em tabelas pequenas foi aceito, e nenhum índice histórico foi removido.

### RLS PJ — comparação causal

O benchmark de candidatos executou as três formas sobre as mesmas 100 mil transações, no mesmo banco e na mesma transação:

| Policy candidate | Execução |
| --- | ---: |
| helper de membership por linha | 1.204,744 ms |
| wrapper escalar com `SELECT` | 1.584,413 ms |
| conjunto de organizações materializado uma vez | 61,535 ms |

Resultado causal: redução de 94,9%. O wrapper escalar foi rejeitado por piorar 31,5% o baseline controlado.

A Migration 0019 criou `current_user_organization_ids()` como função SQL `STABLE`, `SECURITY DEFINER`, com `search_path` vazio, sem argumentos controláveis pelo cliente e filtro exclusivo por `(SELECT auth.uid())` e membership ativa. `PUBLIC` e `anon` não podem executá-la; somente `authenticated` recebeu `EXECUTE`. Vinte policies públicas passaram a usar o conjunto de tenants uma vez por statement. Nenhuma policy de Storage foi alterada.

### Query plans after

Como tempo local varia com cache e carga da máquina, foram preservadas duas execuções pós-migration. A verificação final apresentou:

| Query | Baseline | Verificação final | Delta |
| --- | ---: | ---: | ---: |
| PJ full 100k | 3.796,375 ms | 149,243 ms | −96,1% |
| PJ aggregate anual | 1.471,222 ms | 42,088 ms | −97,1% |
| PJ keyset 100 | 7,624 ms | 1,857 ms | −75,6% |
| `v_defaulters` 100 | 26,761 ms | 29,346 ms | +9,7%, dentro da variação e sem mudança da view |

Uma execução anterior pós-migration mediu 104,803 ms no full PJ 100k e 31,739 ms no agregado. A evidência usada para atribuir causalidade continua sendo o comparativo controlado de 1.204,744 ms contra 61,535 ms.

O plano PJ agora mostra um hashed SubPlan executado uma vez e aproximadamente 100 mil buffer hits no full scan, em vez de cerca de 300 mil hits com helper por linha. `v_defaulters` preservou `security_invoker = true` e seu índice de organização/vencimento.

As RPCs financeiras de cross-context não tiveram latência isolada nesta fase. Seus testes de segurança e invariantes passaram; não se infere desempenho a partir do tempo total do pgTAP.

## Data fetching e isolamento

```text
N+1 FOUND: 1, somente legacy import
N+1 FIXED: 0
CRITICAL N+1 OPEN: 0
DUPLICATE REQUESTS FOUND: 0 na inspeção estática
DUPLICATE REQUESTS FIXED: 0
OVERFETCH FOUND: 26
OVERFETCH FIXED: 26
SERVER PAGINATION COVERAGE: 0/2 listas críticas de transações
UI PAGINATION COVERAGE: 1/1 tabela crescente implementada
CROSS-TENANT RESPONSE: BLOCKED — PASS
```

Os repositories agora projetam apenas as colunas consumidas. O upload de documentos também passou a usar os nomes reais do schema, `file_name` e projeção explícita, evitando retorno integral do registro.

`createScopedRequestGuard` vincula cada effect assíncrono ao usuário ou organização que o iniciou. Cleanup por troca de scope ou unmount invalida a resposta, e o setter só executa quando o scope ainda é o mesmo. O teste reproduz a ordem adversa Org B → resposta B → resposta atrasada A e confirma que apenas B é aceita.

Não existe React Query no `package.json`. Portanto query keys, `staleTime`, `gcTime`, retry e invalidação React Query são `NOT APPLICABLE`; a fase não adicionou uma dependência nem fingiu que ela já fazia parte da arquitetura. As 10 leituras PF e 2 PJ permanecem independentes e paralelas.

### Bloqueio aberto

As funções `list` de transações não têm `.range`, `.limit` ou cursor. A UI PF limita o DOM e executa filtros de data corretos para hoje, 7 dias, 30 dias, mês atual e mês anterior, mas o array fonte ainda contém o resultado completo recebido do PostgREST.

A correção de produção requer uma mudança coerente, não um cap arbitrário:

1. keyset por `transaction_date, id` nos repositories PF e PJ;
2. busca e filtros no Postgres;
3. agregações server-side que preservem saldos, DRE, cash flow, cartões e relatórios;
4. export assíncrono ou paginado sem depender do array do DOM;
5. testes de equivalência em centavos e limites de data `>= start` e `< next_period`.

Até essa arquitetura existir, PERF-HIGH-04 permanece aberto e a Fase 3F não atende o critério de GO.

## Frontend e bundle

Foram criadas 51 fronteiras lazy apenas para telas e modais, além de `Suspense` com fallback acessível. Modais só montam quando abertos. Durante a restauração da sessão, o app mostra o fallback e não solicita o shell PF/PJ antes de saber se há usuário autenticado.

React, Supabase e Lucide foram separados em chunks estáveis para cache e para evitar um artifact monolítico. O agrupamento de ícones reduziu a fragmentação de 98 para 57 chunks sem reintroduzir conteúdo de produto no entry.

```text
INITIAL BUNDLE BEFORE: 975.951 bytes; 221,67 kB gzip
INITIAL GRAPH AFTER: 538.447 bytes; 149.905 bytes gzip
DELTA INITIAL RAW: −44,9%
DELTA INITIAL GZIP: −32,4%

LARGEST CHUNK BEFORE: 975.951 bytes
LARGEST CHUNK AFTER: 219.365 bytes
DELTA LARGEST CHUNK: −77,5%

ENTRY CHUNK AFTER: 94.853 bytes
JAVASCRIPT CHUNKS AFTER: 57
LAZY PRODUCT BOUNDARIES: 51
DEAD CODE REMOVED: 0
RENDER HOTSPOTS FIXED: 1, tabela PF
```

O guardrail automatizado exige entry ≤ 450 KiB, grafo inicial ≤ 600 KiB, qualquer chunk ≤ 500 KiB e CSS inicial ≤ 120 KiB. Resultado final: PASS. O CSS ficou em 95.491 bytes.

O preview de produção foi aberto em `http://localhost:4173/`. A validação final encontrou a tela de login completa, 146 nós DOM, fallback encerrado, um script entry, sem overflow horizontal e sem preload de `AuraShell` para visitante não autenticado. A automação disponível não expôs Performance Timeline; LCP, INP, CLS e tempos de rede permanecem `NOT AVAILABLE`.

## Dashboards e request budget

| Área | Requests implementadas | Payload de rede before/after | Latência de rede before/after |
| --- | ---: | --- | --- |
| PF autenticado | 10 leituras paralelas | NOT AVAILABLE sem sessão QA capturável | NOT AVAILABLE |
| PJ com organização | +2 leituras paralelas | NOT AVAILABLE sem sessão QA capturável | NOT AVAILABLE |

Os payloads sintéticos de full rows no banco atingiram 24,10 MB em PF 50k e 58,42 MB em PJ 100k no baseline. Eles demonstram o risco de cardinalidade, mas não são apresentados como captura HTTP. O número de requests não foi reduzido porque não havia fetch duplicado comprovado; combiná-los sem uma API de agregação apenas criaria acoplamento.

Budget definido após o baseline:

- boot autenticado PF: no máximo as 10 fontes independentes existentes;
- ativação PJ: no máximo 2 requests adicionais de contas/transações;
- troca de tenant: zero resultado aceito do tenant anterior;
- lista crítica: página de até 100 registros após implementação server-side;
- nenhum `select('*')` no frontend.

## Escalabilidade

```text
PF 100 ROWS: PASS
PF 5K: CONDITIONAL — banco rápido, payload e browser ainda integrais
PF 50K: FAIL — 24,10 MB e full-history no browser

PJ 500: PASS
PJ 25K: CONDITIONAL — RLS corrigido, payload ainda integral
PJ 100K: FAIL — banco aceitável, 58,42 MB e full-history no browser

LIMITING FACTOR: estratégia de fetching/agregação no frontend, não o índice tenant/data
```

Não foram executados testes de concorrência de 1/5/10/25 usuários, nem foi feita afirmação sobre quantidade de usuários suportada. Capacidade de infraestrutura, plano Supabase, Supavisor, limites de conexão, plano Vercel, compressão/CDN real e observabilidade do ambiente permanecem `MANUAL / NOT VERIFIED`.

## Migrations e segurança

```text
NEW MIGRATIONS:
20260815000019_cached_tenant_membership_rls_performance.sql

LOCAL DB RESET: PARTIAL — migrations 0001–0019 applied; final container health check failed
MIGRATIONS 0001 → 0019: PASS
PGTAP: 83/83 PASS in prior healthy local run; final rerun blocked by container health
3E SECURITY REGRESSION: PASS
NEW INDEXES: 0
DATABASE TYPES: UPDATED; assinatura confirmada pelo generator local
```

Controles preservados:

- RLS continua habilitado;
- isolamento PF por `user_id` e PJ por membership ativa;
- roles e AAL2 não foram alterados;
- locks, idempotência e validações em centavos não foram alterados;
- `v_defaulters` continua `security_invoker`;
- policies e bucket de Storage não foram relaxados;
- nenhuma `service_role` foi introduzida no frontend;
- zero cache cross-user/cross-org foi adicionado.

## Quality gates

```text
TYPECHECK: PASS — tsc --noEmit
LINT: NOT CONFIGURED; o script npm lint executa somente TypeScript
BUILD: PASS — Vite production
NPM AUDIT: 0 vulnerabilities; 0 Critical; 0 High
PERFORMANCE GUARDS: 2/2 PASS
DATABASE BENCHMARK: PASS, execução reproduzível e rollback confirmado
PGTAP: 4 files; 83 tests; PASS in the prior healthy local run; post-reset rerun blocked by Docker health
BROWSER SMOKE: PASS
```

Scripts reproduzíveis:

- `scripts/performance/database-query-benchmark.mjs`;
- `scripts/performance/rls-policy-candidate-benchmark.mjs`;
- `scripts/performance/frontend-bundle-budget.mjs`;
- `scripts/performance/data-fetching-regression.test.ts`.

## Arquivos

Criados:

- `docs/performance/phase-3f-baseline.md`;
- `docs/performance/phase-3f-performance-scalability.md`;
- `scripts/performance/database-query-benchmark.mjs`;
- `scripts/performance/rls-policy-candidate-benchmark.mjs`;
- `scripts/performance/frontend-bundle-budget.mjs`;
- `scripts/performance/data-fetching-regression.test.ts`;
- `src/lib/scopedRequestGuard.ts`;
- `supabase/migrations/20260815000019_cached_tenant_membership_rls_performance.sql`;
- `supabase/tests/database/0019_cached_tenant_membership_performance_test.sql`.

Modificados:

- `src/App.tsx`, `src/components/PfTransactions.tsx`, `vite.config.ts`;
- `src/context/AuthContext.tsx`, `src/context/OrganizationContext.tsx`;
- `src/integrations/supabase/database.types.ts`;
- repositories Supabase PF/PJ com projeção de colunas;
- serviços de import legado e metadata de documentos.

Commits: nenhum. A árvore foi deixada sem commit para revisão do responsável.

## Decisão final

`NO-GO` para Production Go-Live enquanto PERF-HIGH-04 estiver aberto. Database, segurança, build e bundle estão aprovados no escopo medido; o bloqueio é a ausência de paginação e agregação server-side para histórico financeiro crescente.

A Fase 3G não foi iniciada.

Nota operacional: o reset final aplicou as migrations e falhou somente no health check do container; o ultimo resultado pgTAP saudavel foi 83/83 PASS.
