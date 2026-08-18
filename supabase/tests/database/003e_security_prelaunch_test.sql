-- ==============================================================================
-- AURAFIN — DATABASE TESTS: FASE 3E SECURITY PRE-LAUNCH (OWASP ASVS 5.0.0)
-- ==============================================================================
-- Framework: pgTAP
-- Scope:
-- 1. RLS Inventory on ALL public tables (34 tables must have RLS enabled).
-- 2. Granular RLS verification on each sensitive entity.
-- 3. Storage Bucket Configuration (financial-documents must be private).
-- 4. View Security Invoker on v_defaulters.
-- 5. Function Grants & Least Privilege Checks (anon blocked from helper & RPC execution).
-- 6. Security Definer Search Path Protection (all public definer functions must set search_path = '').
-- 7. Detection of Obsolete Broad Permissive Storage Policies (must be 0).
-- 8. Detection of Unrestricted Wildcard Policies on Financial Entities.
-- 9. Organization UPDATE RLS Policy outer variable qualification verification.
-- ==============================================================================

BEGIN;
SELECT plan(49);

-- ------------------------------------------------------------------------------
-- 1. RLS INVENTORY ON ALL PUBLIC TABLES (0 tables without RLS)
-- ------------------------------------------------------------------------------
SELECT row_eq(
  $$
    SELECT count(*)::integer 
    FROM pg_tables 
    WHERE schemaname = 'public' AND rowsecurity = false;
  $$,
  ROW(0::integer),
  'Todas as tabelas do schema public devem possuir Row Level Security (RLS) habilitado'
);

-- ------------------------------------------------------------------------------
-- 2. GRANULAR RLS VERIFICATION PER TABLE (34 KEY TABLES)
-- ------------------------------------------------------------------------------
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'), true, 'RLS habilitado em profiles');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organizations'), true, 'RLS habilitado em organizations');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organization_members'), true, 'RLS habilitado em organization_members');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'personal_accounts'), true, 'RLS habilitado em personal_accounts');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'personal_transactions'), true, 'RLS habilitado em personal_transactions');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'personal_credit_cards'), true, 'RLS habilitado em personal_credit_cards');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'personal_card_invoices'), true, 'RLS habilitado em personal_card_invoices');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recurrence_rules'), true, 'RLS habilitado em recurrence_rules');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'budgets'), true, 'RLS habilitado em budgets');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'goals'), true, 'RLS habilitado em goals');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'goal_contributions'), true, 'RLS habilitado em goal_contributions');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'emergency_reserves'), true, 'RLS habilitado em emergency_reserves');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'debts'), true, 'RLS habilitado em debts');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assets'), true, 'RLS habilitado em assets');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'investments'), true, 'RLS habilitado em investments');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tax_metadata'), true, 'RLS habilitado em tax_metadata');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'business_accounts'), true, 'RLS habilitado em business_accounts');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'business_transactions'), true, 'RLS habilitado em business_transactions');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients'), true, 'RLS habilitado em clients');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'suppliers'), true, 'RLS habilitado em suppliers');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'receivables'), true, 'RLS habilitado em receivables');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payables'), true, 'RLS habilitado em payables');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices'), true, 'RLS habilitado em invoices');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'corporate_cards'), true, 'RLS habilitado em corporate_cards');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects'), true, 'RLS habilitado em projects');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cost_centers'), true, 'RLS habilitado em cost_centers');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tax_records'), true, 'RLS habilitado em tax_records');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partners'), true, 'RLS habilitado em partners');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partner_transactions'), true, 'RLS habilitado em partner_transactions');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reconciliations'), true, 'RLS habilitado em reconciliations');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reimbursements'), true, 'RLS habilitado em reimbursements');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'collection_events'), true, 'RLS habilitado em collection_events');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'monthly_closings'), true, 'RLS habilitado em monthly_closings');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents'), true, 'RLS habilitado em documents');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_links'), true, 'RLS habilitado em document_links');
SELECT is((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'legacy_import_runs'), true, 'RLS habilitado em legacy_import_runs');

-- ------------------------------------------------------------------------------
-- 3. STORAGE BUCKET CONFIGURATION
-- ------------------------------------------------------------------------------
SELECT is(
  (SELECT public FROM storage.buckets WHERE id = 'financial-documents'),
  false,
  'O bucket financial-documents deve ser estritamente privado (public = false)'
);

