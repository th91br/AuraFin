-- ==============================================================================
-- AURAFIN — MIGRATION 0016: CROSS-CONTEXT RPC SECURITY & IDEMPOTENCY HARDENING
-- ==============================================================================
-- Scope:
-- 1. Preflight data check and unique cross_context_id index enforcement.
-- 2. Add cross_context_id to partner_transactions and reimbursements (additive).
-- 3. Replace cross-context RPCs with AAL2, RBAC, tenant ownership, beneficiary
--    resolution, explicit idempotency key and atomic balance management.
-- 4. Set search_path = '', SECURITY DEFINER, and minimal execute grants.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADD COLUMNS (ADDITIVE & NON-DESTRUCTIVE)
-- ------------------------------------------------------------------------------
ALTER TABLE public.partner_transactions 
  ADD COLUMN IF NOT EXISTS cross_context_id uuid;

ALTER TABLE public.reimbursements 
  ADD COLUMN IF NOT EXISTS cross_context_id uuid;

-- ------------------------------------------------------------------------------
-- 2. PREFLIGHT DUPLICITY CHECK
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_dup_biz integer;
  v_dup_pf integer;
  v_dup_pt integer;
  v_dup_reimb integer;
BEGIN
  -- Check business_transactions
  SELECT count(*) INTO v_dup_biz
  FROM (
    SELECT cross_context_id
    FROM public.business_transactions
    WHERE cross_context_id IS NOT NULL
    GROUP BY cross_context_id
    HAVING count(*) > 1
  ) t;
  
  IF v_dup_biz > 0 THEN
    RAISE EXCEPTION 'Preflight abort: Duplicated cross_context_id found in public.business_transactions';
  END IF;

  -- Check personal_transactions
  SELECT count(*) INTO v_dup_pf
  FROM (
    SELECT cross_context_id
    FROM public.personal_transactions
    WHERE cross_context_id IS NOT NULL
    GROUP BY cross_context_id
    HAVING count(*) > 1
  ) t;
  
  IF v_dup_pf > 0 THEN
    RAISE EXCEPTION 'Preflight abort: Duplicated cross_context_id found in public.personal_transactions';
  END IF;

  -- Check partner_transactions
  SELECT count(*) INTO v_dup_pt
  FROM (
    SELECT cross_context_id
    FROM public.partner_transactions
    WHERE cross_context_id IS NOT NULL
    GROUP BY cross_context_id
    HAVING count(*) > 1
  ) t;
  
  IF v_dup_pt > 0 THEN
    RAISE EXCEPTION 'Preflight abort: Duplicated cross_context_id found in public.partner_transactions';
  END IF;

  -- Check reimbursements
  SELECT count(*) INTO v_dup_reimb
  FROM (
    SELECT cross_context_id
    FROM public.reimbursements
    WHERE cross_context_id IS NOT NULL
    GROUP BY cross_context_id
    HAVING count(*) > 1
  ) t;
  
  IF v_dup_reimb > 0 THEN
    RAISE EXCEPTION 'Preflight abort: Duplicated cross_context_id found in public.reimbursements';
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. UNIQUE PARTIAL INDEXES FOR IDEMPOTENCY ENFORCEMENT
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_business_tx_cross_context 
  ON public.business_transactions(cross_context_id) 
  WHERE cross_context_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_personal_tx_cross_context 
  ON public.personal_transactions(cross_context_id) 
  WHERE cross_context_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_partner_tx_cross_context 
  ON public.partner_transactions(cross_context_id) 
  WHERE cross_context_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_reimbursements_cross_context 
  ON public.reimbursements(cross_context_id) 
  WHERE cross_context_id IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 4. DROP LEGACY FUNCTION SIGNATURES (PREVENTS AMBIGUOUS OVERLOADS)
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.process_cross_context_reimbursement(uuid, uuid, bigint, uuid, uuid, text);
DROP FUNCTION IF EXISTS public.process_pro_labore_payout(uuid, uuid, bigint, uuid, uuid, date, text);
DROP FUNCTION IF EXISTS public.process_profit_distribution_payout(uuid, uuid, bigint, uuid, uuid, date, text);

