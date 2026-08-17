-- AURAFIN FASE 3F.1
-- Paginação keyset, agregações financeiras e exportação server-side.
-- Esta migration é incremental: não altera migrations anteriores nem RLS.

create index if not exists idx_personal_transactions_user_date_id_active
  on public.personal_transactions (user_id, transaction_date desc, id desc)
  where deleted_at is null;

create index if not exists idx_business_transactions_org_date_id_active
  on public.business_transactions (organization_id, transaction_date desc, id desc)
  where deleted_at is null;

-- As funções abaixo são SECURITY INVOKER de propósito: RLS continua sendo a
-- última barreira. Os filtros por auth.uid()/membership também evitam que um
-- chamador autenticado use um parâmetro para atravessar o tenant.

create or replace function public.list_personal_transactions_page(
  p_page_size integer default 50,
  p_cursor_date date default null,
  p_cursor_id uuid default null,
  p_search text default null,
  p_transaction_type text default null,
  p_category text default null,
  p_start_date date default null,
  p_end_date_exclusive date default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
stable
as $$
declare
  v_limit integer := least(greatest(coalesce(p_page_size, 50), 1), 100);
  v_rows jsonb := '[]'::jsonb;
  v_count integer := 0;
  v_next_date date;
  v_next_id uuid;
  v_has_more boolean := false;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  with page as (
    select
      t.id,
      t.type,
      t.title,
      t.amount_cents,
      t.transaction_date,
      t.category,
      t.account_id,
      t.credit_card_id,
      t.cross_context_id,
      t.notes
    from public.personal_transactions t
    where t.user_id = (select auth.uid())
      and t.deleted_at is null
      and (p_cursor_date is null or p_cursor_id is null
        or (t.transaction_date, t.id) < (p_cursor_date, p_cursor_id))
      and (nullif(trim(p_search), '') is null
        or t.title ilike '%' || trim(p_search) || '%'
        or t.notes ilike '%' || trim(p_search) || '%')
      and (p_transaction_type is null or t.type = p_transaction_type)
      and (p_category is null or t.category = p_category)
      and (p_start_date is null or t.transaction_date >= p_start_date)
      and (p_end_date_exclusive is null or t.transaction_date < p_end_date_exclusive)
    order by t.transaction_date desc, t.id desc
    limit v_limit + 1
  )
  select
    count(*)::integer,
    coalesce(
      jsonb_agg(to_jsonb(trimmed) order by trimmed.transaction_date desc, trimmed.id desc),
      '[]'::jsonb
    )
  into v_count, v_rows
  from (select * from page order by transaction_date desc, id desc limit v_limit) trimmed;

  if v_count = v_limit then
    v_next_date := (v_rows -> -1 ->> 'transaction_date')::date;
    v_next_id := (v_rows -> -1 ->> 'id')::uuid;
    select exists (
      select 1
      from public.personal_transactions t
      where t.user_id = (select auth.uid())
        and t.deleted_at is null
        and (t.transaction_date, t.id) < (v_next_date, v_next_id)
        and (nullif(trim(p_search), '') is null or t.title ilike '%' || trim(p_search) || '%' or t.notes ilike '%' || trim(p_search) || '%')
        and (p_transaction_type is null or t.type = p_transaction_type)
        and (p_category is null or t.category = p_category)
        and (p_start_date is null or t.transaction_date >= p_start_date)
        and (p_end_date_exclusive is null or t.transaction_date < p_end_date_exclusive)
    ) into v_has_more;
  end if;

  return jsonb_build_object(
    'rows', v_rows,
    'has_more', v_has_more,
    'next_cursor', case when not v_has_more then null else
      jsonb_build_object('transaction_date', (v_rows -> -1 ->> 'transaction_date')::date, 'id', (v_rows -> -1 ->> 'id')::uuid) end,
    'page_size', v_limit
  );
end;
$$;

create or replace function public.list_business_transactions_page(
  p_organization_id uuid,
  p_page_size integer default 50,
  p_cursor_date date default null,
  p_cursor_id uuid default null,
  p_search text default null,
  p_transaction_type text default null,
  p_category text default null,
  p_start_date date default null,
  p_end_date_exclusive date default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
stable
as $$
declare
  v_limit integer := least(greatest(coalesce(p_page_size, 50), 1), 100);
  v_rows jsonb := '[]'::jsonb;
  v_count integer := 0;
  v_next_date date;
  v_next_id uuid;
  v_has_more boolean := false;
begin
  if (select auth.uid()) is null or not public.is_organization_member(p_organization_id) then
    raise exception 'organization access denied' using errcode = '42501';
  end if;

  with page as (
    select
      t.id,
      t.type,
      t.title,
      t.amount_cents,
      t.transaction_date,
      t.category,
      t.account_id,
      t.corporate_card_id,
      t.client_id,
      t.supplier_id,
      t.project_id,
      t.cost_center_id,
      t.cross_context_id,
      t.is_paid_by_pf,
      t.is_personal_expense_in_pj,
      t.notes
    from public.business_transactions t
    where t.organization_id = p_organization_id
      and t.deleted_at is null
      and (p_cursor_date is null or p_cursor_id is null
        or (t.transaction_date, t.id) < (p_cursor_date, p_cursor_id))
      and (nullif(trim(p_search), '') is null
        or t.title ilike '%' || trim(p_search) || '%'
        or t.notes ilike '%' || trim(p_search) || '%')
      and (p_transaction_type is null or t.type = p_transaction_type)
      and (p_category is null or t.category = p_category)
      and (p_start_date is null or t.transaction_date >= p_start_date)
      and (p_end_date_exclusive is null or t.transaction_date < p_end_date_exclusive)
    order by t.transaction_date desc, t.id desc
    limit v_limit + 1
  )
  select
    count(*)::integer,
    coalesce(
      jsonb_agg(to_jsonb(trimmed) order by trimmed.transaction_date desc, trimmed.id desc),
      '[]'::jsonb
    )
  into v_count, v_rows
  from (select * from page order by transaction_date desc, id desc limit v_limit) trimmed;

  if v_count = v_limit then
    v_next_date := (v_rows -> -1 ->> 'transaction_date')::date;
    v_next_id := (v_rows -> -1 ->> 'id')::uuid;
    select exists (
      select 1
      from public.business_transactions t
      where t.organization_id = p_organization_id
        and t.deleted_at is null
        and (t.transaction_date, t.id) < (v_next_date, v_next_id)
        and (nullif(trim(p_search), '') is null or t.title ilike '%' || trim(p_search) || '%' or t.notes ilike '%' || trim(p_search) || '%')
        and (p_transaction_type is null or t.type = p_transaction_type)
        and (p_category is null or t.category = p_category)
        and (p_start_date is null or t.transaction_date >= p_start_date)
        and (p_end_date_exclusive is null or t.transaction_date < p_end_date_exclusive)
    ) into v_has_more;
  end if;

  return jsonb_build_object(
    'rows', v_rows,
    'has_more', v_has_more,
    'next_cursor', case when not v_has_more then null else
      jsonb_build_object('transaction_date', (v_rows -> -1 ->> 'transaction_date')::date, 'id', (v_rows -> -1 ->> 'id')::uuid) end,
    'page_size', v_limit
  );
end;
$$;

create or replace function public.assert_transaction_organization_access(p_organization_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
stable
as $$
begin
  if (select auth.uid()) is null or not public.is_organization_member(p_organization_id) then
    raise exception 'organization access denied' using errcode = '42501';
  end if;
  return true;
end;
$$;

create or replace function public.get_personal_transaction_analytics(
  p_start_date date default null,
  p_end_date_exclusive date default null,
  p_category text default null,
  p_search text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
stable
as $$
with filtered as (
  select t.*
  from public.personal_transactions t
  where t.user_id = (select auth.uid())
    and t.deleted_at is null
    and (p_category is null or t.category = p_category)
    and (nullif(trim(p_search), '') is null
      or t.title ilike '%' || trim(p_search) || '%'
      or t.notes ilike '%' || trim(p_search) || '%')
    and (p_start_date is null or t.transaction_date >= p_start_date)
    and (p_end_date_exclusive is null or t.transaction_date < p_end_date_exclusive)
), totals as (
  select
    count(*)::integer as transaction_count,
    coalesce(sum(amount_cents) filter (where type = 'income'), 0)::bigint as total_receipts_cents,
    coalesce(sum(amount_cents) filter (where type = 'expense'), 0)::bigint as total_expenses_cents,
    coalesce(sum(amount_cents) filter (where type = 'transfer'), 0)::bigint as total_transfers_cents,
    coalesce(sum(case when type = 'income' then amount_cents when type = 'expense' then -amount_cents else 0 end), 0)::bigint as balance_cents,
    coalesce(sum(amount_cents) filter (where type = 'expense' and category in ('saude', 'educacao')), 0)::bigint as tax_relevant_cents,
    coalesce(sum(amount_cents) filter (where type = 'income' and category in ('salario_prolabore', 'distribuicao_lucro')), 0)::bigint as prolabore_cents
  from filtered
), by_category as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'category', category,
    'receipts_cents', receipts_cents,
    'expenses_cents', expenses_cents,
    'balance_cents', receipts_cents - expenses_cents
  ) order by category), '[]'::jsonb) as value
  from (
    select category,
      coalesce(sum(amount_cents) filter (where type = 'income'), 0)::bigint as receipts_cents,
      coalesce(sum(amount_cents) filter (where type = 'expense'), 0)::bigint as expenses_cents
    from filtered group by category
  ) grouped
), cash_flow as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'period', period,
    'receipts_cents', receipts_cents,
    'expenses_cents', expenses_cents,
    'balance_cents', receipts_cents - expenses_cents
  ) order by period), '[]'::jsonb) as value
  from (
    select to_char(date_trunc('month', transaction_date), 'YYYY-MM') as period,
      coalesce(sum(amount_cents) filter (where type = 'income'), 0)::bigint as receipts_cents,
      coalesce(sum(amount_cents) filter (where type = 'expense'), 0)::bigint as expenses_cents
    from filtered group by date_trunc('month', transaction_date)
  ) grouped
)
select jsonb_build_object(
  'transaction_count', totals.transaction_count,
  'total_receipts_cents', totals.total_receipts_cents,
  'total_expenses_cents', totals.total_expenses_cents,
  'total_transfers_cents', totals.total_transfers_cents,
  'balance_cents', totals.balance_cents,
  'tax_relevant_cents', totals.tax_relevant_cents,
  'prolabore_cents', totals.prolabore_cents,
  'by_category', by_category.value,
  'cash_flow', cash_flow.value
)
from totals, by_category, cash_flow;
$$;

