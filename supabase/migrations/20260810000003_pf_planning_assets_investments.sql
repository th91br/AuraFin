-- Migration 0003: PF Planning, Assets, Investments & Tax Metadata
-- AuraFin Backend Phase 1

-- 1. Budgets Table
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  planned_cents bigint not null check (planned_cents >= 0),
  period_month text not null, -- 'YYYY-MM'
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, category, period_month)
);

comment on table public.budgets is 'Orçamentos e teto de gastos planejados por categoria PF.';

alter table public.budgets enable row level security;

create policy "Usuário gerencia seus próprios orçamentos PF"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_budgets
  before update on public.budgets
  for each row execute function public.handle_updated_at();

-- 2. Goals Table
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  target_amount_cents bigint not null check (target_amount_cents > 0),
  current_amount_cents bigint default 0 not null check (current_amount_cents >= 0),
  target_date date not null,
  category text check (category in ('viagem', 'veiculo', 'casa', 'curso', 'investimento', 'outros')) default 'outros' not null,
  status text default 'em_andamento' check (status in ('em_andamento', 'concluido', 'cancelado')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.goals is 'Metas de médio e longo prazo PF.';

alter table public.goals enable row level security;

create policy "Usuário gerencia suas próprias metas PF"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_goals
  before update on public.goals
  for each row execute function public.handle_updated_at();

-- 3. Goal Contributions Table
create table if not exists public.goal_contributions (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount_cents bigint not null check (amount_cents > 0),
  contribution_date date not null,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.goal_contributions is 'Histórico rastreável de aportes nas metas PF.';

alter table public.goal_contributions enable row level security;

create policy "Usuário gerencia seus próprios aportes em metas PF"
  on public.goal_contributions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Emergency Reserves Table
create table if not exists public.emergency_reserves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  current_amount_cents bigint default 0 not null check (current_amount_cents >= 0),
  target_months integer default 6 not null check (target_months between 1 and 36),
  monthly_expense_basis_cents bigint default 0 not null check (monthly_expense_basis_cents >= 0),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(user_id)
);

comment on table public.emergency_reserves is 'Controle e autonomia de reserva de emergência PF.';

alter table public.emergency_reserves enable row level security;

create policy "Usuário gerencia sua própria reserva de emergência PF"
  on public.emergency_reserves for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_emergency_reserves
  before update on public.emergency_reserves
  for each row execute function public.handle_updated_at();

-- 5. Debts Table
create table if not exists public.debts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  total_balance_cents bigint not null check (total_balance_cents >= 0),
  monthly_payment_cents bigint default 0 not null check (monthly_payment_cents >= 0),
  remaining_installments integer default 1 not null check (remaining_installments >= 0),
  interest_rate_pct numeric default 0 not null,
  due_date date not null,
  status text default 'ativa' check (status in ('ativa', 'quitada', 'renegociada')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.debts is 'Dívidas, empréstimos e financiamentos do contexto PF.';

alter table public.debts enable row level security;

create policy "Usuário gerencia suas próprias dívidas PF"
  on public.debts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_debts
  before update on public.debts
  for each row execute function public.handle_updated_at();

-- 6. Debt Payments Table
create table if not exists public.debt_payments (
  id uuid default gen_random_uuid() primary key,
  debt_id uuid references public.debts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount_cents bigint not null check (amount_cents > 0),
  payment_date date not null,
  transaction_id uuid references public.personal_transactions(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.debt_payments is 'Histórico de amortização e pagamento de parcelas de dívidas PF.';

alter table public.debt_payments enable row level security;

create policy "Usuário gerencia seus próprios pagamentos de dívidas PF"
  on public.debt_payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. Assets Table
create table if not exists public.assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  category text check (category in ('imovel', 'veiculo', 'renda_fixa', 'acoes', 'outros')) not null,
  value_cents bigint not null check (value_cents >= 0),
  acquisition_date date,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.assets is 'Bens e patrimônio físico ou financeiro do contexto PF.';

alter table public.assets enable row level security;

create policy "Usuário gerencia seus próprios bens PF"
  on public.assets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_assets
  before update on public.assets
  for each row execute function public.handle_updated_at();

-- 8. Asset Valuations Table
create table if not exists public.asset_valuations (
  id uuid default gen_random_uuid() primary key,
  asset_id uuid references public.assets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  value_cents bigint not null check (value_cents >= 0),
  valuation_date date not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.asset_valuations is 'Histórico de reavaliação de bens patrimoniais PF.';

alter table public.asset_valuations enable row level security;

create policy "Usuário gerencia histórico de avaliação de bens PF"
  on public.asset_valuations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 9. Investments Table
create table if not exists public.investments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  asset_type text not null, -- 'CDB', 'Tesouro Direto', 'FIIs', 'Ações', 'Crypto'
  institution text not null,
  quantity numeric default 1 not null,
  average_price_cents bigint default 0 not null,
  current_price_cents bigint default 0 not null,
  total_value_cents bigint default 0 not null check (total_value_cents >= 0),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.investments is 'Carteira de investimentos e ativos do contexto PF.';

alter table public.investments enable row level security;

create policy "Usuário gerencia seus próprios investimentos PF"
  on public.investments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger handle_updated_at_investments
  before update on public.investments
  for each row execute function public.handle_updated_at();

-- 10. Investment Events Table
create table if not exists public.investment_events (
  id uuid default gen_random_uuid() primary key,
  investment_id uuid references public.investments(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  event_type text check (event_type in ('contribution', 'redemption', 'dividend', 'valuation_adjustment')) not null,
  amount_cents bigint not null,
  event_date date not null,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.investment_events is 'Histórico de compras, resgates, proventos e ajustes de posição PF.';

alter table public.investment_events enable row level security;

create policy "Usuário gerencia seus próprios eventos de investimento PF"
  on public.investment_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 11. Tax Metadata Table (IRPF)
create table if not exists public.tax_metadata (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  transaction_id uuid references public.personal_transactions(id) on delete cascade not null,
  tax_year integer not null,
  tax_category text not null, -- 'despesa_medica', 'instrucao', 'previdencia_pgbl', 'pensao'
  is_deductible boolean default false not null,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (transaction_id)
);

comment on table public.tax_metadata is 'Metadados de inteligência de IRPF associados às movimentações PF.';

alter table public.tax_metadata enable row level security;

create policy "Usuário gerencia seus próprios metadados tributários IRPF"
  on public.tax_metadata for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