-- ------------------------------------------------------------------------------
-- 5. FUNCTION: process_cross_context_reimbursement
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_cross_context_reimbursement(
  p_org_id uuid,
  p_reconciliation_id uuid,
  p_amount_cents bigint,
  p_pj_account_id uuid,
  p_pf_account_id uuid,
  p_idempotency_key uuid,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rec record;
  v_pj_acc record;
  v_pf_acc record;
  v_beneficiary_id uuid;
  v_new_resolved bigint;
  v_new_status text;
  v_existing_tx record;
  v_rows_affected integer;
BEGIN
  -- 1. Authentication Check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado: sessão de usuário ausente.'
      USING ERRCODE = '42501';
  END IF;

  -- 2. AAL2 Server-Side Check
  IF coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' THEN
    RAISE EXCEPTION 'Acesso negado: operação financeira sensível requer autenticação de dois fatores (MFA/AAL2).'
      USING ERRCODE = '42501';
  END IF;

  -- 3. RBAC Check (owner, admin, finance)
  IF NOT public.has_organization_role(p_org_id, ARRAY['owner', 'admin', 'finance']) THEN
    RAISE EXCEPTION 'Acesso negado: apenas membros autorizados podem processar reembolsos.'
      USING ERRCODE = '42501';
  END IF;

  -- 4. Idempotency Key Check
  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'Chave de idempotência (p_idempotency_key) obrigatória para liquidação de reembolso.';
  END IF;

  IF p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'O valor do reembolso deve ser maior que zero.';
  END IF;

  -- 5. Idempotent Retry Detection
  SELECT id, organization_id, account_id, amount_cents INTO v_existing_tx
  FROM public.business_transactions
  WHERE cross_context_id = p_idempotency_key;

  IF FOUND THEN
    IF v_existing_tx.organization_id = p_org_id 
       AND v_existing_tx.account_id = p_pj_account_id 
       AND v_existing_tx.amount_cents = p_amount_cents THEN
      RETURN p_idempotency_key;
    ELSE
      RAISE EXCEPTION 'Conflito de idempotência: a chave fornecida já foi utilizada para outra operação.'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  -- 6. Lock and Validate Reconciliation
  SELECT * INTO v_rec
  FROM public.reconciliations
  WHERE id = p_reconciliation_id AND organization_id = p_org_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conciliação não encontrada para esta organização.';
  END IF;

  IF v_rec.status = 'resolved' OR v_rec.status = 'cancelled' THEN
    RAISE EXCEPTION 'Esta conciliação já foi concluída ou cancelada.';
  END IF;

  -- 7. Beneficiary Resolution
  v_beneficiary_id := v_rec.user_id;
  IF v_beneficiary_id IS NULL AND v_rec.partner_id IS NOT NULL THEN
    SELECT profile_id INTO v_beneficiary_id
    FROM public.partners
    WHERE id = v_rec.partner_id AND organization_id = p_org_id;
  END IF;

  IF v_beneficiary_id IS NULL THEN
    RAISE EXCEPTION 'Beneficiário não identificado para a conciliação informada.';
  END IF;

  -- 8. Lock and Validate PJ Account (Tenant Ownership)
  SELECT * INTO v_pj_acc
  FROM public.business_accounts
  WHERE id = p_pj_account_id AND organization_id = p_org_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta PJ não encontrada ou não pertence à organização especificada.';
  END IF;

  -- 9. Lock and Validate PF Account (Beneficiary Ownership)
  SELECT * INTO v_pf_acc
  FROM public.personal_accounts
  WHERE id = p_pf_account_id AND user_id = v_beneficiary_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta PF de destino não encontrada ou não pertence ao beneficiário da conciliação.';
  END IF;

  -- 10. Compute Resolution Amounts
  v_new_resolved := v_rec.resolved_amount_cents + p_amount_cents;
  IF v_new_resolved > v_rec.amount_cents THEN
    RAISE EXCEPTION 'O valor acumulado de reembolsos excede o total da pendência.';
  END IF;

  IF v_new_resolved = v_rec.amount_cents THEN
    v_new_status := 'resolved';
  ELSE
    v_new_status := 'partially_resolved';
  END IF;

  -- 11. Insert Reimbursement Record
  INSERT INTO public.reimbursements (
    organization_id,
    reconciliation_id,
    amount_cents,
    payment_date,
    notes,
    cross_context_id
  ) VALUES (
    p_org_id,
    p_reconciliation_id,
    p_amount_cents,
    CURRENT_DATE,
    p_notes,
    p_idempotency_key
  );

  -- 12. Update Reconciliation Row
  UPDATE public.reconciliations
  SET resolved_amount_cents = v_new_resolved,
      status = v_new_status,
      cross_context_id = p_idempotency_key,
      resolved_at = CASE WHEN v_new_status = 'resolved' THEN now() ELSE resolved_at END
  WHERE id = p_reconciliation_id AND organization_id = p_org_id;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  IF v_rows_affected <> 1 THEN
    RAISE EXCEPTION 'Falha de concorrência ao atualizar registro de conciliação.';
  END IF;

  -- 13. Insert Business Transaction (PJ Expense) with cross_context_id
  INSERT INTO public.business_transactions (
    organization_id,
    account_id,
    type,
    title,
    amount_cents,
    transaction_date,
    category,
    notes,
    cross_context_id
  ) VALUES (
    p_org_id,
    p_pj_account_id,
    'expense',
    coalesce(p_notes, 'Reembolso de Despesa PF ↔ PJ'),
    p_amount_cents,
    CURRENT_DATE,
    'reimbursement',
    'Liquidado via conciliação cross-context',
    p_idempotency_key
  );

  -- Update PJ Account Balance
  UPDATE public.business_accounts
  SET balance_cents = balance_cents - p_amount_cents
  WHERE id = p_pj_account_id AND organization_id = p_org_id;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  IF v_rows_affected <> 1 THEN
    RAISE EXCEPTION 'Falha ao debitar saldo da conta PJ.';
  END IF;

  -- 14. Insert Personal Transaction (PF Income) for Beneficiary with SAME cross_context_id
  INSERT INTO public.personal_transactions (
    user_id,
    account_id,
    type,
    title,
    amount_cents,
    transaction_date,
    category,
    notes,
    cross_context_id
  ) VALUES (
    v_beneficiary_id,
    p_pf_account_id,
    'income',
    coalesce(p_notes, 'Reembolso Recebido da Empresa'),
    p_amount_cents,
    CURRENT_DATE,
    'reimbursement',
    'Recebido via conciliação cross-context',
    p_idempotency_key
  );

  -- Update PF Account Balance for Beneficiary
  UPDATE public.personal_accounts
  SET balance_cents = balance_cents + p_amount_cents
  WHERE id = p_pf_account_id AND user_id = v_beneficiary_id;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  IF v_rows_affected <> 1 THEN
    RAISE EXCEPTION 'Falha ao creditar saldo da conta PF do beneficiário.';
  END IF;

  RETURN p_idempotency_key;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_cross_context_reimbursement(uuid, uuid, bigint, uuid, uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_cross_context_reimbursement(uuid, uuid, bigint, uuid, uuid, uuid, text) TO authenticated;

COMMENT ON FUNCTION public.process_cross_context_reimbursement IS 
  'Liquida reembolsos societários com atomicidade, AAL2, RBAC, resolução de beneficiário e idempotência estrita.';

-- ------------------------------------------------------------------------------
-- 6. FUNCTION: process_pro_labore_payout
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_pro_labore_payout(
  p_org_id uuid,
  p_partner_id uuid,
  p_amount_cents bigint,
  p_pj_account_id uuid,
  p_pf_account_id uuid,
  p_idempotency_key uuid,
  p_transaction_date date DEFAULT CURRENT_DATE,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_partner record;
  v_pj_acc record;
  v_pf_acc record;
  v_beneficiary_id uuid;
  v_biz_tx_id uuid;
  v_existing_tx record;
  v_rows_affected integer;
BEGIN
  -- 1. Authentication Check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado: sessão de usuário ausente.'
      USING ERRCODE = '42501';
  END IF;

  -- 2. AAL2 Server-Side Check
  IF coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' THEN
    RAISE EXCEPTION 'Acesso negado: operação financeira sensível requer autenticação de dois fatores (MFA/AAL2).'
      USING ERRCODE = '42501';
  END IF;

  -- 3. RBAC Check (owner, admin, finance)
  IF NOT public.has_organization_role(p_org_id, ARRAY['owner', 'admin', 'finance']) THEN
    RAISE EXCEPTION 'Acesso negado: apenas membros autorizados podem registrar pró-labore.'
      USING ERRCODE = '42501';
  END IF;

  -- 4. Idempotency Key Check
  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'Chave de idempotência (p_idempotency_key) obrigatória para liquidação de pró-labore.';
  END IF;

  IF p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'O valor do pró-labore deve ser maior que zero.';
  END IF;

  -- 5. Idempotent Retry Detection
  SELECT id, organization_id, account_id, amount_cents INTO v_existing_tx
  FROM public.business_transactions
  WHERE cross_context_id = p_idempotency_key;

  IF FOUND THEN
    IF v_existing_tx.organization_id = p_org_id 
       AND v_existing_tx.account_id = p_pj_account_id 
       AND v_existing_tx.amount_cents = p_amount_cents THEN
      RETURN p_idempotency_key;
    ELSE
      RAISE EXCEPTION 'Conflito de idempotência: a chave fornecida já foi utilizada para outra operação.'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  -- 6. Lock and Validate Partner
  SELECT * INTO v_partner
  FROM public.partners
  WHERE id = p_partner_id AND organization_id = p_org_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sócio não encontrado ou não pertence a esta organização.';
  END IF;

  IF v_partner.status <> 'active' THEN
    RAISE EXCEPTION 'Sócio inativo não pode receber retiradas societárias.';
  END IF;

  IF v_partner.profile_id IS NULL THEN
    RAISE EXCEPTION 'Sócio não possui perfil de usuário vinculado para recebimento PF.';
  END IF;

  v_beneficiary_id := v_partner.profile_id;

  -- 7. Lock and Validate PJ Account (Tenant Ownership)
  SELECT * INTO v_pj_acc
  FROM public.business_accounts
  WHERE id = p_pj_account_id AND organization_id = p_org_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta PJ não encontrada ou não pertence à organização especificada.';
  END IF;

  -- 8. Lock and Validate PF Account (Beneficiary Ownership)
  SELECT * INTO v_pf_acc
  FROM public.personal_accounts
  WHERE id = p_pf_account_id AND user_id = v_beneficiary_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta PF de destino não encontrada ou não pertence ao sócio beneficiário.';
  END IF;

  v_biz_tx_id := gen_random_uuid();

  -- 9. Insert Business Transaction (PJ Expense) with cross_context_id
  INSERT INTO public.business_transactions (
    id,
    organization_id,
    account_id,
    type,
    title,
    amount_cents,
    transaction_date,
    category,
    notes,
    cross_context_id
  ) VALUES (
    v_biz_tx_id,
    p_org_id,
    p_pj_account_id,
    'expense',
    coalesce(p_notes, 'Pagamento de Pró-Labore Sócio'),
    p_amount_cents,
    coalesce(p_transaction_date, CURRENT_DATE),
    'pro_labore',
    'Retirada mensal pró-labore societário',
    p_idempotency_key
  );

  -- Update PJ Account Balance
  UPDATE public.business_accounts
  SET balance_cents = balance_cents - p_amount_cents
  WHERE id = p_pj_account_id AND organization_id = p_org_id;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  IF v_rows_affected <> 1 THEN
    RAISE EXCEPTION 'Falha ao debitar saldo da conta PJ.';
  END IF;

  -- 10. Insert Partner Transaction Record with cross_context_id
  INSERT INTO public.partner_transactions (
    organization_id,
    partner_id,
    type,
    amount_cents,
    transaction_date,
    business_transaction_id,
    notes,
    cross_context_id
  ) VALUES (
    p_org_id,
    p_partner_id,
    'pro_labore',
    p_amount_cents,
    coalesce(p_transaction_date, CURRENT_DATE),
    v_biz_tx_id,
    p_notes,
    p_idempotency_key
  );

  -- 11. Insert Personal Transaction Record (PF Income) for BENEFICIARY with SAME cross_context_id
  INSERT INTO public.personal_transactions (
    user_id,
    account_id,
    type,
    title,
    amount_cents,
    transaction_date,
    category,
    notes,
    cross_context_id
  ) VALUES (
    v_beneficiary_id,
    p_pf_account_id,
    'income',
    'Recebimento de Pró-Labore',
    p_amount_cents,
    coalesce(p_transaction_date, CURRENT_DATE),
    'pro_labore',
    coalesce(p_notes, 'Pró-labore empresarial recebido'),
    p_idempotency_key
  );

  -- Update PF Account Balance for Beneficiary
  UPDATE public.personal_accounts
  SET balance_cents = balance_cents + p_amount_cents
  WHERE id = p_pf_account_id AND user_id = v_beneficiary_id;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  IF v_rows_affected <> 1 THEN
    RAISE EXCEPTION 'Falha ao creditar saldo da conta PF do sócio beneficiário.';
  END IF;

  RETURN p_idempotency_key;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_pro_labore_payout(uuid, uuid, bigint, uuid, uuid, uuid, date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_pro_labore_payout(uuid, uuid, bigint, uuid, uuid, uuid, date, text) TO authenticated;

COMMENT ON FUNCTION public.process_pro_labore_payout IS 
  'Processa pagamento de pró-labore societário com atomicidade, AAL2, RBAC, resolução de beneficiário e idempotência estrita.';

-- ------------------------------------------------------------------------------
-- 7. FUNCTION: process_profit_distribution_payout
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_profit_distribution_payout(
  p_org_id uuid,
  p_partner_id uuid,
  p_amount_cents bigint,
  p_pj_account_id uuid,
  p_pf_account_id uuid,
  p_idempotency_key uuid,
  p_transaction_date date DEFAULT CURRENT_DATE,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_partner record;
  v_pj_acc record;
  v_pf_acc record;
  v_beneficiary_id uuid;
  v_biz_tx_id uuid;
  v_existing_tx record;
  v_rows_affected integer;
BEGIN
  -- 1. Authentication Check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado: sessão de usuário ausente.'
      USING ERRCODE = '42501';
  END IF;

  -- 2. AAL2 Server-Side Check
  IF coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' THEN
    RAISE EXCEPTION 'Acesso negado: operação financeira sensível requer autenticação de dois fatores (MFA/AAL2).'
      USING ERRCODE = '42501';
  END IF;

  -- 3. RBAC Check (owner, admin, finance)
  IF NOT public.has_organization_role(p_org_id, ARRAY['owner', 'admin', 'finance']) THEN
    RAISE EXCEPTION 'Acesso negado: apenas membros autorizados podem registrar distribuição de lucros.'
      USING ERRCODE = '42501';
  END IF;

  -- 4. Idempotency Key Check
  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'Chave de idempotência (p_idempotency_key) obrigatória para liquidação de lucros.';
  END IF;

  IF p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'O valor da distribuição de lucros deve ser maior que zero.';
  END IF;

  -- 5. Idempotent Retry Detection
  SELECT id, organization_id, account_id, amount_cents INTO v_existing_tx
  FROM public.business_transactions
  WHERE cross_context_id = p_idempotency_key;

  IF FOUND THEN
    IF v_existing_tx.organization_id = p_org_id 
       AND v_existing_tx.account_id = p_pj_account_id 
       AND v_existing_tx.amount_cents = p_amount_cents THEN
      RETURN p_idempotency_key;
    ELSE
      RAISE EXCEPTION 'Conflito de idempotência: a chave fornecida já foi utilizada para outra operação.'
        USING ERRCODE = '23505';
    END IF;
  END IF;

  -- 6. Lock and Validate Partner
  SELECT * INTO v_partner
  FROM public.partners
  WHERE id = p_partner_id AND organization_id = p_org_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sócio não encontrado ou não pertence a esta organização.';
  END IF;

  IF v_partner.status <> 'active' THEN
    RAISE EXCEPTION 'Sócio inativo não pode receber distribuições societárias.';
  END IF;

  IF v_partner.profile_id IS NULL THEN
    RAISE EXCEPTION 'Sócio não possui perfil de usuário vinculado para recebimento PF.';
  END IF;

  v_beneficiary_id := v_partner.profile_id;

  -- 7. Lock and Validate PJ Account (Tenant Ownership)
  SELECT * INTO v_pj_acc
  FROM public.business_accounts
  WHERE id = p_pj_account_id AND organization_id = p_org_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta PJ não encontrada ou não pertence à organização especificada.';
  END IF;

  -- 8. Lock and Validate PF Account (Beneficiary Ownership)
  SELECT * INTO v_pf_acc
  FROM public.personal_accounts
  WHERE id = p_pf_account_id AND user_id = v_beneficiary_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conta PF de destino não encontrada ou não pertence ao sócio beneficiário.';
  END IF;

  v_biz_tx_id := gen_random_uuid();

  -- 9. Insert Business Transaction (PJ Expense / Payout) with cross_context_id
  INSERT INTO public.business_transactions (
    id,
    organization_id,
    account_id,
    type,
    title,
    amount_cents,
    transaction_date,
    category,
    notes,
    cross_context_id
  ) VALUES (
    v_biz_tx_id,
    p_org_id,
    p_pj_account_id,
    'expense',
    coalesce(p_notes, 'Distribuição de Lucros Societária'),
    p_amount_cents,
    coalesce(p_transaction_date, CURRENT_DATE),
    'profit_distribution',
    'Distribuição de lucros societária',
    p_idempotency_key
  );

  -- Update PJ Account Balance
  UPDATE public.business_accounts
  SET balance_cents = balance_cents - p_amount_cents
  WHERE id = p_pj_account_id AND organization_id = p_org_id;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  IF v_rows_affected <> 1 THEN
    RAISE EXCEPTION 'Falha ao debitar saldo da conta PJ.';
  END IF;

  -- 10. Insert Partner Transaction Record with cross_context_id
  INSERT INTO public.partner_transactions (
    organization_id,
    partner_id,
    type,
    amount_cents,
    transaction_date,
    business_transaction_id,
    notes,
    cross_context_id
  ) VALUES (
    p_org_id,
    p_partner_id,
    'profit_distribution',
    p_amount_cents,
    coalesce(p_transaction_date, CURRENT_DATE),
    v_biz_tx_id,
    p_notes,
    p_idempotency_key
  );

  -- 11. Insert Personal Transaction Record (PF Income) for BENEFICIARY with SAME cross_context_id
  INSERT INTO public.personal_transactions (
    user_id,
    account_id,
    type,
    title,
    amount_cents,
    transaction_date,
    category,
    notes,
    cross_context_id
  ) VALUES (
    v_beneficiary_id,
    p_pf_account_id,
    'income',
    'Recebimento de Distribuição de Lucros',
    p_amount_cents,
    coalesce(p_transaction_date, CURRENT_DATE),
    'profit_distribution',
    coalesce(p_notes, 'Distribuição de lucros recebida da empresa'),
    p_idempotency_key
  );

  -- Update PF Account Balance for Beneficiary
  UPDATE public.personal_accounts
  SET balance_cents = balance_cents + p_amount_cents
  WHERE id = p_pf_account_id AND user_id = v_beneficiary_id;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
  IF v_rows_affected <> 1 THEN
    RAISE EXCEPTION 'Falha ao creditar saldo da conta PF do sócio beneficiário.';
  END IF;

  RETURN p_idempotency_key;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_profit_distribution_payout(uuid, uuid, bigint, uuid, uuid, uuid, date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_profit_distribution_payout(uuid, uuid, bigint, uuid, uuid, uuid, date, text) TO authenticated;

COMMENT ON FUNCTION public.process_profit_distribution_payout IS 
  'Processa distribuição de lucros societária com atomicidade, AAL2, RBAC, resolução de beneficiário e idempotência estrita.';