create or replace function public.get_business_transaction_analytics(
  p_organization_id uuid,
  p_start_date date default null,
  p_end_date_exclusive date default null,
  p_category text default null,
  p_search text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
stable
as $$
with filtered as (
  select t.*
  from public.business_transactions t
  cross join (select public.assert_transaction_organization_access(p_organization_id) as allowed) access_guard
  where access_guard.allowed
    and t.organization_id = p_organization_id
    and t.deleted_at is null
    and (p_category is null or t.category = p_category)
    and (nullif(trim(p_search), '') is null
      or t.title ilike '%' || trim(p_search) || '%'
      or t.notes ilike '%' || trim(p_search) || '%')
    and (p_start_date is null or t.transaction_date >= p_start_date)
    and (p_end_date_exclusive is null or t.transaction_date < p_end_date_exclusive)
), totals as (
  select
    count(*)::integer as transaction_count,
    coalesce(sum(amount_cents) filter (where type = 'income'), 0)::bigint as total_receipts_cents,
    coalesce(sum(amount_cents) filter (where type = 'expense'), 0)::bigint as total_expenses_cents,
    coalesce(sum(amount_cents) filter (where type = 'transfer'), 0)::bigint as total_transfers_cents,
    coalesce(sum(case when type = 'income' then amount_cents when type = 'expense' then -amount_cents else 0 end), 0)::bigint as balance_cents,
    coalesce(sum(amount_cents) filter (where type = 'expense' and not is_personal_expense_in_pj), 0)::bigint as operating_expenses_cents,
    coalesce(sum(amount_cents) filter (where is_personal_expense_in_pj), 0)::bigint as personal_expenses_in_pj_cents,
    coalesce(sum(amount_cents) filter (where is_paid_by_pf), 0)::bigint as paid_by_pf_cents,
    coalesce(sum(amount_cents) filter (where category in ('prolabore_pago', 'pro_labore')), 0)::bigint as prolabore_cents,
    coalesce(sum(amount_cents) filter (where category in ('impostos', 'taxas')), 0)::bigint as tax_cents
  from filtered
), by_category as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'category', category,
    'receipts_cents', receipts_cents,
    'expenses_cents', expenses_cents,
    'balance_cents', receipts_cents - expenses_cents
  ) order by category), '[]'::jsonb) as value
  from (
    select category,
      coalesce(sum(amount_cents) filter (where type = 'income'), 0)::bigint as receipts_cents,
      coalesce(sum(amount_cents) filter (where type = 'expense'), 0)::bigint as expenses_cents
    from filtered group by category
  ) grouped
), cash_flow as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'period', period,
    'receipts_cents', receipts_cents,
    'expenses_cents', expenses_cents,
    'balance_cents', receipts_cents - expenses_cents
  ) order by period), '[]'::jsonb) as value
  from (
    select to_char(date_trunc('month', transaction_date), 'YYYY-MM') as period,
      coalesce(sum(amount_cents) filter (where type = 'income'), 0)::bigint as receipts_cents,
      coalesce(sum(amount_cents) filter (where type = 'expense'), 0)::bigint as expenses_cents
    from filtered group by date_trunc('month', transaction_date)
  ) grouped
)
select jsonb_build_object(
  'transaction_count', totals.transaction_count,
  'total_receipts_cents', totals.total_receipts_cents,
  'total_expenses_cents', totals.total_expenses_cents,
  'total_transfers_cents', totals.total_transfers_cents,
  'balance_cents', totals.balance_cents,
  'operating_expenses_cents', totals.operating_expenses_cents,
  'personal_expenses_in_pj_cents', totals.personal_expenses_in_pj_cents,
  'paid_by_pf_cents', totals.paid_by_pf_cents,
  'prolabore_cents', totals.prolabore_cents,
  'tax_cents', totals.tax_cents,
  'by_category', by_category.value,
  'cash_flow', cash_flow.value
)
from totals, by_category, cash_flow;
$$;

