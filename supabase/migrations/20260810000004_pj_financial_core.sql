-- Migration 0004: Business Financial Core (PJ Multi-Tenant)
-- AuraFin Backend Phase 1

-- 1. Business Accounts Table
create table if not exists public.business_accounts (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  institution text not null,
  type text check (type in ('corrente', 'poupanca', 'investimento', 'dinheiro', 'carteira_digital')) not null,
  balance_cents bigint default 0 not null,
  status text default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.business_accounts is 'Contas bancárias operacionais do contexto Pessoa Jurídica (PJ).';

alter table public.business_accounts enable row level security;

create policy "Membros da empresa gerenciam contas bancárias PJ"
  on public.business_accounts for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_business_accounts
  before update on public.business_accounts
  for each row execute function public.handle_updated_at();

-- 2. Clients Table
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  document_cnpj_cpf text,
  contact_email text,
  phone text,
  total_billed_cents bigint default 0 not null check (total_billed_cents >= 0),
  total_received_cents bigint default 0 not null check (total_received_cents >= 0),
  total_pending_cents bigint default 0 not null check (total_pending_cents >= 0),
  status text default 'ativo' check (status in ('ativo', 'inativo', 'inadimplente')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.clients is 'Cadastro de clientes corporativos PJ.';

alter table public.clients enable row level security;

create policy "Membros da empresa gerenciam clientes PJ"
  on public.clients for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_clients
  before update on public.clients
  for each row execute function public.handle_updated_at();

-- 3. Suppliers Table
create table if not exists public.suppliers (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  document_cnpj_cpf text,
  contact_email text,
  phone text,
  category text not null,
  total_paid_cents bigint default 0 not null check (total_paid_cents >= 0),
  status text default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.suppliers is 'Cadastro de fornecedores corporativos PJ.';

alter table public.suppliers enable row level security;

create policy "Membros da empresa gerenciam fornecedores PJ"
  on public.suppliers for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_suppliers
  before update on public.suppliers
  for each row execute function public.handle_updated_at();

-- 4. Receivables Table
create table if not exists public.receivables (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  original_amount_cents bigint not null check (original_amount_cents >= 0),
  received_amount_cents bigint default 0 not null check (received_amount_cents >= 0),
  balance_cents bigint not null check (balance_cents >= 0),
  issue_date date not null,
  due_date date not null,
  status text check (status in ('pendente', 'parcial', 'recebido', 'atrasado', 'cancelado')) default 'pendente' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.receivables is 'Contas a receber de faturamento gerencial PJ.';

alter table public.receivables enable row level security;

create policy "Membros da empresa gerenciam recebíveis PJ"
  on public.receivables for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_receivables
  before update on public.receivables
  for each row execute function public.handle_updated_at();

-- 5. Payables Table
create table if not exists public.payables (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  title text not null,
  original_amount_cents bigint not null check (original_amount_cents >= 0),
  paid_amount_cents bigint default 0 not null check (paid_amount_cents >= 0),
  balance_cents bigint not null check (balance_cents >= 0),
  issue_date date not null,
  due_date date not null,
  status text check (status in ('pendente', 'parcial', 'pago', 'atrasado', 'cancelado')) default 'pendente' not null,
  is_paid_by_pf boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.payables is 'Contas a pagar corporativas PJ.';

alter table public.payables enable row level security;

create policy "Membros da empresa gerenciam pagáveis PJ"
  on public.payables for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_payables
  before update on public.payables
  for each row execute function public.handle_updated_at();

-- 6. Invoices Table (Faturamento Gerencial)
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  invoice_number text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  issue_date date not null,
  due_date date not null,
  status text check (status in ('emitida', 'paga', 'cancelada')) default 'emitida' not null,
  receivable_id uuid references public.receivables(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.invoices is 'Notas fiscais e faturas emitidas gerencialmente PJ.';

alter table public.invoices enable row level security;

create policy "Membros da empresa gerenciam faturas e notas PJ"
  on public.invoices for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_invoices
  before update on public.invoices
  for each row execute function public.handle_updated_at();

-- 7. Business Transactions Table
create table if not exists public.business_transactions (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  type text check (type in ('income', 'expense', 'transfer')) not null,
  title text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  transaction_date date not null,
  category text not null,
  account_id uuid references public.business_accounts(id) on delete set null,
  corporate_card_id uuid,
  client_id uuid references public.clients(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  project_id uuid,
  cost_center_id uuid,
  cross_context_id uuid, -- Conciliação PF ↔ PJ
  is_paid_by_pf boolean default false not null,
  is_personal_expense_in_pj boolean default false not null,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  deleted_at timestamptz
);

comment on table public.business_transactions is 'Transações e movimentações de caixa do contexto Pessoa Jurídica (PJ).';

alter table public.business_transactions enable row level security;

create policy "Membros da empresa gerenciam transações bancárias e de caixa PJ"
  on public.business_transactions for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_business_transactions
  before update on public.business_transactions
  for each row execute function public.handle_updated_at();
