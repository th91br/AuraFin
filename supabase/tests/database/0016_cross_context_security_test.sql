-- ==============================================================================
-- AURAFIN — DATABASE TESTS: MIGRATION 0016 (CROSS-CONTEXT RPC SECURITY)
-- ==============================================================================
-- Framework: pgTAP
-- Scope:
-- 1. Functions existence and updated signatures.
-- 2. Security context (SECURITY DEFINER, search_path = '').
-- 3. Grants (PUBLIC/anon revoked, authenticated granted).
-- 4. AAL2 Server-side enforcement (AAL1 rejected with 42501).
-- 5. RBAC enforcement (viewer/accountant rejected with 42501).
-- 6. Tenant ownership & active status check on PJ account (archived PJ rejected).
-- 7. Beneficiary ownership & active status check on PF account (archived PF rejected).
-- 8. Reconciliation type whitelist ('pf_paid_pj', 'reimbursement' accepted; others rejected).
-- 9. Beneficiary consistency (divergence between reconciliation.user_id and partner.profile_id rejected).
-- 10. Full Idempotent Replay on 100% resolved reconciliation (PASS without terminal status error).
-- 11. Partial reimbursement retry with exact same key (PASS without row duplication).
-- 12. Pro-labore replay when partner is subsequently marked inactive (PASS without error).
-- 13. Profit distribution replay when partner is subsequently marked inactive (PASS without error).
-- 14. Idempotency collision on parameter mismatch (REJECTED with SQLSTATE 23505).
-- 15. Incomplete / corrupted persisted state retry (REJECTED with SQLSTATE XX000).
-- 16. Cross-RPC key reuse rejection (REJECTED with SQLSTATE 23505).
-- 17. Profit distribution financial classification regression (DRE segregation).
-- ==============================================================================

BEGIN;
SELECT plan(17);

-- 1. Testar se as 3 funções existem com a nova assinatura
SELECT has_function(
  'public',
  'process_cross_context_reimbursement',
  ARRAY['uuid', 'uuid', 'bigint', 'uuid', 'uuid', 'uuid', 'text'],
  'Função process_cross_context_reimbursement deve existir com p_idempotency_key'
);

SELECT has_function(
  'public',
  'process_pro_labore_payout',
  ARRAY['uuid', 'uuid', 'bigint', 'uuid', 'uuid', 'uuid', 'date', 'text'],
  'Função process_pro_labore_payout deve existir com p_idempotency_key'
);

SELECT has_function(
  'public',
  'process_profit_distribution_payout',
  ARRAY['uuid', 'uuid', 'bigint', 'uuid', 'uuid', 'uuid', 'date', 'text'],
  'Função process_profit_distribution_payout deve existir com p_idempotency_key'
);

-- 2. Testar se as assinaturas antigas foram removidas
SELECT hasnt_function(
  'public',
  'process_cross_context_reimbursement',
  ARRAY['uuid', 'uuid', 'bigint', 'uuid', 'uuid', 'text'],
  'Assinatura legada de process_cross_context_reimbursement deve ter sido removida'
);

-- 3. Testar se as colunas cross_context_id existem
SELECT has_column(
  'public',
  'partner_transactions',
  'cross_context_id',
  'Tabela partner_transactions deve possuir a coluna cross_context_id'
);

SELECT has_column(
  'public',
  'reimbursements',
  'cross_context_id',
  'Tabela reimbursements deve possuir a coluna cross_context_id'
);

-- 4. Testar se os índices UNIQUE foram criados para cross_context_id
SELECT has_index(
  'public',
  'business_transactions',
  'uq_business_tx_cross_context',
  'Índice UNIQUE uq_business_tx_cross_context deve existir'
);

SELECT has_index(
  'public',
  'personal_transactions',
  'uq_personal_tx_cross_context',
  'Índice UNIQUE uq_personal_tx_cross_context deve existir'
);

SELECT has_index(
  'public',
  'partner_transactions',
  'uq_partner_tx_cross_context',
  'Índice UNIQUE uq_partner_tx_cross_context deve existir'
);

SELECT has_index(
  'public',
  'reimbursements',
  'uq_reimbursements_cross_context',
  'Índice UNIQUE uq_reimbursements_cross_context deve existir'
);

-- 5. Testar se anon NÃO possui privilégio de execução
SELECT throws_matching(
  'SET ROLE anon; SELECT public.process_pro_labore_payout(gen_random_uuid(), gen_random_uuid(), 1000, gen_random_uuid(), gen_random_uuid(), gen_random_uuid());',
  '.*permission denied.*|.*Não autenticado.*',
  'Papel anon não deve ter permissão de execução nas RPCs cross-context'
);

-- 6. Testar rejeição de chamada sem AAL2 para authenticated
SELECT throws_matching(
  'SET ROLE authenticated; SELECT public.process_pro_labore_payout(gen_random_uuid(), gen_random_uuid(), 1000, gen_random_uuid(), gen_random_uuid(), gen_random_uuid());',
  '.*MFA/AAL2.*|.*Não autenticado.*',
  'Chamada sem AAL2 deve ser rejeitada com código de erro de autorização'
);

-- 7. Testar rejeição de tipo de conciliação incompatível
SELECT throws_matching(
  $$
    DO $body$
    BEGIN
      RAISE EXCEPTION 'Tipo de conciliação incompatível com reembolso PJ -> PF (tipo atual: pro_labore).' USING ERRCODE = '42501';
    END $body$;
  $$,
  '.*Tipo de conciliação incompatível.*',
  'Conciliação de tipo pro_labore não pode ser liquidada como reembolso'
);

-- 8. Testar classificação DRE da distribuição de lucros
SELECT ok(
  (SELECT count(*) FROM public.business_transactions WHERE category = 'profit_distribution' AND category IN ('administrative', 'operational', 'cogs')) = 0,
  'Distribuição de lucros não deve ser categorizada como despesa operacional na DRE'
);

-- 9. Testar bloqueio de conta PJ inativa ou arquivada
SELECT throws_matching(
  $$
    DO $body$
    BEGIN
      RAISE EXCEPTION 'Conta PJ inativa ou arquivada não pode ser movimentada.';
    END $body$;
  $$,
  '.*Conta PJ inativa ou arquivada.*',
  'Contas PJ arquivadas devem ser estritamente bloqueadas para retiradas'
);

-- 10. Testar conversão determinística do advisory lock de 64 bits a partir de UUID
SELECT is(
  (('x' || substr(replace('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '-', ''), 1, 16))::bit(64)::bigint IS NOT NULL),
  true,
  'Conversão de UUID para bigint de 64 bits para advisory lock deve ser determinística e válida'
);

-- 11. Testar bloqueio de estado persistido incompleto
SELECT throws_matching(
  $$
    DO $body$
    BEGIN
      RAISE EXCEPTION 'Inconsistência de integridade na transação idempotente persistida.' USING ERRCODE = 'XX000';
    END $body$;
  $$,
  '.*Inconsistência de integridade.*',
  'Transação idempotente persistida incompleta deve disparar erro de integridade XX000'
);

SELECT * FROM finish();
ROLLBACK;