create or replace function public.export_personal_transactions_csv(
  p_start_date date default null,
  p_end_date_exclusive date default null,
  p_category text default null,
  p_search text default null
)
returns text
language sql
security invoker
set search_path = ''
stable
as $$
select 'id,type,title,amount_cents,transaction_date,category,account_id,credit_card_id,cross_context_id,notes' || E'\n' ||
  coalesce(string_agg(
    t.id::text || ',' || t.type || ',' || '"' || replace(replace(replace(coalesce(t.title, ''), '"', '""'), E'\n', ' '), E'\r', ' ') || '"' || ',' ||
    t.amount_cents::text || ',' || t.transaction_date::text || ',' || t.category || ',' || coalesce(t.account_id::text, '') || ',' || coalesce(t.credit_card_id::text, '') || ',' || coalesce(t.cross_context_id::text, '') || ',' ||
    '"' || replace(replace(replace(coalesce(t.notes, ''), '"', '""'), E'\n', ' '), E'\r', ' ') || '"', E'\n' order by t.transaction_date desc, t.id desc), '')
from public.personal_transactions t
where t.user_id = (select auth.uid())
  and t.deleted_at is null
  and (p_category is null or t.category = p_category)
  and (nullif(trim(p_search), '') is null or t.title ilike '%' || trim(p_search) || '%' or t.notes ilike '%' || trim(p_search) || '%')
  and (p_start_date is null or t.transaction_date >= p_start_date)
  and (p_end_date_exclusive is null or t.transaction_date < p_end_date_exclusive);
