-- AURAFIN FASE 3F performance RLS cache.
-- Preserve RLS/RBAC while avoiding repeated membership scans per row.

create or replace function public.current_user_organization_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
rows 100
as $$
  select organization_id
  from public.organization_members
  where user_id = (select auth.uid())
    and status = 'active';
$$;

revoke execute on function public.current_user_organization_ids() from public, anon;
grant execute on function public.current_user_organization_ids() to authenticated;

do $migration$
declare
  v_policy record;
begin
  for v_policy in
    select * from (values
      ('business_accounts', 'Membros da empresa gerenciam contas PJ', 'organization_id', true),
      ('business_transactions', 'Membros da empresa gerenciam transações bancárias e de caixa', 'organization_id', true),
      ('clients', 'Membros da empresa gerenciam clientes PJ', 'organization_id', true),
      ('suppliers', 'Membros da empresa gerenciam fornecedores PJ', 'organization_id', true),
      ('projects', 'Membros da empresa gerenciam projetos e contratos PJ', 'organization_id', true),
      ('cost_centers', 'Membros da empresa gerenciam centros de custo PJ', 'organization_id', true),
      ('corporate_cards', 'Membros da empresa gerenciam cartões corporativos PJ', 'organization_id', true),
      ('corporate_card_invoices', 'Membros da empresa gerenciam faturas corporativas PJ', 'organization_id', true),
      ('invoices', 'Membros da empresa gerenciam faturas e notas PJ', 'organization_id', true),
      ('receivables', 'Membros da empresa gerenciam recebíveis PJ', 'organization_id', true),
      ('payables', 'Membros da empresa gerenciam pagamentos PJ', 'organization_id', true),
      ('partners', 'Membros da empresa gerenciam quadro de sócios PJ', 'organization_id', true),
      ('partner_transactions', 'Membros da empresa gerenciam transações de sócios PJ', 'organization_id', true),
      ('tax_records', 'Membros da empresa gerenciam controle de impostos PJ', 'organization_id', true),
      ('accounting_periods', 'Membros da empresa gerenciam fechamentos contábeis PJ', 'organization_id', true),
      ('collection_events', 'Membros da empresa gerenciam eventos de cobrança PJ', 'organization_id', true),
      ('legacy_pj_import_runs', 'Acesso e registro de importação por organização', 'organization_id', true),
      ('documents', 'Acesso a documentos pessoais por user_id', 'organization_id', false),
      ('document_links', 'Acesso aos vínculos de documentos por associação do documento pai', 'organization_id', false),
      ('storage_objects', 'PJ Storage SELECT', 'organization_id', false)
    ) as policies(table_name, policy_name, tenant_column, with_check)
  loop
    if exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = v_policy.table_name
        and policyname = v_policy.policy_name
    ) then
      execute format(
        'alter policy %I on public.%I using (%I in (select public.current_user_organization_ids()))',
        v_policy.policy_name, v_policy.table_name, v_policy.tenant_column
      );
      if v_policy.with_check then
        execute format(
          'alter policy %I on public.%I with check (%I in (select public.current_user_organization_ids()))',
          v_policy.policy_name, v_policy.table_name, v_policy.tenant_column
        );
      end if;
    end if;
  end loop;
end;
$migration$;

-- Some authorization policies are intentionally split by operation and were
-- renamed by the RBAC migration. Patch only predicates that actually call the
-- membership helper; role predicates remain untouched.
do $membership_policies$
declare
  v_policy record;
begin
  for v_policy in
    select tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and tablename in ('business_accounts','business_transactions','clients','suppliers','projects','cost_centers','corporate_cards','corporate_card_invoices','invoices','receivables','payables','partners','partner_transactions','tax_records','accounting_periods','collection_events','legacy_pj_import_runs')
      and (coalesce(qual, '') like '%is_organization_member%' or coalesce(with_check, '') like '%is_organization_member%')
  loop
    if coalesce(v_policy.qual, '') like '%is_organization_member%' then
      execute format('alter policy %I on public.%I using (organization_id in (select public.current_user_organization_ids()))', v_policy.policyname, v_policy.tablename);
    end if;
    if coalesce(v_policy.with_check, '') like '%is_organization_member%' then
      execute format('alter policy %I on public.%I with check (organization_id in (select public.current_user_organization_ids()))', v_policy.policyname, v_policy.tablename);
    end if;
  end loop;
end;
$membership_policies$;
