-- Migration 0012: Enhanced Legacy Import Tracking for PJ Context
-- AuraFin Backend Phase 2C

alter table public.legacy_import_runs
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists context_type text default 'PF' check (context_type in ('PF', 'PJ')) not null;

comment on column public.legacy_import_runs.organization_id is 'ID da organização PJ de destino quando o contexto for PJ.';
comment on column public.legacy_import_runs.context_type is 'Contexto da migração de legado: PF (Pessoa Física) ou PJ (Pessoa Jurídica).';

-- Update RLS Policies on legacy_import_runs for PJ multi-tenancy
drop policy if exists "Usuários gerenciam seu próprio histórico de importação" on public.legacy_import_runs;
drop policy if exists "Acesso e registro de importação por usuário e organização" on public.legacy_import_runs;

create policy "Acesso e registro de importação por usuário e organização"
  on public.legacy_import_runs for all
  using (
    (context_type = 'PF' and auth.uid() = user_id) or
    (context_type = 'PJ' and organization_id is not null and public.has_organization_role(organization_id, array['owner', 'admin', 'finance']))
  )
  with check (
    (context_type = 'PF' and auth.uid() = user_id) or
    (context_type = 'PJ' and organization_id is not null and public.has_organization_role(organization_id, array['owner', 'admin', 'finance']))
  );

create index if not exists idx_legacy_import_runs_org_fp on public.legacy_import_runs(organization_id, source_fingerprint);
