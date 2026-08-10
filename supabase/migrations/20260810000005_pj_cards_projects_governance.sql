-- Migration 0005: PJ Cards, Projects, Governance, Taxes & Reconciliations
-- AuraFin Backend Phase 1

-- 1. Corporate Cards Table
create table if not exists public.corporate_cards (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  institution text not null,
  brand text default 'Mastercard' not null,
  last_four_digits text check (length(last_four_digits) = 4) not null,
  type text check (type in ('credito', 'debito')) default 'credito' not null,
  linked_account_id uuid references public.business_accounts(id) on delete set null,
  credit_limit_cents bigint default 0 not null,
  limit_used_cents bigint default 0 not null,
  current_invoice_cents bigint default 0 not null,
  closing_day integer check (closing_day between 1 and 31),
  due_day integer check (due_day between 1 and 31),
  is_primary boolean default false not null,
  status text default 'active' check (status in ('active', 'blocked', 'canceled')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.corporate_cards is 'Cartões corporativos empresariais (Sem dados sensíveis de PCI).';

alter table public.corporate_cards enable row level security;

create policy "Membros da empresa gerenciam cartões corporativos PJ"
  on public.corporate_cards for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_corporate_cards
  before update on public.corporate_cards
  for each row execute function public.handle_updated_at();

-- 2. Corporate Card Invoices Table
create table if not exists public.corporate_card_invoices (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  card_id uuid references public.corporate_cards(id) on delete cascade not null,
  reference_month text not null, -- 'YYYY-MM'
  closing_date date not null,
  due_date date not null,
  status text check (status in ('aberta', 'fechada', 'paga', 'atrasada')) default 'aberta' not null,
  total_cents bigint default 0 not null,
  paid_cents bigint default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.corporate_card_invoices is 'Faturas de cartões corporativos PJ.';

alter table public.corporate_card_invoices enable row level security;

create policy "Membros da empresa gerenciam faturas corporativas PJ"
  on public.corporate_card_invoices for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_corporate_card_invoices
  before update on public.corporate_card_invoices
  for each row execute function public.handle_updated_at();

-- 3. Cost Centers Table
create table if not exists public.cost_centers (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  code text not null,
  budget_cents bigint default 0 not null check (budget_cents >= 0),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(organization_id, code)
);

comment on table public.cost_centers is 'Centros de custo e departamentos para alocação gerencial PJ.';

alter table public.cost_centers enable row level security;

create policy "Membros da empresa gerenciam centros de custo PJ"
  on public.cost_centers for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_cost_centers
  before update on public.cost_centers
  for each row execute function public.handle_updated_at();

-- Add FK from business_transactions to cost_centers
alter table public.business_transactions
  add constraint fk_business_tx_cost_center
  foreign key (cost_center_id) references public.cost_centers(id) on delete set null;

-- 4. Projects Table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  revenue_contracted_cents bigint default 0 not null check (revenue_contracted_cents >= 0),
  revenue_received_cents bigint default 0 not null check (revenue_received_cents >= 0),
  direct_costs_cents bigint default 0 not null check (direct_costs_cents >= 0),
  status text check (status in ('proposta', 'em_andamento', 'concluido', 'cancelado')) default 'em_andamento' not null,
  deadline date,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.projects is 'Projetos e contratos corporativos com rentabilidade gerencial PJ.';

alter table public.projects enable row level security;

create policy "Membros da empresa gerenciam projetos e contratos PJ"
  on public.projects for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_projects
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- Add FK from business_transactions to projects
alter table public.business_transactions
  add constraint fk_business_tx_project
  foreign key (project_id) references public.projects(id) on delete set null;

-- Add FK from business_transactions to corporate_cards
alter table public.business_transactions
  add constraint fk_business_tx_corporate_card
  foreign key (corporate_card_id) references public.corporate_cards(id) on delete set null;

-- 5. Tax Records Table (Controle Gerencial)
create table if not exists public.tax_records (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  description text not null,
  tax_type text check (tax_type in ('DAS', 'ISS', 'IRPJ', 'CSLL', 'PIS', 'COFINS', 'INSS', 'OUTROS')) not null,
  competence text not null, -- 'YYYY-MM'
  amount_cents bigint not null check (amount_cents >= 0),
  due_date date not null,
  status text check (status in ('previsto', 'provisionado', 'pago', 'vencido')) default 'previsto' not null,
  payment_transaction_id uuid references public.business_transactions(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.tax_records is 'Controle gerencial de impostos e obrigações fiscais PJ.';

alter table public.tax_records enable row level security;

create policy "Membros da empresa gerenciam controle de impostos PJ"
  on public.tax_records for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_tax_records
  before update on public.tax_records
  for each row execute function public.handle_updated_at();

-- 6. Partners Table
create table if not exists public.partners (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  document_cpf text,
  ownership_percentage numeric default 0 not null check (ownership_percentage between 0 and 100),
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.partners is 'Quadro societário e sócios registrados na organização PJ.';

alter table public.partners enable row level security;

create policy "Membros da empresa gerenciam quadro de sócios PJ"
  on public.partners for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_partners
  before update on public.partners
  for each row execute function public.handle_updated_at();

-- 7. Partner Transactions Table
create table if not exists public.partner_transactions (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  partner_id uuid references public.partners(id) on delete cascade not null,
  type text check (type in ('pro_labore', 'profit_distribution', 'reimbursement', 'other')) not null,
  amount_cents bigint not null check (amount_cents >= 0),
  transaction_date date not null,
  business_transaction_id uuid references public.business_transactions(id) on delete set null,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.partner_transactions is 'Lançamentos de pró-labore e distribuição de lucros para sócios PJ.';

alter table public.partner_transactions enable row level security;

create policy "Membros da empresa gerenciam transações de sócios PJ"
  on public.partner_transactions for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

-- 8. Reconciliations Table (PF ↔ PJ)
create table if not exists public.reconciliations (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  partner_id uuid references public.partners(id) on delete set null,
  type text check (type in ('pf_paid_pj', 'pj_paid_pf', 'reimbursement', 'pro_labore', 'profit_distribution')) not null,
  source_transaction_id uuid,
  amount_cents bigint not null check (amount_cents >= 0),
  resolved_amount_cents bigint default 0 not null check (resolved_amount_cents >= 0),
  status text check (status in ('pending', 'partially_resolved', 'resolved', 'cancelled')) default 'pending' not null,
  cross_context_id uuid,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  resolved_at timestamptz
);

comment on table public.reconciliations is 'Conciliação e controle de acertos financeiros entre contas PF e PJ.';

alter table public.reconciliations enable row level security;

create policy "Membros da empresa gerenciam conciliações PF ↔ PJ"
  on public.reconciliations for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

-- 9. Reimbursements Table
create table if not exists public.reimbursements (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  reconciliation_id uuid references public.reconciliations(id) on delete cascade not null,
  amount_cents bigint not null check (amount_cents > 0),
  payment_date date not null,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.reimbursements is 'Histórico de liquidação de reembolsos PF ↔ PJ.';

alter table public.reimbursements enable row level security;

create policy "Membros da empresa gerenciam reembolsos PJ"
  on public.reimbursements for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

-- 10. Defaulters Table (Inadimplência)
create table if not exists public.defaulters (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  client_name text not null,
  invoice_code text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  days_overdue integer default 0 not null check (days_overdue >= 0),
  due_date date not null,
  status text check (status in ('em_atraso', 'em_cobranca', 'acordo_firmado', 'juridico', 'recuperado', 'perda')) default 'em_atraso' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.defaulters is 'Registro de inadimplência e clientes devedores PJ.';

alter table public.defaulters enable row level security;

create policy "Membros da empresa gerenciam inadimplência PJ"
  on public.defaulters for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

create trigger handle_updated_at_defaulters
  before update on public.defaulters
  for each row execute function public.handle_updated_at();

-- 11. Collection Events Table
create table if not exists public.collection_events (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  defaulter_id uuid references public.defaulters(id) on delete cascade not null,
  receivable_id uuid references public.receivables(id) on delete set null,
  event_date timestamptz default timezone('utc'::text, now()) not null,
  channel text check (channel in ('email', 'whatsapp', 'telefone', 'notificacao_extrajudicial', 'outro')) not null,
  status text not null,
  notes text,
  template_key text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.collection_events is 'Eventos da régua de cobrança e histórico de contatos com inadimplentes PJ.';

alter table public.collection_events enable row level security;

create policy "Membros da empresa gerenciam eventos de cobrança PJ"
  on public.collection_events for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));

-- 12. Monthly Closings Table
create table if not exists public.monthly_closings (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  reference_month text not null, -- 'YYYY-MM'
  closing_date timestamptz default timezone('utc'::text, now()) not null,
  closed_by uuid references public.profiles(id) on delete set null,
  gross_revenue_cents bigint default 0 not null,
  total_expenses_cents bigint default 0 not null,
  net_result_cents bigint default 0 not null,
  status text check (status in ('open', 'closed', 'audited')) default 'closed' not null,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (organization_id, reference_month)
);

comment on table public.monthly_closings is 'Fechamentos mensais auditados do caixa e DRE PJ.';

alter table public.monthly_closings enable row level security;

create policy "Membros da empresa gerenciam fechamentos mensais PJ"
  on public.monthly_closings for all
  using (public.is_organization_member(organization_id))
  with check (public.is_organization_member(organization_id));
