-- Migration 0001: Core Auth, Profiles, Organizations & RLS Helpers
-- AuraFin Backend Phase 1

-- 1. Helper function for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- 2. Profiles Table (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  avatar_url text,
  preferred_context text default 'PF' check (preferred_context in ('PF', 'PJ')),
  privacy_mode_default boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.profiles is 'Perfis públicos estendidos dos usuários autenticados.';

alter table public.profiles enable row level security;

create policy "Usuário gerencia seu próprio perfil"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-Create Profile on Signup Trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Organizations Table (Empresas PJ)
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  legal_name text,
  tax_id text, -- CNPJ ou CPF do responsável técnico
  status text default 'active' check (status in ('active', 'suspended', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.organizations is 'Empresas e organizações jurídicas PJ multi-tenant.';

alter table public.organizations enable row level security;

create trigger handle_updated_at_organizations
  before update on public.organizations
  for each row execute function public.handle_updated_at();

-- 4. Organization Members Table (Membros e Roles)
create table if not exists public.organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'admin', 'finance', 'accountant', 'viewer')) default 'finance' not null,
  status text default 'active' check (status in ('active', 'invited', 'suspended')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (organization_id, user_id)
);

comment on table public.organization_members is 'Membros, permissões e roles dentro de organizações PJ.';

alter table public.organization_members enable row level security;

create trigger handle_updated_at_org_members
  before update on public.organization_members
  for each row execute function public.handle_updated_at();

-- 5. Helper Function: Check Organization Membership for RLS
create or replace function public.is_organization_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

-- RLS Policies for Organizations & Members
create policy "Membros leem suas organizações"
  on public.organizations for select
  using (public.is_organization_member(id));

create policy "Owners e Admins atualizam a organização"
  on public.organizations for update
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
        and status = 'active'
    )
  );

create policy "Membros leem lista de membros da sua organização"
  on public.organization_members for select
  using (public.is_organization_member(organization_id));

create policy "Owners e Admins gerenciam membros da organização"
  on public.organization_members for all
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = organization_members.organization_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
        and status = 'active'
    )
  );

-- 6. Atomic RPC: Create Organization with Owner Membership
create or replace function public.create_organization_with_owner(
  org_name text,
  legal_name text default null,
  tax_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Acesso negado: usuário não autenticado';
  end if;

  insert into public.organizations (name, legal_name, tax_id, created_by)
  values (org_name, legal_name, tax_id, auth.uid())
  returning id into new_org_id;

  insert into public.organization_members (organization_id, user_id, role, status)
  values (new_org_id, auth.uid(), 'owner', 'active');

  return new_org_id;
end;
$$;
