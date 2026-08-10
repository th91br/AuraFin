# AuraFin — PF Data Migration Map & Supabase Schema Architecture

Este documento de engenharia estabelece a especificação completa para a migração futura do **Contexto Pessoa Física (PF)** do AuraFin da persistência local-first (`StorageRepository` / LocalStorage) para o banco de dados **PostgreSQL no Supabase** com **Row Level Security (RLS)** e autenticação integrada.

---

## 🏗️ Visão Geral da Arquitetura Pré-Supabase

```
+-----------------------------------------------------------------------+
|                           UI (13 Páginas PF)                          |
|  PfOverview, PfTransactions, PfAccounts, PfCards, PfPlanning, etc.    |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                Services & Selectors (Regras de Negócio)               |
|      formatCurrencyBRL, formatDateISO, selectors.ts, money safety     |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                   StorageRepository (Abstração)                      |
|                  getTransactions(), saveTransactions()                 |
+-----------------------------------------------------------------------+
                                   |
              (Fase Atual)         |        (Fase Futura)
                   +---------------+---------------+
                   |                               |
                   v                               v
       +-----------------------+       +-----------------------+
       |     LocalStorage      |       |  Supabase PostgreSQL  |
       |  (aurafin_schema_v4)  |       |    (RLS + Auth UID)   |
       +-----------------------+       +-----------------------+
```

---

## 📋 Mapeamento de Entidades PF → Tabelas PostgreSQL

### 1. `profiles` (Usuários / Autenticação)
- **Entidade Atual**: Contexto de Usuário estático (`Thiago`)
- **Tabela Supabase**: `public.profiles`
- **Esquema de Dados**:
  ```sql
  create table public.profiles (
    id uuid references auth.users not null primary key,
    full_name text not null,
    avatar_url text,
    privacy_mode_default boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  ```
- **Políticas RLS**:
  - `select`: `auth.uid() = id`
  - `update`: `auth.uid() = id`

---

### 2. `accounts` (Contas & Carteiras PF)
- **Entidade Atual**: `Account` (interface em `src/types.ts`)
- **Repository Atual**: `StorageRepository.getAccounts()` / `saveAccounts()`
- **Tabela Supabase**: `public.accounts`
- **Esquema de Dados**:
  ```sql
  create table public.accounts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    type text check (type in ('corrente', 'poupanca', 'investimento', 'dinheiro', 'carteira_digital')) not null,
    institution text not null,
    balance_cents bigint default 0 not null,
    context text default 'PF' check (context in ('PF', 'PJ')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_accounts_user_context on public.accounts(user_id, context);
  ```
- **Políticas RLS**:
  - `all`: `auth.uid() = user_id`

---

### 3. `credit_cards` (Cartões de Crédito PF)
- **Entidade Atual**: `CreditCard`
- **Repository Atual**: `StorageRepository.getCreditCards()` / `saveCreditCards()`
- **Tabela Supabase**: `public.credit_cards`
- **Esquema de Dados**:
  ```sql
  create table public.credit_cards (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    institution text not null,
    limit_total_cents bigint not null,
    limit_used_cents bigint default 0 not null,
    current_invoice_cents bigint default 0 not null,
    closing_day integer not null check (closing_day between 1 and 31),
    due_day integer not null check (due_day between 1 and 31),
    context text default 'PF' check (context in ('PF', 'PJ')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_credit_cards_user_context on public.credit_cards(user_id, context);
  ```
- **Políticas RLS**:
  - `all`: `auth.uid() = user_id`

---

### 4. `transactions` (Movimentações PF — Entidade Central)
- **Entidade Atual**: `Transaction`
- **Repository Atual**: `StorageRepository.getTransactions()` / `saveTransactions()`
- **Tabela Supabase**: `public.transactions`
- **Esquema de Dados**:
  ```sql
  create table public.transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    context text default 'PF' check (context in ('PF', 'PJ')) not null,
    type text check (type in ('income', 'expense', 'transfer')) not null,
    title text not null,
    amount_cents bigint not null,
    date date not null,
    category text not null,
    sub_category text,
    account_id uuid references public.accounts(id) on delete set null,
    card_id uuid references public.credit_cards(id) on delete set null,
    project_id uuid,
    client_id uuid,
    supplier_id uuid,
    cost_center_id uuid,
    recurrence text check (recurrence in ('mensal', 'semanal', 'anual', 'unica')),
    attachment_url text,
    is_tax_deductible_pf boolean default false,
    tax_deduction_category text,
    is_personal_expense_in_pj boolean default false,
    is_paid_by_pf boolean default false,
    linked_transaction_id uuid references public.transactions(id) on delete set null,
    cross_context_id text,
    reimbursed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_transactions_user_date on public.transactions(user_id, date desc);
  create index idx_transactions_user_context_cat on public.transactions(user_id, context, category);
  create index idx_transactions_cross_context on public.transactions(cross_context_id);
  ```
