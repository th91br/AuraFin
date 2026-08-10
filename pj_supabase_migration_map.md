# AuraFin — PJ Multi-Tenant Data Migration Map & Supabase Schema Architecture

Este documento de engenharia estabelece a especificação técnica completa para a migração futura do **Contexto Pessoa Jurídica (PJ)** do AuraFin da persistência local-first (`StorageRepository` / LocalStorage) para o banco de dados **PostgreSQL Multi-tenant no Supabase** com **Row Level Security (RLS)** isolada por organização e controle de acesso por membros (`organization_members`).

---

## 🏗️ Visão Geral da Arquitetura Multi-Tenant PJ (Pré-Supabase)

```
+-----------------------------------------------------------------------+
|                         UI (17 Módulos PJ)                            |
|  PjOverview, PjCashflow, PjReceivablesPayables, PjDreView, etc.       |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|              Services & pjSelectors (Regras de Negócio)               |
|      formatCurrencyBRL, formatDateISO, pjSelectors.ts, Money Safety   |
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
       |  (aurafin_schema_v4)  |       | (Multi-tenant RLS)    |
       +-----------------------+       +-----------------------+
```

---

## 📋 Mapeamento de Entidades PJ → Tabelas Multi-Tenant PostgreSQL

### 1. `organizations` (Empresas PJ)
- **Entidade Atual**: Contexto PJ estático
- **Tabela Supabase**: `public.organizations`
- **Esquema de Dados**:
  ```sql
  create table public.organizations (
    id uuid default gen_random_uuid() primary key,
    legal_name text not null,
    trade_name text not null,
    cnpj text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  ```

---

### 2. `organization_members` (Controle de Acesso / Membros da Empresa)
- **Tabela Supabase**: `public.organization_members`
- **Esquema de Dados**:
  ```sql
  create table public.organization_members (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    role text check (role in ('owner', 'admin', 'finance', 'accountant', 'viewer')) default 'finance' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(organization_id, user_id)
  );

  create index idx_org_members_user on public.organization_members(user_id, organization_id);
  ```

---

### 3. `business_accounts` (Contas Bancárias PJ)
- **Entidade Atual**: `Account` (`context = 'PJ'`)
- **Tabela Supabase**: `public.business_accounts`
- **Esquema de Dados**:
  ```sql
  create table public.business_accounts (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    type text check (type in ('corrente', 'poupanca', 'investimento', 'dinheiro', 'carteira_digital')) not null,
    institution text not null,
    balance_cents bigint default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_business_accounts_org on public.business_accounts(organization_id);
  ```
- **Políticas RLS**:
  ```sql
  create policy "Acesso exclusivo dos membros da empresa"
    on public.business_accounts for all
    using (
      exists (
        select 1 from public.organization_members
        where organization_members.organization_id = business_accounts.organization_id
          and organization_members.user_id = auth.uid()
      )
    );
  ```

---

### 4. `corporate_cards` (Cartões Empresariais — Crédito & Débito PJ)
- **Entidade Atual**: `CreditCard` (`context = 'PJ'`)
- **Tabela Supabase**: `public.corporate_cards`
- **Esquema de Dados**:
  ```sql
  create table public.corporate_cards (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    card_type text check (card_type in ('credito', 'debito')) default 'credito' not null,
    institution text not null,
    linked_account_id uuid references public.business_accounts(id) on delete set null,
    limit_total_cents bigint default 0 not null,
    limit_used_cents bigint default 0 not null,
    current_invoice_cents bigint default 0 not null,
    closing_day integer check (closing_day between 1 and 31),
    due_day integer check (due_day between 1 and 31),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_corporate_cards_org on public.corporate_cards(organization_id);
  ```

---

### 5. `business_transactions` (Lançamentos Operacionais PJ — Fonte Única)
- **Entidade Atual**: `Transaction` (`context = 'PJ'`)
- **Tabela Supabase**: `public.business_transactions`
- **Esquema de Dados**:
  ```sql
  create table public.business_transactions (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    type text check (type in ('income', 'expense', 'transfer')) not null,
    title text not null,
    amount_cents bigint not null,
    date date not null,
    category text not null,
    sub_category text,
    account_id uuid references public.business_accounts(id) on delete set null,
    corporate_card_id uuid references public.corporate_cards(id) on delete set null,
    project_id uuid,
    client_id uuid,
    supplier_id uuid,
    cost_center_id uuid,
    is_personal_expense_in_pj boolean default false,
    is_paid_by_pf boolean default false,
    cross_context_id text,
    reimbursed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_business_tx_org_date on public.business_transactions(organization_id, date desc);
  create index idx_business_tx_org_cat on public.business_transactions(organization_id, category);
  create index idx_business_tx_cross on public.business_transactions(cross_context_id);
  ```

---

### 6. `receivables` (Contas a Receber PJ)
- **Entidade Atual**: `Defaulter` / Recebíveis
- **Tabela Supabase**: `public.receivables`
- **Esquema de Dados**:
  ```sql
  create table public.receivables (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    client_name text not null,
    amount_cents bigint not null,
    received_amount_cents bigint default 0 not null,
    due_date date not null,
    status text check (status in ('pendente', 'notificado', 'em_negociacao', 'acordo', 'pago')) default 'pendente' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_receivables_org_due on public.receivables(organization_id, due_date);
  ```

---

### 7. `projects` (Projetos & Contratos PJ)
- **Entidade Atual**: `Project`
- **Tabela Supabase**: `public.projects`
- **Esquema de Dados**:
  ```sql
  create table public.projects (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    client_name text not null,
    revenue_contracted_cents bigint not null,
    revenue_received_cents bigint default 0 not null,
    direct_costs_cents bigint default 0 not null,
    status text check (status in ('proposta', 'em_andamento', 'concluido', 'cancelado')) default 'em_andamento' not null,
    deadline date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  create index idx_projects_org on public.projects(organization_id);
  ```

---

## 🔒 Modelo RLS (Row Level Security) Multi-Tenant

Todas as tabelas PJ utilizam RLS estrita por empresa:

```sql
alter table public.business_accounts enable row level security;
alter table public.corporate_cards enable row level security;
alter table public.business_transactions enable row level security;
alter table public.receivables enable row level security;
alter table public.projects enable row level security;

-- Política de RLS Multi-Tenant
create policy "Acesso por membros da organização"
  on public.business_transactions for all
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = business_transactions.organization_id
        and organization_members.user_id = auth.uid()
    )
  );
```

---

## 📝 Notas de Integridade & Prevencao de Double Counting

1. **Cartão de Crédito vs Débito**:
   - Compras no crédito criam um registro em `business_transactions` com `corporate_card_id` e aumentam `current_invoice_cents`, sem afetar `business_accounts.balance_cents`.
   - Compras no débito criam um registro em `business_transactions` com `account_id` da conta vinculada e subtraem `business_accounts.balance_cents` imediatamente no ato.
   - O pagamento da fatura gera um lançamento de liquidação financeira que debita a conta bancária e reduz `current_invoice_cents` do cartão sem duplicar a despesa operacional na DRE.

2. **Money Safety (Centavos Inteiros)**:
   - Todas as tabelas financeiras utilizam `bigint` em centavos (`amount_cents`, `balance_cents`, `revenue_contracted_cents`).
