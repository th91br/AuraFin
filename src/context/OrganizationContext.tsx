import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Database } from '../integrations/supabase/database.types';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];
type Role = OrganizationMember['role'];

interface OrganizationContextType {
  organizations: Organization[];
  activeOrganization: Organization | null;
  activeMember: OrganizationMember | null;
  userRole: Role | null;
  isLoading: boolean;
  canEditFinances: boolean;
  canManageMembers: boolean;
  canManageOrganization: boolean;
  isViewerReadOnly: boolean;
  switchOrganization: (orgId: string) => void;
  createOrganization: (name: string, legalName?: string, taxId?: string) => Promise<Organization | null>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);
const ACTIVE_ORG_STORAGE_KEY = 'aurafin_active_org_pref_v1';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [activeMember, setActiveMember] = useState<OrganizationMember | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOrganizations = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setOrganizations([]);
      setActiveOrganization(null);
      setActiveMember(null);
      setIsLoading(false);
      return;
    }

    // User boundary: clear the previous user's tenant selection before any
    // membership request can resolve for the new authenticated session.
    setOrganizations([]);
    setActiveOrganization(null);
    setActiveMember(null);
    setIsLoading(true);
    try {
      // 1. Fetch Memberships for authenticated user
      const { data: members, error: memErr } = await supabase
        .from('organization_members')
        .select('id,organization_id,user_id,role,status,created_at,updated_at,organizations(id,name,legal_name,tax_id,status,created_by,created_at,updated_at)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (memErr) {
        console.warn('[OrganizationProvider] Erro ao buscar memberships:', memErr.message);
        setIsLoading(false);
        return;
      }

      let activeMembers = members || [];
      let validOrgs: Organization[] = activeMembers
        .map(m => m.organizations as Organization)
        .filter(Boolean);

      // Auto-provision initial organization if brand new user has no organizations yet
      if (validOrgs.length === 0) {
        const defaultName = (user.user_metadata?.full_name || 'Minha Empresa') + ' Gestão';
        try {
          const { data: newOrgId, error: provisionError } = await (supabase.rpc as any)('create_organization_with_owner', {
            org_name: defaultName,
            legal_name: defaultName,
            tax_id: ''
          });

          if (provisionError) {
            console.warn('[OrganizationProvider] Falha no onboarding da organização:', provisionError.message);
          }

          if (newOrgId && !provisionError) {
            const { data: refreshedMembers, error: refreshError } = await supabase
              .from('organization_members')
              .select('id,organization_id,user_id,role,status,created_at,updated_at,organizations(id,name,legal_name,tax_id,status,created_by,created_at,updated_at)')
              .eq('user_id', user.id)
              .eq('status', 'active');

            if (refreshError) {
              console.warn('[OrganizationProvider] Falha ao recarregar membership do onboarding:', refreshError.message);
            }

            activeMembers = refreshedMembers || [];
            validOrgs = activeMembers
              .map(m => m.organizations as Organization)
              .filter(Boolean);
          }
        } catch (autoErr) {
          console.warn('[OrganizationProvider] Tentativa de auto-provisionamento de organização:', autoErr);
        }
      }

      setOrganizations(validOrgs);

      // 2. Validate Active Organization Preference against actual memberships
      const savedPrefId = localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);
      let selectedOrg = validOrgs.find(o => o.id === savedPrefId) || validOrgs[0] || null;

      if (selectedOrg) {
        const memberInfo = activeMembers.find(m => m.organization_id === selectedOrg.id) || null;
        setActiveOrganization(selectedOrg);
        setActiveMember(memberInfo as OrganizationMember | null);
      } else {
        setActiveOrganization(null);
        setActiveMember(null);
      }
    } catch (e) {
      console.warn('[OrganizationProvider] Exceção ao carregar organizações:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const switchOrganization = (orgId: string) => {
    const targetOrg = organizations.find(o => o.id === orgId);
    if (targetOrg) {
      setActiveOrganization(targetOrg);
      localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, targetOrg.id);
      // Refresh member info for new org
      supabase
        .from('organization_members')
        .select('id,organization_id,user_id,role,status,created_at,updated_at')
        .eq('organization_id', targetOrg.id)
        .eq('user_id', user?.id || '')
        .eq('status', 'active')
        .maybeSingle()
        .then(({ data }) => {
          setActiveMember(data);
        });
    }
  };

  const createOrganization = async (name: string, legalName?: string, taxId?: string): Promise<Organization | null> => {
    if (!isAuthenticated || !user) return null;
    setIsLoading(true);
    try {
      // Execute Atomic RPC
      const { data: newOrgId, error: rpcErr } = await (supabase.rpc as any)('create_organization_with_owner', {
        org_name: name,
        legal_name: legalName || '',
        tax_id: taxId || ''
      });

      if (rpcErr) {
        console.error('[OrganizationProvider] Erro ao criar empresa via RPC:', rpcErr.message);
        setIsLoading(false);
        return null;
      }

      await fetchOrganizations();
      if (newOrgId) {
        switchOrganization(newOrgId);
      }
      return activeOrganization;
    } catch (e) {
      console.error('[OrganizationProvider] Exceção na criação de empresa:', e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const userRole = activeMember?.role || null;

  const canEditFinances = userRole === 'owner' || userRole === 'admin' || userRole === 'finance' || userRole === 'accountant';
  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const canManageOrganization = userRole === 'owner';
  const isViewerReadOnly = userRole === 'viewer';

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        activeOrganization,
        activeMember,
        userRole,
        isLoading,
        canEditFinances,
        canManageMembers,
        canManageOrganization,
        isViewerReadOnly,
        switchOrganization,
        createOrganization,
        refreshOrganizations: fetchOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization deve ser utilizado dentro de um OrganizationProvider');
  }
  return context;
}
