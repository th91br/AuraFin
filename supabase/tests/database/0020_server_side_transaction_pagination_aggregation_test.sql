begin;
select plan(18);

select has_function('public', 'list_personal_transactions_page', array['integer','date','uuid','text','text','text','date','date']);
select has_function('public', 'list_business_transactions_page', array['uuid','integer','date','uuid','text','text','text','date','date']);
select has_function('public', 'get_personal_transaction_analytics', array['date','date','text','text']);
select has_function('public', 'get_business_transaction_analytics', array['uuid','date','date','text','text']);
select has_function('public', 'export_personal_transactions_csv', array['date','date','text','text']);
select has_function('public', 'export_business_transactions_csv', array['uuid','date','date','text','text']);
select has_function('public', 'export_business_transactions_json', array['uuid','date','date','text','text']);

select ok((select proowner = (select oid from pg_roles where rolname = 'postgres') from pg_proc where oid = 'public.list_personal_transactions_page(integer,date,uuid,text,text,text,date,date)'::regprocedure), 'PF pagination owned by postgres');
select ok((select proowner = (select oid from pg_roles where rolname = 'postgres') from pg_proc where oid = 'public.list_business_transactions_page(uuid,integer,date,uuid,text,text,text,date,date)'::regprocedure), 'PJ pagination owned by postgres');
select ok(has_function_privilege('authenticated', 'public.list_personal_transactions_page(integer,date,uuid,text,text,text,date,date)', 'EXECUTE'), 'authenticated can execute PF pagination');
select ok(has_function_privilege('authenticated', 'public.list_business_transactions_page(uuid,integer,date,uuid,text,text,text,date,date)', 'EXECUTE'), 'authenticated can execute PJ pagination');
select ok(has_function_privilege('authenticated', 'public.get_personal_transaction_analytics(date,date,text,text)', 'EXECUTE'), 'authenticated can execute PF analytics');
select ok(has_function_privilege('authenticated', 'public.get_business_transaction_analytics(uuid,date,date,text,text)', 'EXECUTE'), 'authenticated can execute PJ analytics');
select ok(has_function_privilege('authenticated', 'public.export_business_transactions_json(uuid,date,date,text,text)', 'EXECUTE'), 'authenticated can execute PJ JSON export');

select ok((select prosecdef = false from pg_proc where oid = 'public.list_personal_transactions_page(integer,date,uuid,text,text,text,date,date)'::regprocedure), 'PF pagination remains SECURITY INVOKER');
select ok((select prosecdef = false from pg_proc where oid = 'public.list_business_transactions_page(uuid,integer,date,uuid,text,text,text,date,date)'::regprocedure), 'PJ pagination remains SECURITY INVOKER');
select ok((select array_to_string(proconfig, ',') ilike '%search_path=%' from pg_proc where oid = 'public.get_personal_transaction_analytics(date,date,text,text)'::regprocedure), 'PF analytics pins search_path');
select ok((select array_to_string(proconfig, ',') ilike '%search_path=%' from pg_proc where oid = 'public.get_business_transaction_analytics(uuid,date,date,text,text)'::regprocedure), 'PJ analytics pins search_path');

select * from finish();
rollback;
