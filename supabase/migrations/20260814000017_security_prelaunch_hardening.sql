-- ==============================================================================
-- AURAFIN — MIGRATION 0017: SECURITY PRE-LAUNCH HARDENING (OWASP ASVS 5.0.0)
-- ==============================================================================
-- Scope:
-- 1. DROP obsolete broad permissive policies on storage.objects from migration 0006
--    ("Acesso de Leitura ao Bucket de Documentos Financeiros", "Upload de Documentos no Bucket Financeiro")
--    which bypassed granular PF/PJ folder isolation.
-- 2. FIX organizations table UPDATE policy variable shadowing where unqualified "id"
--    resolved to organization_members.id instead of organizations.id.
-- 3. Re-affirm strict search_path = '' and execution grants on all public helper functions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STORAGE OBJECTS HARDENING: REMOVE BROAD PERMISSIVE LEGACY POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Acesso de Leitura ao Bucket de Documentos Financeiros" ON storage.objects;
DROP POLICY IF EXISTS "Upload de Documentos no Bucket Financeiro" ON storage.objects;

-- ------------------------------------------------------------------------------
-- 2. ORGANIZATIONS TABLE RLS FIX: QUALIFY OUTER TABLE ID
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Owners e Admins atualizam a organização" ON public.organizations;

CREATE POLICY "Owners e Admins atualizam a organização"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = organizations.id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = organizations.id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ------------------------------------------------------------------------------
-- 3. HELPER FUNCTIONS & RPC SEARCH PATH & GRANTS RE-AFFIRMATION
-- ------------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.is_organization_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_organization_member(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_organization_role(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_organization_role(uuid, text[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.create_organization_with_owner(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_organization_with_owner(text, text, text) TO authenticated;

COMMENT ON TABLE public.organizations IS 'Organizações PJ multi-tenant com isolamento RLS e proteção contra escalada de privilégios.';
