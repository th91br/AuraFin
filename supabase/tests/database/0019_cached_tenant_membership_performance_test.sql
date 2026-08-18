begin;
select plan(9);

select has_function('public', 'current_user_organization_ids', array[]::text[]);
select ok((select proowner = (select oid from pg_roles where rolname = 'postgres') from pg_proc where oid = 'public.current_user_organization_ids()'::regprocedure), 'membership cache owned by postgres');
select ok((select prosecdef from pg_proc where oid = 'public.current_user_organization_ids()'::regprocedure), 'membership cache is SECURITY DEFINER');
select ok((select array_to_string(proconfig, ',') ilike '%search_path=%' from pg_proc where oid = 'public.current_user_organization_ids()'::regprocedure), 'membership cache pins search_path');
select ok(has_function_privilege('authenticated', 'public.current_user_organization_ids()', 'EXECUTE'), 'authenticated can execute membership cache');
select ok(not has_function_privilege('anon', 'public.current_user_organization_ids()', 'EXECUTE'), 'anon cannot execute membership cache');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'business_transactions' and qual ilike '%current_user_organization_ids%'), 'transaction RLS uses cached membership set');
select ok(not exists (select 1 from pg_policies where schemaname = 'public' and tablename in ('business_accounts','business_transactions','clients','suppliers','projects','cost_centers','corporate_cards','corporate_card_invoices','invoices','receivables','payables','partners','partner_transactions','tax_records','accounting_periods','collection_events','legacy_pj_import_runs') and (qual::text like '%is_organization_member%' or with_check::text like '%is_organization_member%')), 'profiled tenant policies avoid per-row membership helper');
select ok(exists (select 1 from information_schema.views where table_schema = 'public' and table_name = 'v_defaulters'), 'defaulters view exists');

select * from finish();
rollback;
