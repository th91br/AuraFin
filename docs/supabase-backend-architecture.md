# Documentação Técnica: Arquitetura de Backend Supabase AuraFin (Fase 1)

Este documento de arquitetura especifica a especificação do backend do **AuraFin** construído sobre **Supabase, PostgreSQL, Supabase Auth e Row Level Security (RLS)**.

---

## 🏛️ Visão Geral da Arquitetura

```
+-----------------------------------------------------------------------------------+
|                                  AuraFin Frontend                                 |
|                       React 19 + TypeScript + Local-First UI                      |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        StorageRepository (Interface Local)                        |
|        getTransactions(), saveTransactions(), getAccounts(), getCards(), etc.     |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v (Fase 1: Ativo)                                   v (Fase 2: Preparado)
+-------------------------------+                   +-------------------------------+
|         LocalStorage          |                   |     Supabase Client Singleton |
|      (aurafin_schema_v4)      |                   | (src/integrations/supabase)   |
+-------------------------------+                   +-------------------------------+
                                                                    |
                                                                    v
                                                    +-------------------------------+
                                                    |  Supabase PostgreSQL (Cloud)  |
                                                    |   - Row Level Security (RLS)  |
                                                    |   - Profiles (user_id)        |
                                                    |   - Orgs (organization_id)    |
                                                    +-------------------------------+
```

---

## 🔑 Autenticação e Multi-Tenancy

### 1. Pessoa Física (PF) — Isolamento por Usuário (`user_id`)
- **Regra**: Todo registro financeiro pessoal pertence exclusivamente a um `user_id` (`auth.uid() = user_id`).
- **Segurança RLS**: Políticas de `SELECT`, `INSERT`, `UPDATE` e `DELETE` utilizam `auth.uid() = user_id`.
- **Tabelas**: `profiles`, `personal_accounts`, `personal_transactions`, `personal_credit_cards`, `personal_card_invoices`, `recurrence_rules`, `budgets`, `goals`, `goal_contributions`, `emergency_reserves`, `debts`, `debt_payments`, `assets`, `asset_valuations`, `investments`, `investment_events`, `tax_metadata`.

### 2. Pessoa Jurídica (PJ) — Isolamento Multi-Tenant por Organização (`organization_id`)
- **Regra**: Todo registro financeiro corporativo pertence a uma organização (`organization_id`). O acesso é concedido exclusivamente a usuários com membership ativa em `organization_members`.
- **Função Helper SQL**: `public.is_organization_member(org_id uuid)` valida o pertencimento de forma performática e segura.
- **Roles Suportadas**: `owner`, `admin`, `finance`, `accountant`, `viewer`.
- **Criação Atômica**: `create_organization_with_owner(org_name, legal_name, tax_id)` cria a empresa e atribui o criador como `owner` na mesma transação PostgreSQL.
- **Tabelas**: `organizations`, `organization_members`, `business_accounts`, `business_transactions`, `clients`, `suppliers`, `corporate_cards`, `corporate_card_invoices`, `receivables`, `payables`, `invoices`, `projects`, `cost_centers`, `tax_records`, `partners`, `partner_transactions`, `reconciliations`, `reimbursements`, `defaulters`, `collection_events`, `monthly_closings`.

---

## 🗺️ Mapa de Mapeamento: Entidade Local → Tabela Supabase (Para a Fase 2)

| Entidade no Frontend (`src/types.ts`) | Fonte Atual (`StorageRepository`) | Tabela Supabase PostgreSQL | Escopo RLS |
| :--- | :--- | :--- | :--- |
| `Account` (PF) | `getAccounts()` | `public.personal_accounts` | `auth.uid() = user_id` |
| `Account` (PJ) | `getAccounts()` | `public.business_accounts` | `is_organization_member(organization_id)` |
| `Transaction` (PF) | `getTransactions()` | `public.personal_transactions` | `auth.uid() = user_id` |
| `Transaction` (PJ) | `getTransactions()` | `public.business_transactions` | `is_organization_member(organization_id)` |
| `CreditCard` (PF) | `getCreditCards()` | `public.personal_credit_cards` | `auth.uid() = user_id` |
| `CreditCard` (PJ) | `getCreditCards()` | `public.corporate_cards` | `is_organization_member(organization_id)` |
| `Goal` | `getGoals()` | `public.goals` | `auth.uid() = user_id` |
| `Debt` | `getDebts()` | `public.debts` | `auth.uid() = user_id` |
| `Asset` | `getAssets()` | `public.assets` | `auth.uid() = user_id` |
| `Customer` | `getCustomers()` | `public.clients` | `is_organization_member(organization_id)` |
| `Supplier` | `getSuppliers()` | `public.suppliers` | `is_organization_member(organization_id)` |
| `Project` | `getProjects()` | `public.projects` | `is_organization_member(organization_id)` |
| `CostCenter` | `getCostCenters()` | `public.cost_centers` | `is_organization_member(organization_id)` |
| `Defaulter` | `getDefaulters()` | `public.defaulters` | `is_organization_member(organization_id)` |

---

## 📁 Estrutura das Migrations SQL (`supabase/migrations/`)

1. `20260810000001_core_auth_profiles_orgs.sql`: Perfis, organizações, membros, triggers de auth, helper `is_organization_member` e RPC `create_organization_with_owner`.
2. `20260810000002_pf_financial_core.sql`: Contas, cartões, faturas, recorrências e transações PF.
3. `20260810000003_pf_planning_assets_investments.sql`: Orçamentos, metas, reserva, dívidas, bens, investimentos e IRPF.
4. `20260810000004_pj_financial_core.sql`: Contas bancárias, clientes, fornecedores, recebíveis, pagáveis, notas e transações PJ.
5. `20260810000005_pj_cards_projects_governance.sql`: Cartões corporativos, projetos, centros de custo, impostos, sócios, conciliações PF ↔ PJ, inadimplência e fechamento mensal.
6. `20260810000006_documents_storage_rls.sql`: Metadados de documentos, vínculos flexíveis e bucket privado `financial-documents`.
7. `20260810000007_indexes_and_performance.sql`: Índices de alta performance em chaves estrangeiras, datas, status e contextos.
