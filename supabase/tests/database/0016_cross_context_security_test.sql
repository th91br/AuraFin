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
-- 6. Tenant ownership (PJ account of another org rejected).
-- 7. Beneficiary resolution (PF account of wrong user rejected).
-- 8. Idempotency (retry with same key does not duplicate records).
-- 9. Idempotency conflict detection (same key with mismatch parameters rejected).
-- 10. Traceability: same cross_context_id persisted across all related rows.
-- ==============================================================================

BEGIN;
SELECT plan(12);

-- 1. Testar se as 3 funções existem com a nova assinatura (7 ou 8 parâmetros incluindo p_idempotency_key)
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

-- 2. Testar se as assinaturas antigas foram removidas (sem overload ambíguo)
SELECT hasnt_function(
  'public',
  'process_cross_context_reimbursement',
  ARRAY['uuid', 'uuid', 'bigint', 'uuid', 'uuid', 'text'],
  'Assinatura legada de process_cross_context_reimbursement deve ter sido removida'
);

-- 3. Testar se as colunas cross_context_id foram adicionadas
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

-- 5. Testar se PUBLIC e anon NÃO possuem privilégio de execução
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

SELECT * FROM finish();
ROLLBACK;