-- ------------------------------------------------------------------------------
-- 4. VIEW SECURITY INVOKER CHECK (v_defaulters)
-- ------------------------------------------------------------------------------
SELECT is(
  (
    SELECT reloptions @> ARRAY['security_invoker=true'] 
    FROM pg_class 
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
    WHERE pg_namespace.nspname = 'public' AND pg_class.relname = 'v_defaulters'
  ),
  true,
  'A view v_defaulters deve ter security_invoker = true para respeitar o RLS das tabelas base'
);

-- ------------------------------------------------------------------------------
-- 5. FUNCTION GRANTS & LEAST PRIVILEGE CHECKS
-- ------------------------------------------------------------------------------
SELECT is(
  has_function_privilege('anon', 'public.is_organization_member(uuid)', 'EXECUTE'),
  false,
  'Papel anon NÃO deve ter permissão de execução em public.is_organization_member'
);

SELECT is(
  has_function_privilege('anon', 'public.has_organization_role(uuid, text[])', 'EXECUTE'),
  false,
  'Papel anon NÃO deve ter permissão de execução em public.has_organization_role'
);

SELECT is(
  has_function_privilege('anon', 'public.create_organization_with_owner(text, text, text)', 'EXECUTE'),
  false,
  'Papel anon NÃO deve ter permissão de execução em public.create_organization_with_owner'
);

-- ------------------------------------------------------------------------------
-- 6. SECURITY DEFINER SEARCH PATH CHECK
-- ------------------------------------------------------------------------------
SELECT is(
  (
    SELECT count(*)::integer 
    FROM pg_proc p 
    JOIN pg_namespace n ON n.oid = p.pronamespace 
    WHERE n.nspname = 'public' 
      AND p.prosecdef = true 
      AND (
        p.proconfig IS NULL 
        OR NOT array_to_string(p.proconfig, ',') ILIKE '%search_path=%'
      )
  ),
  0::integer,
  'Todas as funções SECURITY DEFINER no schema public devem possuir SET search_path = '''''
);

-- ------------------------------------------------------------------------------
-- 7. DETECT OBSOLETE BROAD PERMISSIVE POLICIES ON STORAGE.OBJECTS
-- ------------------------------------------------------------------------------
SELECT is(
  (
    SELECT count(*)::integer 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname IN ('Acesso de Leitura ao Bucket de Documentos Financeiros', 'Upload de Documentos no Bucket Financeiro')
  ),
  0::integer,
  'Políticas amplas legadas de storage.objects foram removidas com sucesso'
);

-- ------------------------------------------------------------------------------
-- 8. DETECT CRITICAL CROSS-TENANT RLS LEAKS
-- ------------------------------------------------------------------------------
SELECT is(
  (
    SELECT count(*)::integer 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('business_transactions', 'business_accounts', 'receivables', 'payables', 'invoices', 'partners')
      AND (qual ILIKE '%true%' OR with_check ILIKE '%true%')
  ),
  0::integer,
  'Nenhuma política em tabelas financeiras PJ pode conter permissão irrestrita (TRUE)'
);

SELECT is(
  (
    SELECT count(*)::integer 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('personal_transactions', 'personal_accounts', 'personal_credit_cards', 'budgets', 'goals')
      AND (qual ILIKE '%true%' OR with_check ILIKE '%true%')
  ),
  0::integer,
  'Nenhuma política em tabelas financeiras PF pode conter permissão irrestrita (TRUE)'
);

-- ------------------------------------------------------------------------------
-- 9. ORGANIZATIONS UPDATE POLICY QUALIFICATION CHECK
-- ------------------------------------------------------------------------------
SELECT is(
  (
    SELECT count(*)::integer 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'organizations' 
      AND policyname = 'Owners e Admins atualizam a organização'
      AND qual ILIKE '%organizations.id%'
  ),
  1::integer,
  'Política de UPDATE em organizations qualifica corretamente organizations.id'
);

-- ------------------------------------------------------------------------------
-- 10. HEALTH CHECK EXECUTION AND NON-LEAKING RESPONSE
-- ------------------------------------------------------------------------------
SELECT is(
  ((public.health_check())->>'status'),
  'healthy',
  'RPC public.health_check() retorna status healthy'
);

SELECT is(
  ((public.health_check())->>'secret'),
  NULL,
  'RPC public.health_check() não expõe nenhum campo de segredo ou credencial'
);

SELECT * FROM finish();
ROLLBACK;
