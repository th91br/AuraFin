-- Migration 0006: Documents Metadata & Storage Bucket Preparation
-- AuraFin Backend Phase 1

-- 1. Documents Metadata Table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size_bytes bigint not null check (file_size_bytes >= 0),
  mime_type text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  check (
    (user_id is not null and organization_id is null) or
    (user_id is null and organization_id is not null) or
    (user_id is not null and organization_id is not null)
  )
);

comment on table public.documents is 'Metadados de arquivos e comprovantes armazenados no Supabase Storage.';

alter table public.documents enable row level security;

create policy "Acesso a documentos pessoais por user_id"
  on public.documents for all
  using (
    (user_id is not null and auth.uid() = user_id) or
    (organization_id is not null and public.is_organization_member(organization_id))
  )
  with check (
    (user_id is not null and auth.uid() = user_id) or
    (organization_id is not null and public.is_organization_member(organization_id))
  );

-- 2. Document Links Table
create table if not exists public.document_links (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  entity_type text check (entity_type in ('transaction', 'invoice', 'receivable', 'payable', 'project', 'tax', 'reconciliation')) not null,
  entity_id uuid not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.document_links is 'Vínculo flexível entre metadados de documentos e entidades financeiras.';

alter table public.document_links enable row level security;

create policy "Acesso aos vínculos de documentos por associação do documento pai"
  on public.document_links for all
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_links.document_id
        and (
          (d.user_id is not null and d.user_id = auth.uid()) or
          (d.organization_id is not null and public.is_organization_member(d.organization_id))
        )
    )
  );

-- 3. Storage Bucket Setup Script (Prepared)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'financial-documents',
  'financial-documents',
  false, -- Privado por padrão!
  52428800, -- 50MB por arquivo
  array['application/pdf', 'image/jpeg', 'image/png', 'text/csv', 'application/json']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 52428800;

-- Storage Security Policies for Objects Bucket
create policy "Acesso de Leitura ao Bucket de Documentos Financeiros"
  on storage.objects for select
  using (
    bucket_id = 'financial-documents'
    and auth.role() = 'authenticated'
  );

create policy "Upload de Documentos no Bucket Financeiro"
  on storage.objects for insert
  with check (
    bucket_id = 'financial-documents'
    and auth.role() = 'authenticated'
  );
