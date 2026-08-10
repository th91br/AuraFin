-- Migration 0009: RBAC Hardening on Organization Members, Granular Storage Policies & Audit Fixes
-- AuraFin Backend Phase 1.1 Final Validation

-- 1. Anti-Role-Escalation & Strict RBAC Policies for organization_members
drop policy if exists "Owners e Admins gerenciam membros da organização" on public.organization_members;

-- Read policy: Any active member can view organization roster
drop policy if exists "Membros leem lista de membros da sua organização" on public.organization_members;
create policy "Membros leem lista de membros da sua organização"
  on public.organization_members for select
  using (public.is_organization_member(organization_id));

-- Insert policy: Only Owner or Admin can add new members
create policy "Owners e Admins adicionam membros"
  on public.organization_members for insert
  with check (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organization_members.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
        and m.status = 'active'
    )
  );

-- Update policy: Only Owner or Admin can update roles; Non-owners cannot grant 'owner' role
create policy "Owners e Admins atualizam membros com restricao de role"
  on public.organization_members for update
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organization_members.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
        and m.status = 'active'
    )
  )
  with check (
    -- If assigning role = 'owner', current user must be an active 'owner'
    (role != 'owner') or exists (
      select 1 from public.organization_members m
      where m.organization_id = organization_members.organization_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
        and m.status = 'active'
    )
  );

-- Delete policy: Only Owner or Admin can remove members; Non-owners cannot remove an 'owner'
create policy "Owners e Admins removem membros"
  on public.organization_members for delete
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organization_members.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
        and m.status = 'active'
    )
    and (
      role != 'owner' or exists (
        select 1 from public.organization_members m
        where m.organization_id = organization_members.organization_id
          and m.user_id = auth.uid()
          and m.role = 'owner'
          and m.status = 'active'
      )
    )
  );

-- 2. Storage Objects RLS Granular Operation Policies (SELECT, INSERT, UPDATE, DELETE)
drop policy if exists "Acesso PF ao Bucket Financeiro com isolamento por Pasta" on storage.objects;
drop policy if exists "Acesso PJ ao Bucket Financeiro com isolamento por Organização" on storage.objects;
drop policy if exists "PF Storage SELECT" on storage.objects;
drop policy if exists "PF Storage INSERT" on storage.objects;
drop policy if exists "PF Storage UPDATE" on storage.objects;
drop policy if exists "PF Storage DELETE" on storage.objects;
drop policy if exists "PJ Storage SELECT" on storage.objects;
drop policy if exists "PJ Storage INSERT" on storage.objects;
drop policy if exists "PJ Storage UPDATE" on storage.objects;
drop policy if exists "PJ Storage DELETE" on storage.objects;

-- PF Granular Storage Policies
create policy "PF Storage SELECT" on storage.objects for select
  using (bucket_id = 'financial-documents' and (storage.foldername(name))[1] = 'pf' and (storage.foldername(name))[2] = auth.uid()::text);

create policy "PF Storage INSERT" on storage.objects for insert
  with check (bucket_id = 'financial-documents' and (storage.foldername(name))[1] = 'pf' and (storage.foldername(name))[2] = auth.uid()::text);

create policy "PF Storage UPDATE" on storage.objects for update
  using (bucket_id = 'financial-documents' and (storage.foldername(name))[1] = 'pf' and (storage.foldername(name))[2] = auth.uid()::text);

create policy "PF Storage DELETE" on storage.objects for delete
  using (bucket_id = 'financial-documents' and (storage.foldername(name))[1] = 'pf' and (storage.foldername(name))[2] = auth.uid()::text);

-- PJ Granular Storage Policies
create policy "PJ Storage SELECT" on storage.objects for select
  using (bucket_id = 'financial-documents' and (storage.foldername(name))[1] = 'pj' and public.is_organization_member(((storage.foldername(name))[2])::uuid));

create policy "PJ Storage INSERT" on storage.objects for insert
  with check (bucket_id = 'financial-documents' and (storage.foldername(name))[1] = 'pj' and public.is_organization_member(((storage.foldername(name))[2])::uuid));

create policy "PJ Storage UPDATE" on storage.objects for update
  using (bucket_id = 'financial-documents' and (storage.foldername(name))[1] = 'pj' and public.is_organization_member(((storage.foldername(name))[2])::uuid));

create policy "PJ Storage DELETE" on storage.objects for delete
  using (bucket_id = 'financial-documents' and (storage.foldername(name))[1] = 'pj' and public.is_organization_member(((storage.foldername(name))[2])::uuid));
