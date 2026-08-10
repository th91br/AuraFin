-- Migration 0010: PJ RBAC Role Authorization & Defaulters Table Physical Removal
-- AuraFin Backend Phase 1.1 Final Certification

-- 1. Helper Function: Check Specific Organization Role(s) for RBAC
create or replace function public.has_organization_role(org_id uuid, required_roles text[])
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and role = any(required_roles)
      and status = 'active'
  );
$$;

revoke execute on function public.has_organization_role(uuid, text[]) from public, anon;
grant execute on function public.has_organization_role(uuid, text[]) to authenticated;

-- 2. Physical Table Removal for defaulters (State is dynamically projected via public.v_defaulters view)
drop table if exists public.defaulters cascade;

-- 3. Granular RBAC Policies on PJ Financial Entities (Blocking viewer role from write operations)

-- Helper macro-like pattern for PJ Write Roles: owner, admin, finance, accountant
-- viewer role is strictly restricted to SELECT (Read Only)

-- Business Accounts
drop policy if exists "Membros da empresa gerenciam contas bancárias PJ" on public.business_accounts;

create policy "Membros leem contas bancarias PJ"
  on public.business_accounts for select
  using (public.is_organization_member(organization_id));

create policy "Escrita em contas bancarias PJ por cargos autorizados"
  on public.business_accounts for insert
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance']));

create policy "Atualizacao em contas bancarias PJ por cargos autorizados"
  on public.business_accounts for update
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'finance']))
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance']));

create policy "Exclusao em contas bancarias PJ por cargos autorizados"
  on public.business_accounts for delete
  using (public.has_organization_role(organization_id, array['owner', 'admin']));

-- Business Transactions
drop policy if exists "Membros da empresa gerenciam transações bancárias e de caixa PJ" on public.business_transactions;

create policy "Membros leem transacoes PJ"
  on public.business_transactions for select
  using (public.is_organization_member(organization_id));

create policy "Escrita em transacoes PJ por cargos autorizados"
  on public.business_transactions for insert
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']));

create policy "Atualizacao em transacoes PJ por cargos autorizados"
  on public.business_transactions for update
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']))
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']));

create policy "Exclusao em transacoes PJ por cargos autorizados"
  on public.business_transactions for delete
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'finance']));

-- Receivables
drop policy if exists "Membros da empresa gerenciam recebíveis PJ" on public.receivables;

create policy "Membros leem recebiveis PJ"
  on public.receivables for select
  using (public.is_organization_member(organization_id));

create policy "Escrita em recebiveis PJ por cargos autorizados"
  on public.receivables for insert
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']));

create policy "Atualizacao em recebiveis PJ por cargos autorizados"
  on public.receivables for update
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']))
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']));

create policy "Exclusao em recebiveis PJ por cargos autorizados"
  on public.receivables for delete
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'finance']));

-- Payables
drop policy if exists "Membros da empresa gerenciam pagáveis PJ" on public.payables;

create policy "Membros leem pagaveis PJ"
  on public.payables for select
  using (public.is_organization_member(organization_id));

create policy "Escrita em pagaveis PJ por cargos autorizados"
  on public.payables for insert
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']));

create policy "Atualizacao em pagaveis PJ por cargos autorizados"
  on public.payables for update
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']))
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']));

create policy "Exclusao em pagaveis PJ por cargos autorizados"
  on public.payables for delete
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'finance']));

-- Invoices
drop policy if exists "Membros da empresa gerenciam faturas e notas PJ" on public.invoices;

create policy "Membros leem notas e faturas PJ"
  on public.invoices for select
  using (public.is_organization_member(organization_id));

create policy "Escrita em notas e faturas PJ por cargos autorizados"
  on public.invoices for insert
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']));

create policy "Atualizacao em notas e faturas PJ por cargos autorizados"
  on public.invoices for update
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']))
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance', 'accountant']));

create policy "Exclusao em notas e faturas PJ por cargos autorizados"
  on public.invoices for delete
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'finance']));

-- Corporate Cards
drop policy if exists "Membros da empresa gerenciam cartões corporativos PJ" on public.corporate_cards;

create policy "Membros leem cartoes corporativos PJ"
  on public.corporate_cards for select
  using (public.is_organization_member(organization_id));

create policy "Escrita em cartoes corporativos PJ por cargos autorizados"
  on public.corporate_cards for insert
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance']));

create policy "Atualizacao em cartoes corporativos PJ por cargos autorizados"
  on public.corporate_cards for update
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'finance']))
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'finance']));

create policy "Exclusao em cartoes corporativos PJ por cargos autorizados"
  on public.corporate_cards for delete
  using (public.has_organization_role(organization_id, array['owner', 'admin']));

-- Monthly Closings
drop policy if exists "Membros da empresa gerenciam fechamentos mensais PJ" on public.monthly_closings;

create policy "Membros leem fechamentos mensais PJ"
  on public.monthly_closings for select
  using (public.is_organization_member(organization_id));

create policy "Escrita e atualizacao em fechamentos mensais por owner, admin e accountant"
  on public.monthly_closings for all
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'accountant']))
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'accountant']));
