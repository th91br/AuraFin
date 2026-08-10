-- Migration 0002: Personal Finance Core (PF)
-- AuraFin Backend Phase 1

-- 1. Personal Accounts Table
create table if not exists public.personal_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  institution text not null,
  type text check (type in ('corrente', 'poupanca', 'investimento', 'dinheiro', 'carteira_digital')) not null,
  balance_cents bigint default 0 not null,
  include_in_cash boolean default true not null,
  status text default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.personal_accounts is 'Contas bancárias e carteiras do contexto Pessoa Física.';

alter table public.personal_accounts enable row level security;

create policy "Usuário gerencia suas próprias contas PF"
  on public.personal_accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_personal_accounts
  before update on public.personal_accounts
  for each row execute function public.handle_updated_at();

-- 2. Personal Credit Cards Table
create table if not exists public.personal_credit_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  institution text not null,
  brand text default 'Mastercard' not null,
  last_four_digits text check (length(last_four_digits) = 4) not null,
  limit_total_cents bigint default 0 not null,
  limit_used_cents bigint default 0 not null,
  current_invoice_cents bigint default 0 not null,
  closing_day integer check (closing_day between 1 and 31) not null,
  due_day integer check (due_day between 1 and 31) not null,
  is_primary boolean default false not null,
  status text default 'active' check (status in ('active', 'blocked', 'canceled')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.personal_credit_cards is 'Cartões de crédito do contexto Pessoa Física (Sem dados sensíveis de PCI).';

alter table public.personal_credit_cards enable row level security;

create policy "Usuário gerencia seus próprios cartões PF"
  on public.personal_credit_cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_personal_credit_cards
  before update on public.personal_credit_cards
  for each row execute function public.handle_updated_at();

-- 3. Personal Card Invoices Table
create table if not exists public.personal_card_invoices (
  id uuid default gen_random_uuid() primary key,
  card_id uuid references public.personal_credit_cards(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reference_month text not null, -- 'YYYY-MM'
  closing_date date not null,
  due_date date not null,
  status text check (status in ('aberta', 'fechada', 'paga', 'atrasada')) default 'aberta' not null,
  total_cents bigint default 0 not null,
  paid_cents bigint default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.personal_card_invoices is 'Faturas mensais dos cartões PF.';

alter table public.personal_card_invoices enable row level security;

create policy "Usuário gerencia suas próprias faturas PF"
  on public.personal_card_invoices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_personal_card_invoices
  before update on public.personal_card_invoices
  for each row execute function public.handle_updated_at();

-- 4. Recurrence Rules Table
create table if not exists public.recurrence_rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  amount_cents bigint not null,
  frequency text check (frequency in ('semanal', 'mensal', 'anual')) default 'mensal' not null,
  category text not null,
  next_due_date date not null,
  account_id uuid references public.personal_accounts(id) on delete set null,
  status text default 'active' check (status in ('active', 'paused', 'canceled')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.recurrence_rules is 'Regras de recorrência e assinaturas fixas PF.';

alter table public.recurrence_rules enable row level security;

create policy "Usuário gerencia suas próprias recorrências PF"
  on public.recurrence_rules for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_recurrence_rules
  before update on public.recurrence_rules
  for each row execute function public.handle_updated_at();

-- 5. Personal Transactions Table
create table if not exists public.personal_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('income', 'expense', 'transfer')) not null,
  title text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  transaction_date date not null,
  category text not null,
  account_id uuid references public.personal_accounts(id) on delete set null,
  credit_card_id uuid references public.personal_credit_cards(id) on delete set null,
  invoice_id uuid references public.personal_card_invoices(id) on delete set null,
  recurrence_id uuid references public.recurrence_rules(id) on delete set null,
  cross_context_id uuid, -- ID para relacionar operações PF ↔ PJ
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  deleted_at timestamptz
);

comment on table public.personal_transactions is 'Transações e lançamentos do contexto Pessoa Física.';

alter table public.personal_transactions enable row level security;

create policy "Usuário gerencia suas próprias transações PF"
  on public.personal_transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_personal_transactions
  before update on public.personal_transactions
  for each row execute function public.handle_updated_at();
