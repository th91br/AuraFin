# AuraFin — Real Data Audit

## Runtime policy

- Dados financeiros autenticados são carregados dos repositórios Supabase, com RLS e escopo por `auth.uid()` (PF) ou `organization_id` + membership ativa (PJ).
- `localStorage` permanece somente para sessão Supabase, preferência de organização e modo demo local explicitamente habilitado com `DEV` + `VITE_ENABLE_DEMO_MODE=true`.
- Fixtures em `src/data.ts` são importadas dinamicamente apenas pelo reset de demo; não fazem parte da hidratação normal.
- Telas sem registros exibem `Nenhum dado disponível`; não são preenchidas com valores sintéticos.

## Classificação final

### RUNTIME — REMOVE/FIX

- Dashboards e módulos PF/PJ que exibiam saldos, cartões, faturas, DRE, inadimplência, documentos ou tendências fixas.
- Fallbacks de cartões/metas (últimos quatro dígitos, datas, limites e valores monetários).
- CNPJ/chave Pix fixa no módulo de cobrança.
- Claims de persistência `Local-First` na UI/documentação.

### TEST ONLY — ACCEPTED

- `src/data.ts` e `StorageRepository.resetToDemo()` — fixtures de demonstração, acessíveis somente em modo dev explícito.
- `supabase/tests/database/*`, `scripts/performance/*` e scripts de restore/benchmark — dados sintéticos isolados para testes e performance.
- Templates textuais de cobrança, placeholders de formulários e nomes de categorias — não são fontes financeiras.

## Origens auditadas e classificação

### RUNTIME — REMOVE/FIX (corrigido)

- `src/data.ts`: arrays `initialTransactions`, `initialAccounts`, `initialCreditCards`, `initialProjects`, `initialDefaulters` e demais coleções eram a origem dos dados sintéticos. Permanecem somente como fixture de demo e não são importados estaticamente pelo runtime.
- `src/App.tsx` e `src/services/storage/storageRepository.ts`: hidratação e persistência local de transações/entidades; agora só executam quando `DEV && VITE_ENABLE_DEMO_MODE=true`.
- Módulos PJ (`PjOverview`, `PjReports`, `PjDreView`, `PjCashflow`, `PjBillingView`, `PjCardsView`, `PjCollections`, `PjManagement`, `PjProjectsView`, `PjReceivablesPayables`, `PjRunwayView`, `PjBreakEvenView`): removidos KPIs, gráficos, documentos, cards, faturas, DRE e tendências fixos; dados vêm dos analytics/listas Supabase ou empty state.
- Módulos PF (`PfOverview`, `PfReports*`, `PfTransactions`, `PfCards`, `PfAccounts`, `PfBudget`, `PfPlanning`, `PfEmergencyReserveView`, `PfTaxPlanning`, `PfGoalsView`, `PfDebtsView`, `PfInvestmentsView`, `PfRecurrences`, `PfWealth`): removidos valores/trends fixos e adicionados estados vazios quando não existe fonte real.
- `AddCreditCardModal`, `BillingModal`, `ProjectModal`, repositórios Supabase e importadores legados: removidos defaults de instituição, bandeira, final do cartão, datas, limites, metas e valores.
- `PjDefaulters`, `PjDocumentsView`, `RightRail` e `AuraCards`: removidos CNPJ/Pix, documentos e cartões fictícios; campos ausentes aparecem como não informados.

### TEST ONLY — ACCEPTED

- `src/data.ts` e `StorageRepository.resetToDemo()`: fixtures de demonstração, acessíveis somente em modo dev explícito.
- `supabase/tests/database/*`, `scripts/performance/*` e scripts de restore/benchmark: dados sintéticos isolados para testes e performance.
- Templates textuais de cobrança, placeholders de formulários, nomes de categorias, `logger.sample` e previews públicos sem valores: não são fontes financeiras.
- Botões de cenário em `PjBreakEvenView`/`PjRunwayView`: simulações derivadas de dados reais, rotuladas e sem persistência.

### Busca final por termos

`mock`, `fake`, `demo`, `dummy`, `sample`, `fixture`, `placeholder` e `hardcoded` foram classificados como `RUNTIME — REMOVE/FIX` quando ligados a dados financeiros, e `TEST ONLY — ACCEPTED`/`UI-INFRA` quando ligados a fixtures, testes, templates, placeholders ou infraestrutura sem valor financeiro.

## Verificações

- TypeScript: `npm run lint` — PASS.
- Build: `npm run build` — PASS.
- Dependências: `npm audit --audit-level=high` — 0 vulnerabilidades.
- Bundle normal não contém os valores financeiros sintéticos; o único chunk de fixtures é `data-*.js`, referenciado apenas pelo caminho dinâmico de demo.
- Nenhuma migration ou dado Supabase de produção foi alterado nesta auditoria.
