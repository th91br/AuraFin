import { spawnSync } from 'node:child_process';

const container = 'supabase_db_aurafin';
const userId = '3f100000-0000-0000-0000-000000000001';
const organizationId = '3f100000-0000-0000-0000-000000000002';
const otherOrganizationId = '3f100000-0000-0000-0000-000000000003';

const sql = String.raw`
\set ON_ERROR_STOP on
\pset pager off
\timing on
begin;

insert into auth.users (id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('${userId}', 'phase-3f1-equivalence@local.invalid', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Phase 3F.1 Equivalence"}'::jsonb, now(), now());
insert into public.organizations (id, name, status, created_by) values ('${organizationId}', 'Phase 3F.1 Synthetic', 'active', '${userId}');
insert into public.organizations (id, name, status, created_by) values ('${otherOrganizationId}', 'Phase 3F.1 Other Tenant', 'active', '${userId}');
insert into public.organization_members (organization_id, user_id, role, status) values ('${organizationId}', '${userId}', 'owner', 'active');

insert into public.personal_transactions (user_id, type, title, amount_cents, transaction_date, category, notes)
select '${userId}', case when g % 4 = 0 then 'income' else 'expense' end, 'PF ' || g, 1000 + (g % 200000), date '2024-01-01' + (g % 730)::integer,
  case g % 5 when 0 then 'moradia' when 1 then 'alimentacao' when 2 then 'transporte' when 3 then 'saude' else 'outros' end, null
from generate_series(1, 50000) g;
insert into public.personal_transactions (user_id, type, title, amount_cents, transaction_date, category, deleted_at)
values ('${userId}', 'expense', 'deleted PF', 999999, date '2025-01-01', 'outros', now());

insert into public.business_transactions (organization_id, type, title, amount_cents, transaction_date, category, is_paid_by_pf, is_personal_expense_in_pj, notes)
select '${organizationId}', case when g % 3 = 0 then 'income' else 'expense' end, 'PJ ' || g, 5000 + (g % 500000), date '2024-01-01' + (g % 730)::integer,
  case g % 5 when 0 then 'operacional' when 1 then 'software' when 2 then 'impostos' when 3 then 'custo_direto' else 'outros' end,
  g % 97 = 0, g % 131 = 0, null
from generate_series(1, 100000) g;
insert into public.business_transactions (organization_id, type, title, amount_cents, transaction_date, category, deleted_at)
values ('${organizationId}', 'expense', 'deleted PJ', 999999, date '2025-01-01', 'outros', now());

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"${userId}","role":"authenticated","aal":"aal2"}';

\echo === FINANCIAL EQUIVALENCE PF 50k ===
with old_result as (
  select coalesce(sum(amount_cents) filter (where type = 'income'), 0)::bigint receipts,
         coalesce(sum(amount_cents) filter (where type = 'expense'), 0)::bigint expenses,
         coalesce(sum(case when type = 'income' then amount_cents when type = 'expense' then -amount_cents else 0 end), 0)::bigint balance
  from public.personal_transactions where user_id = '${userId}' and deleted_at is null
), new_result as (
  select (public.get_personal_transaction_analytics(null, null, null, null)->>'total_receipts_cents')::bigint receipts,
         (public.get_personal_transaction_analytics(null, null, null, null)->>'total_expenses_cents')::bigint expenses,
         (public.get_personal_transaction_analytics(null, null, null, null)->>'balance_cents')::bigint balance
)
select case when old_result = new_result then 'PASS' else 'FAIL' end as financial_equivalence_pf from old_result, new_result;
do $$ declare p jsonb; begin p := public.list_personal_transactions_page(100, null, null, null, null, null, null, null); if jsonb_array_length(p->'rows') > 100 or coalesce(p->>'page_size', '') <> '100' then raise exception 'PF page size gate failed'; end if; end $$;
select 'pf_page_payload_bytes' as metric, pg_column_size(public.list_personal_transactions_page(100, null, null, null, null, null, null, null))::bigint as value;
select 'pf_aggregate_payload_bytes' as metric, pg_column_size(public.get_personal_transaction_analytics(null, null, null, null))::bigint as value;

\echo === FINANCIAL EQUIVALENCE PJ 100k ===
with old_result as (
  select coalesce(sum(amount_cents) filter (where type = 'income'), 0)::bigint receipts,
         coalesce(sum(amount_cents) filter (where type = 'expense'), 0)::bigint expenses,
         coalesce(sum(case when type = 'income' then amount_cents when type = 'expense' then -amount_cents else 0 end), 0)::bigint balance
  from public.business_transactions where organization_id = '${organizationId}' and deleted_at is null
), new_result as (
  select (public.get_business_transaction_analytics('${organizationId}', null, null, null, null)->>'total_receipts_cents')::bigint receipts,
         (public.get_business_transaction_analytics('${organizationId}', null, null, null, null)->>'total_expenses_cents')::bigint expenses,
         (public.get_business_transaction_analytics('${organizationId}', null, null, null, null)->>'balance_cents')::bigint balance
)
select case when old_result = new_result then 'PASS' else 'FAIL' end as financial_equivalence_pj from old_result, new_result;
do $$ declare p jsonb; begin p := public.list_business_transactions_page('${organizationId}', 100, null, null, null, null, null, null, null); if jsonb_array_length(p->'rows') > 100 or coalesce(p->>'page_size', '') <> '100' then raise exception 'PJ page size gate failed'; end if; end $$;
select 'pj_page_payload_bytes' as metric, pg_column_size(public.list_business_transactions_page('${organizationId}', 100, null, null, null, null, null, null, null))::bigint as value;
select 'pj_aggregate_payload_bytes' as metric, pg_column_size(public.get_business_transaction_analytics('${organizationId}', null, null, null, null))::bigint as value;

-- Date interval is half-open and deleted rows stay excluded.
do $$ declare a jsonb; begin a := public.get_personal_transaction_analytics('2025-01-01', '2026-01-01', null, null); if (a->>'transaction_count')::integer <> (select count(*) from public.personal_transactions where user_id = '${userId}' and deleted_at is null and transaction_date >= date '2025-01-01' and transaction_date < date '2026-01-01') then raise exception 'PF date/deleted filter mismatch'; end if; end $$;

-- An authenticated member cannot query a different organization.
do $$ begin
  begin
    perform public.get_business_transaction_analytics('${otherOrganizationId}', null, null, null, null);
    raise exception 'cross-tenant call unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
rollback;
`;

const result = spawnSync('docker', ['exec', '-i', container, 'psql', '-X', '-U', 'postgres', '-d', 'postgres'], {
  input: sql,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  windowsHide: true,
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) {
  console.error(`Unable to execute equivalence benchmark: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
