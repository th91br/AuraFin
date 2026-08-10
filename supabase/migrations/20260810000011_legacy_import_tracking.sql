-- Migration 0011: Legacy Import Tracking Table
-- AuraFin Backend Phase 2B

create table if not exists public.legacy_import_runs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  source_fingerprint text not null,
  status text check (status in ('pending', 'running', 'failed', 'completed')) default 'pending' not null,
  counts jsonb default '{}'::jsonb not null,
  started_at timestamptz default timezone('utc'::text, now()) not null,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.legacy_import_runs is 'Rastreabilidade server-side da migração idempotente de dados legados do LocalStorage.';

alter table public.legacy_import_runs enable row level security;

create policy "Usuários gerenciam seu próprio histórico de importação"
  on public.legacy_import_runs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_legacy_import_runs_user_fp on public.legacy_import_runs(user_id, source_fingerprint);