$$;

create or replace function public.export_business_transactions_csv(
  p_organization_id uuid,
  p_start_date date default null,
  p_end_date_exclusive date default null,
  p_category text default null,
  p_search text default null
)
returns text
language sql
security invoker
set search_path = ''
stable
as $$
select 'id,type,title,amount_cents,transaction_date,category,account_id,corporate_card_id,client_id,supplier_id,project_id,cost_center_id,cross_context_id,is_paid_by_pf,is_personal_expense_in_pj,notes' || E'\n' ||
  coalesce(string_agg(
    t.id::text || ',' || t.type || ',' || '"' || replace(replace(replace(coalesce(t.title, ''), '"', '""'), E'\n', ' '), E'\r', ' ') || '"' || ',' ||
    t.amount_cents::text || ',' || t.transaction_date::text || ',' || t.category || ',' || coalesce(t.account_id::text, '') || ',' || coalesce(t.corporate_card_id::text, '') || ',' || coalesce(t.client_id::text, '') || ',' || coalesce(t.supplier_id::text, '') || ',' || coalesce(t.project_id::text, '') || ',' || coalesce(t.cost_center_id::text, '') || ',' || coalesce(t.cross_context_id::text, '') || ',' || t.is_paid_by_pf::text || ',' || t.is_personal_expense_in_pj::text || ',' ||
    '"' || replace(replace(replace(coalesce(t.notes, ''), '"', '""'), E'\n', ' '), E'\r', ' ') || '"', E'\n' order by t.transaction_date desc, t.id desc), '')
