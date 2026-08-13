import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useOrganization } from './OrganizationContext';
import { 
  IPersonalAccountRepository, 
  IPersonalTransactionRepository, 
  IBusinessAccountRepository, 
  IBusinessTransactionRepository 
} from '../services/repositories/interfaces';
import { LocalPersonalAccountRepository } from '../services/repositories/local/LocalPersonalAccountRepository';
import { LocalPersonalTransactionRepository } from '../services/repositories/local/LocalPersonalTransactionRepository';
import { LocalBusinessAccountRepository } from '../services/repositories/local/LocalBusinessAccountRepository';
import { LocalBusinessTransactionRepository } from '../services/repositories/local/LocalBusinessTransactionRepository';
import { SupabasePersonalAccountRepository } from '../services/repositories/supabase/SupabasePersonalAccountRepository';
import { SupabasePersonalTransactionRepository } from '../services/repositories/supabase/SupabasePersonalTransactionRepository';
import { SupabaseBusinessAccountRepository } from '../services/repositories/supabase/SupabaseBusinessAccountRepository';
import { SupabaseBusinessTransactionRepository } from '../services/repositories/supabase/SupabaseBusinessTransactionRepository';

export type ModuleSource = 'local' | 'supabase';

export interface ModulePersistenceConfig {
  personalAccounts: ModuleSource;
  personalTransactions: ModuleSource;
  personalCards: ModuleSource;
  budgets: ModuleSource;
  goals: ModuleSource;
  emergencyReserves: ModuleSource;
  debts: ModuleSource;
  assets: ModuleSource;
  investments: ModuleSource;
  taxMetadata: ModuleSource;
  businessAccounts: ModuleSource;
  businessTransactions: ModuleSource;
  clients: ModuleSource;
  suppliers: ModuleSource;
  receivables: ModuleSource;
  payables: ModuleSource;
  invoices: ModuleSource;
  corporateCards: ModuleSource;
  projects: ModuleSource;
  costCenters: ModuleSource;
  taxRecords: ModuleSource;
  partners: ModuleSource;
  collectionEvents: ModuleSource;
  monthlyClosings: ModuleSource;
}

interface RepositoryContextType {
  config: ModulePersistenceConfig;
  personalAccountRepository: IPersonalAccountRepository;
  personalTransactionRepository: IPersonalTransactionRepository;
  businessAccountRepository: IBusinessAccountRepository;
  businessTransactionRepository: IBusinessTransactionRepository;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { activeOrganization } = useOrganization();

  // Granular Module-Level Persistence Mode Flags
  // In Phase 2C, 100% of PF and PJ modules utilize Supabase when authenticated.
  const config: ModulePersistenceConfig = useMemo(() => ({
    personalAccounts: isAuthenticated ? 'supabase' : 'local',
    personalTransactions: isAuthenticated ? 'supabase' : 'local',
    personalCards: isAuthenticated ? 'supabase' : 'local',
    budgets: isAuthenticated ? 'supabase' : 'local',
    goals: isAuthenticated ? 'supabase' : 'local',
    emergencyReserves: isAuthenticated ? 'supabase' : 'local',
    debts: isAuthenticated ? 'supabase' : 'local',
    assets: isAuthenticated ? 'supabase' : 'local',
    investments: isAuthenticated ? 'supabase' : 'local',
    taxMetadata: isAuthenticated ? 'supabase' : 'local',
    businessAccounts: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    businessTransactions: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    clients: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    suppliers: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    receivables: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    payables: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    invoices: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    corporateCards: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    projects: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    costCenters: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    taxRecords: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    partners: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    collectionEvents: isAuthenticated && activeOrganization ? 'supabase' : 'local',
    monthlyClosings: isAuthenticated && activeOrganization ? 'supabase' : 'local',
  }), [isAuthenticated, activeOrganization]);

  // Instantiate Repositories strictly according to current module configuration
  const personalAccountRepository = useMemo<IPersonalAccountRepository>(() => {
    return config.personalAccounts === 'supabase'
      ? new SupabasePersonalAccountRepository()
      : new LocalPersonalAccountRepository();
  }, [config.personalAccounts]);

  const personalTransactionRepository = useMemo<IPersonalTransactionRepository>(() => {
    return config.personalTransactions === 'supabase'
      ? new SupabasePersonalTransactionRepository()
      : new LocalPersonalTransactionRepository();
  }, [config.personalTransactions]);

  const businessAccountRepository = useMemo<IBusinessAccountRepository>(() => {
    return config.businessAccounts === 'supabase'
      ? new SupabaseBusinessAccountRepository()
      : new LocalBusinessAccountRepository();
  }, [config.businessAccounts]);

  const businessTransactionRepository = useMemo<IBusinessTransactionRepository>(() => {
    return config.businessTransactions === 'supabase'
      ? new SupabaseBusinessTransactionRepository()
      : new LocalBusinessTransactionRepository();
  }, [config.businessTransactions]);

  return (
    <RepositoryContext.Provider
      value={{
        config,
        personalAccountRepository,
        personalTransactionRepository,
        businessAccountRepository,
        businessTransactionRepository,
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories() {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepositories deve ser utilizado dentro de um RepositoryProvider');
  }
  return context;
}