- **Políticas RLS**:
  - `all`: `auth.uid() = user_id`

---

### 5. `budget_items` (Orçamentos PF)
- **Entidade Atual**: `BudgetItem`
- **Repository Atual**: `StorageRepository.getBudgetItems()` / `saveBudgetItems()`
- **Tabela Supabase**: `public.budget_items`
- **Esquema de Dados**:
  ```sql
  create table public.budget_items (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    category text not null,
    label text not null,
    allocated_cents bigint not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_budget_items_user on public.budget_items(user_id);
  ```
- **Políticas RLS**:
  - `all`: `auth.uid() = user_id`

---

### 6. `goals` (Metas Financeiras PF)
- **Entidade Atual**: `Goal`
- **Repository Atual**: `StorageRepository.getGoals()` / `saveGoals()`
- **Tabela Supabase**: `public.goals`
- **Esquema de Dados**:
  ```sql
  create table public.goals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    target_amount_cents bigint not null,
    current_amount_cents bigint default 0 not null,
    target_date date not null,
    category text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_goals_user on public.goals(user_id);
  ```
- **Políticas RLS**:
  - `all`: `auth.uid() = user_id`

---

### 7. `debts` (Dívidas & Financiamentos PF)
- **Entidade Atual**: `Debt`
- **Repository Atual**: `StorageRepository.getDebts()` / `saveDebts()`
- **Tabela Supabase**: `public.debts`
- **Esquema de Dados**:
  ```sql
  create table public.debts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    total_balance_cents bigint not null,
    monthly_payment_cents bigint not null,
    remaining_installments integer not null,
    interest_rate_pct numeric(5, 2) default 0.00 not null,
    due_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_debts_user on public.debts(user_id);
  ```
- **Políticas RLS**:
  - `all`: `auth.uid() = user_id`

---

### 8. `assets` (Patrimônio & Bens PF)
- **Entidade Atual**: `Asset`
- **Repository Atual**: `StorageRepository.getAssets()` / `saveAssets()`
- **Tabela Supabase**: `public.assets`
- **Esquema de Dados**:
  ```sql
  create table public.assets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    category text check (category in ('imovel', 'veiculo', 'renda_fixa', 'acoes', 'outros')) not null,
    value_cents bigint not null,
    acquisition_date date,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_assets_user on public.assets(user_id);
  ```
- **Políticas RLS**:
  - `all`: `auth.uid() = user_id`

---

## 🔒 Modelo RLS (Row Level Security) Padrão Supabase

Todas as tabelas PF contêm a coluna `user_id uuid references public.profiles(id)` e possuem RLS ativada com as seguintes regras de integridade:

```sql
-- Habilita RLS em todas as tabelas
alter table public.accounts enable row level security;
alter table public.credit_cards enable row level security;
alter table public.transactions enable row level security;
alter table public.budget_items enable row level security;
alter table public.goals enable row level security;
alter table public.debts enable row level security;
alter table public.assets enable row level security;

-- Política única de isolamento por usuário
create policy "Acesso exclusivo do próprio usuário em accounts"
  on public.accounts for all
  using (auth.uid() = user_id);

create policy "Acesso exclusivo do próprio usuário em transactions"
  on public.transactions for all
  using (auth.uid() = user_id);
```

---

## 📝 Notas de Migração & Compatibilidade Local-First

1. **Migração de IDs Antigos (`tx_123456`, `card_1`)**:
   - Ao executar a migração inicial para o Supabase, um script de migração cliente/servidor irá mapear IDs string legados para UUIDs v4 novos, preservando as chaves estrangeiras (`account_id`, `card_id`, `linked_transaction_id`).

2. **Money Safety (Centavos Inteiros)**:
   - Toda coluna de valor no banco utiliza `bigint` em centavos (`amount_cents`, `balance_cents`, `value_cents`), evitando imprecisões de ponto flutuante em operações de agregação SQL.

3. **Datas em Padrão ISO 8601 / `date`**:
   - As colunas de data utilizam o tipo nativo `date` (YYYY-MM-DD) ou `timestamp with time zone`.
