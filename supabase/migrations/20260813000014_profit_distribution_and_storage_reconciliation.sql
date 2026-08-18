-- Migration 0014: Profit Distribution Atomic RPC & Storage Orphan Reconciliation
-- AuraFin Backend Phase 2D Certification

-- 1. Atomic Function: Process Profit Distribution Payout (PJ -> PF)
create or replace function public.process_profit_distribution_payout(
  p_org_id uuid,
  p_partner_id uuid,
  p_amount_cents bigint,
  p_pj_account_id uuid,
  p_pf_account_id uuid,
  p_transaction_date date default current_date,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cross_id uuid;
  v_biz_tx_id uuid;
begin
  -- Validate RBAC: Only owner, admin, finance
  if not public.has_organization_role(p_org_id, array['owner', 'admin', 'finance']) then
    raise exception 'Acesso negado: apenas membros autorizados podem registrar distribuição de lucros.';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'O valor da distribuição de lucros deve ser maior que zero.';
  end if;

  v_cross_id := gen_random_uuid();
  v_biz_tx_id := gen_random_uuid();

  -- 1. Insert Business Transaction (PJ Equity/Payout)
  insert into public.business_transactions (
    id,
    organization_id,
    account_id,
    type,
    title,
    amount_cents,
    transaction_date,
    category,
    notes
  ) values (
    v_biz_tx_id,
    p_org_id,
    p_pj_account_id,
    'expense',
    coalesce(p_notes, 'Distribuição de Lucros Societária'),
    p_amount_cents,
    p_transaction_date,
    'profit_distribution',
    'Distribuição de lucros isenta aos sócios'
  );

  -- Update PJ Account Balance
  update public.business_accounts
  set balance_cents = balance_cents - p_amount_cents
  where id = p_pj_account_id and organization_id = p_org_id;

  -- 2. Insert Partner Transaction Record
  insert into public.partner_transactions (
    organization_id,
    partner_id,
    type,
    amount_cents,
    transaction_date,
    business_transaction_id,
    notes
  ) values (
    p_org_id,
    p_partner_id,
    'profit_distribution',
    p_amount_cents,
    p_transaction_date,
    v_biz_tx_id,
    p_notes
  );

  -- 3. Insert Personal Transaction Record (PF Income)
  insert into public.personal_transactions (
    user_id,
    account_id,
    type,
    title,
    amount_cents,
    transaction_date,
    category,
    notes
  ) values (
    auth.uid(),
    p_pf_account_id,
    'income',
    'Recebimento de Distribuição de Lucros',
    p_amount_cents,
    p_transaction_date,
    'profit_distribution',
    coalesce(p_notes, 'Distribuição de lucros recebida da empresa')
  );

  -- Update PF Account Balance
  update public.personal_accounts
  set balance_cents = balance_cents + p_amount_cents
  where id = p_pf_account_id and user_id = auth.uid();

  return v_cross_id;
end;
$$;

revoke execute on function public.process_profit_distribution_payout(uuid, uuid, bigint, uuid, uuid, date, text) from public, anon;
grant execute on function public.process_profit_distribution_payout(uuid, uuid, bigint, uuid, uuid, date, text) to authenticated;

-- 2. Storage Orphan Object Reconciliation Routine
create or replace function public.find_orphan_storage_objects()
returns table (
  id uuid,
  bucket_id text,
  name text,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select 
    obj.id,
    obj.bucket_id,
    obj.name,
    obj.created_at
  from storage.objects obj
  left join public.documents doc on doc.file_path = obj.name
  where obj.bucket_id = 'financial-documents'
    and doc.id is null
    and obj.created_at < (now() - interval '1 hour');
$$;

revoke execute on function public.find_orphan_storage_objects() from public, anon;
grant execute on function public.find_orphan_storage_objects() to authenticated;
