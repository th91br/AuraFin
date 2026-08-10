-- Migration 0008: Backend Hardening, Security Definer Defenses, Integrity Constraints & Defaulters View
-- AuraFin Backend Phase 1.1

-- 1. Hardening handle_updated_at Trigger Function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- 2. Hardening is_organization_member Helper Function
create or replace function public.is_organization_member(org_id uuid)
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
      and status = 'active'
  );
$$;

-- Revoke execute from public/anon and grant explicitly to authenticated
revoke execute on function public.is_organization_member(uuid) from public, anon;
grant execute on function public.is_organization_member(uuid) to authenticated;

-- 3. Hardening handle_new_user Trigger Function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 4. Hardening Atomic RPC: create_organization_with_owner
create or replace function public.create_organization_with_owner(
  org_name text,
  legal_name text default null,
  tax_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Acesso negado: usuário não autenticado';
  end if;

  insert into public.organizations (name, legal_name, tax_id, created_by)
  values (org_name, legal_name, tax_id, auth.uid())
  returning id into new_org_id;

  insert into public.organization_members (organization_id, user_id, role, status)
  values (new_org_id, auth.uid(), 'owner', 'active');

  return new_org_id;
end;
$$;

-- Strict Execution Grants for Atomic RPC
revoke execute on function public.create_organization_with_owner(text, text, text) from public, anon;
grant execute on function public.create_organization_with_owner(text, text, text) to authenticated;

-- 5. Financial Balance Integrity Constraints for Receivables and Payables
alter table public.receivables
  drop constraint if exists check_receivables_balance_integrity,
  add constraint check_receivables_balance_integrity
  check (
    original_amount_cents >= 0 and
    received_amount_cents >= 0 and
    received_amount_cents <= original_amount_cents and
    balance_cents >= 0 and
    balance_cents = (original_amount_cents - received_amount_cents)
  );

alter table public.payables
  drop constraint if exists check_payables_balance_integrity,
  add constraint check_payables_balance_integrity
  check (
    original_amount_cents >= 0 and
    paid_amount_cents >= 0 and
    paid_amount_cents <= original_amount_cents and
    balance_cents >= 0 and
    balance_cents = (original_amount_cents - paid_amount_cents)
  );

-- 6. Dynamic View for Overdue Defaulters (Eliminating duplicate physical state)
-- Uses security_invoker = true to enforce RLS of underlying receivables
create or replace view public.v_defaulters
with (security_invoker = true)
as
select 
  r.id as receivable_id,
  r.organization_id,
  r.client_id,
  coalesce(c.name, 'Cliente Desconhecido') as client_name,
  r.title as invoice_code,
  r.balance_cents as amount_cents,
  (current_date - r.due_date) as days_overdue,
  r.due_date,
  case 
    when (current_date - r.due_date) > 90 then 'juridico'
    when (current_date - r.due_date) > 30 then 'em_cobranca'
    else 'em_atraso'
  end as status,
  r.created_at,
  r.updated_at
from public.receivables r
left join public.clients c on c.id = r.client_id
where r.due_date < current_date 
  and r.balance_cents > 0 
  and r.status not in ('recebido', 'cancelado');

comment on view public.v_defaulters is 'Visão dinâmica gerencial de inadimplência sem duplicação de estado, respeitando RLS via security_invoker.';

-- 7. Hardening Storage Objects RLS Policies with Path and Bucket Validation
create policy "Acesso PF ao Bucket Financeiro com isolamento por Pasta"
  on storage.objects for all
  using (
    bucket_id = 'financial-documents'
    and (storage.foldername(name))[1] = 'pf'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
  with check (
    bucket_id = 'financial-documents'
    and (storage.foldername(name))[1] = 'pf'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Acesso PJ ao Bucket Financeiro com isolamento por Organização"
  on storage.objects for all
  using (
    bucket_id = 'financial-documents'
    and (storage.foldername(name))[1] = 'pj'
    and public.is_organization_member(((storage.foldername(name))[2])::uuid)
  )
  with check (
    bucket_id = 'financial-documents'
    and (storage.foldername(name))[1] = 'pj'
    and public.is_organization_member(((storage.foldername(name))[2])::uuid)
  );
