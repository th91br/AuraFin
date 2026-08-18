-- Migration 0013: Atomic Cross-Context Operations & Transactional Functions
-- AuraFin Backend Phase 2D

-- 1. Atomic Function: Process Reimbursement (PJ -> PF)
create or replace function public.process_cross_context_reimbursement(
  p_org_id uuid,
  p_reconciliation_id uuid,
  p_amount_cents bigint,
  p_pj_account_id uuid,
  p_pf_account_id uuid,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rec record;
  v_cross_id uuid;
  v_new_resolved bigint;
  v_new_status text;
begin
  -- Validate RBAC
  if not public.has_organization_role(p_org_id, array['owner', 'admin', 'finance']) then
    raise exception 'Acesso negado: apenas membros autorizados podem processar reembolsos.';
  end if;

  -- Lock Reconciliation Row for Concurrency Control
  select * into v_rec
  from public.reconciliations
  where id = p_reconciliation_id and organization_id = p_org_id
  for update;

  if not found then
    raise exception 'Conciliação não encontrada para esta organização.';
  end if;

  if v_rec.status = 'resolved' or v_rec.status = 'cancelled' then
    raise exception 'Esta conciliação já foi concluída ou cancelada.';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'O valor do reembolso deve ser maior que zero.';
  end if;

  v_new_resolved := v_rec.resolved_amount_cents + p_amount_cents;
  if v_new_resolved > v_rec.amount_cents then
    raise exception 'O valor acumulado de reembolsos excede o total da pendência.';
  end if;

  if v_new_resolved = v_rec.amount_cents then
    v_new_status := 'resolved';
  else
    v_new_status := 'partially_resolved';
  end if;

  v_cross_id := coalesce(v_rec.cross_context_id, gen_random_uuid());

  -- 1. Insert Reimbursement Record
  insert into public.reimbursements (
    organization_id,
    reconciliation_id,
    amount_cents,
    payment_date,
    notes
  ) values (
    p_org_id,
    p_reconciliation_id,
    p_amount_cents,
    current_date,
    p_notes
  );

  -- 2. Update Reconciliation Status & Resolved Amount
  update public.reconciliations
  set resolved_amount_cents = v_new_resolved,
      status = v_new_status,
      cross_context_id = v_cross_id,
      resolved_at = case when v_new_status = 'resolved' then now() else resolved_at end
  where id = p_reconciliation_id;

  -- 3. Record PJ Business Transaction (Expense payout)
  insert into public.business_transactions (
    organization_id,
    account_id,
    type,
    title,
    amount_cents,
    transaction_date,
    category,
    notes
  ) values (
    p_org_id,
    p_pj_account_id,
    'expense',
    coalesce(p_notes, 'Reembolso de Despesa PF ↔ PJ'),
    p_amount_cents,
    current_date,
    'reimbursement',
    'Liquidado via conciliação cross-context'
  );

  -- Update PJ Account Balance
  update public.business_accounts
  set balance_cents = balance_cents - p_amount_cents
  where id = p_pj_account_id and organization_id = p_org_id;

  -- 4. Record PF Personal Transaction (Income into PF Account)
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
    coalesce(p_notes, 'Reembolso Recebido da Empresa'),
    p_amount_cents,
    current_date,
    'reimbursement',
    'Recebido via conciliação cross-context'
  );

  -- Update PF Account Balance
  update public.personal_accounts
  set balance_cents = balance_cents + p_amount_cents
  where id = p_pf_account_id and user_id = auth.uid();

  return v_cross_id;
end;
$$;

revoke execute on function public.process_cross_context_reimbursement(uuid, uuid, bigint, uuid, uuid, text) from public, anon;
grant execute on function public.process_cross_context_reimbursement(uuid, uuid, bigint, uuid, uuid, text) to authenticated;

-- 2. Atomic Function: Process Pro-Labore Payout (PJ -> PF)
create or replace function public.process_pro_labore_payout(
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
  if not public.has_organization_role(p_org_id, array['owner', 'admin', 'finance']) then
    raise exception 'Acesso negado: apenas membros autorizados podem registrar pró-labore.';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'O valor do pró-labore deve ser maior que zero.';
  end if;

  v_cross_id := gen_random_uuid();
  v_biz_tx_id := gen_random_uuid();

  -- 1. Insert Business Transaction (PJ Expense)
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
    coalesce(p_notes, 'Pagamento de Pró-Labore Sócio'),
    p_amount_cents,
    p_transaction_date,
    'pro_labore',
    'Retirada mensal pró-labore societário'
  );

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
    'pro_labore',
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
    'Recebimento de Pró-Labore',
    p_amount_cents,
    p_transaction_date,
    'pro_labore',
    coalesce(p_notes, 'Pró-labore empresarial recebido')
  );

  update public.personal_accounts
  set balance_cents = balance_cents + p_amount_cents
  where id = p_pf_account_id and user_id = auth.uid();

  return v_cross_id;
end;
$$;

revoke execute on function public.process_pro_labore_payout(uuid, uuid, bigint, uuid, uuid, date, text) from public, anon;
grant execute on function public.process_pro_labore_payout(uuid, uuid, bigint, uuid, uuid, date, text) to authenticated;