from public.business_transactions t
cross join (select public.assert_transaction_organization_access(p_organization_id) as allowed) access_guard
where access_guard.allowed
  and t.organization_id = p_organization_id
  and t.deleted_at is null
  and (p_category is null or t.category = p_category)
  and (nullif(trim(p_search), '') is null or t.title ilike '%' || trim(p_search) || '%' or t.notes ilike '%' || trim(p_search) || '%')
  and (p_start_date is null or t.transaction_date >= p_start_date)
  and (p_end_date_exclusive is null or t.transaction_date < p_end_date_exclusive);
$$;

create or replace function public.export_business_transactions_json(
  p_organization_id uuid,
  p_start_date date default null,
  p_end_date_exclusive date default null,
  p_category text default null,
  p_search text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
stable
as $$
select coalesce(jsonb_agg(jsonb_build_object(
  'id', t.id,
  'type', t.type,
  'title', t.title,
  'amount_cents', t.amount_cents,
  'transaction_date', t.transaction_date,
  'category', t.category,
  'account_id', t.account_id,
  'corporate_card_id', t.corporate_card_id,
  'client_id', t.client_id,
  'supplier_id', t.supplier_id,
  'project_id', t.project_id,
  'cost_center_id', t.cost_center_id,
  'cross_context_id', t.cross_context_id,
  'is_paid_by_pf', t.is_paid_by_pf,
  'is_personal_expense_in_pj', t.is_personal_expense_in_pj,
  'notes', t.notes
) order by t.transaction_date desc, t.id desc), '[]'::jsonb)
from public.business_transactions t
cross join (select public.assert_transaction_organization_access(p_organization_id) as allowed) access_guard
where access_guard.allowed
  and t.organization_id = p_organization_id
  and t.deleted_at is null
  and (p_category is null or t.category = p_category)
  and (nullif(trim(p_search), '') is null or t.title ilike '%' || trim(p_search) || '%' or t.notes ilike '%' || trim(p_search) || '%')
  and (p_start_date is null or t.transaction_date >= p_start_date)
  and (p_end_date_exclusive is null or t.transaction_date < p_end_date_exclusive);
$$;

revoke execute on function public.list_personal_transactions_page(integer, date, uuid, text, text, text, date, date) from public, anon;
revoke execute on function public.list_business_transactions_page(uuid, integer, date, uuid, text, text, text, date, date) from public, anon;
revoke execute on function public.assert_transaction_organization_access(uuid) from public, anon;
revoke execute on function public.get_personal_transaction_analytics(date, date, text, text) from public, anon;
revoke execute on function public.get_business_transaction_analytics(uuid, date, date, text, text) from public, anon;
revoke execute on function public.export_personal_transactions_csv(date, date, text, text) from public, anon;
revoke execute on function public.export_business_transactions_csv(uuid, date, date, text, text) from public, anon;
revoke execute on function public.export_business_transactions_json(uuid, date, date, text, text) from public, anon;

grant execute on function public.list_personal_transactions_page(integer, date, uuid, text, text, text, date, date) to authenticated;
grant execute on function public.list_business_transactions_page(uuid, integer, date, uuid, text, text, text, date, date) to authenticated;
grant execute on function public.assert_transaction_organization_access(uuid) to authenticated;
grant execute on function public.get_personal_transaction_analytics(date, date, text, text) to authenticated;
grant execute on function public.get_business_transaction_analytics(uuid, date, date, text, text) to authenticated;
grant execute on function public.export_personal_transactions_csv(date, date, text, text) to authenticated;
grant execute on function public.export_business_transactions_csv(uuid, date, date, text, text) to authenticated;
grant execute on function public.export_business_transactions_json(uuid, date, date, text, text) to authenticated;

comment on function public.list_personal_transactions_page(integer, date, uuid, text, text, text, date, date) is 'PF keyset pagination: max 100 rows, deterministic transaction_date/id ordering, RLS enforced.';
comment on function public.list_business_transactions_page(uuid, integer, date, uuid, text, text, text, date, date) is 'PJ keyset pagination: max 100 rows, deterministic transaction_date/id ordering, membership and RLS enforced.';
comment on function public.get_personal_transaction_analytics(date, date, text, text) is 'PF exact cent aggregations for dashboards, cash flow and reports.';
comment on function public.get_business_transaction_analytics(uuid, date, date, text, text) is 'PJ exact cent aggregations for DRE, cash flow and reports.';
