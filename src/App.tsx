import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { 
  ContextMode, 
  ViewMode, 
  PFTab, 
  PJTab, 
  Transaction, 
  Asset, 
  Project, 
  Defaulter, 
  BudgetItem, 
  CalendarEvent,
  Account,
  CreditCard,
  Goal,
  Debt,
  Customer,
  Supplier,
  CostCenter,
  InvestmentItem,
  RecurrenceItem,
  TransactionAnalytics,
  TransactionPageCursor,
  TransactionQueryFilters
} from './types';
import { StorageRepository } from './services/storage/storageRepository';

import { AuthProvider, useAuth } from './context/AuthContext';
import { OrganizationProvider, useOrganization } from './context/OrganizationContext';
import { RepositoryProvider, useRepositories } from './context/RepositoryContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuraLogger } from './lib/logger';
import { createScopedRequestGuard } from './lib/scopedRequestGuard';
import { isExplicitDemoMode } from './lib/runtimeDataPolicy';
import { LegacyImportService } from './services/migration/legacyImportService';
import { LegacyPjImportService } from './services/migration/legacyPjImportService';

// Supabase Repositories for Direct PF Sync
import { supabaseCreditCardRepo } from './services/repositories/supabase/SupabaseCreditCardRepository';
import { supabaseRecurrenceRepo } from './services/repositories/supabase/SupabaseRecurrenceRepository';
import { supabaseBudgetRepo } from './services/repositories/supabase/SupabaseBudgetRepository';
import { supabaseGoalRepo } from './services/repositories/supabase/SupabaseGoalRepository';
import { supabaseEmergencyReserveRepo } from './services/repositories/supabase/SupabaseEmergencyReserveRepository';
import { supabaseDebtRepo } from './services/repositories/supabase/SupabaseDebtRepository';
import { supabaseAssetRepo } from './services/repositories/supabase/SupabaseAssetRepository';
import { supabaseInvestmentRepo } from './services/repositories/supabase/SupabaseInvestmentRepository';
import {
  supabaseBusinessDataRepo,
  BusinessReceivable,
  BusinessPayable,
  BusinessInvoice,
} from './services/repositories/supabase/SupabaseBusinessDataRepository';

// Route and modal boundaries keep inactive product areas out of the initial path.
const AuraShell = lazy(() => import('./components/aura/AuraShell').then(module => ({ default: module.AuraShell })));
const LandingPage = lazy(() => import('./components/LandingPage').then(module => ({ default: module.LandingPage })));
const PfPjReconciliation = lazy(() => import('./components/PfPjReconciliation').then(module => ({ default: module.PfPjReconciliation })));
const PfOverview = lazy(() => import('./components/PfOverview').then(module => ({ default: module.PfOverview })));
const PfTransactions = lazy(() => import('./components/PfTransactions').then(module => ({ default: module.PfTransactions })));
const PfAccounts = lazy(() => import('./components/PfAccounts').then(module => ({ default: module.PfAccounts })));
const PfCards = lazy(() => import('./components/PfCards').then(module => ({ default: module.PfCards })));
const PfRecurrences = lazy(() => import('./components/PfRecurrences').then(module => ({ default: module.PfRecurrences })));
const PfPlanning = lazy(() => import('./components/PfPlanning').then(module => ({ default: module.PfPlanning })));
const PfGoalsView = lazy(() => import('./components/PfGoalsView').then(module => ({ default: module.PfGoalsView })));
const PfEmergencyReserveView = lazy(() => import('./components/PfEmergencyReserveView').then(module => ({ default: module.PfEmergencyReserveView })));
const PfDebtsView = lazy(() => import('./components/PfDebtsView').then(module => ({ default: module.PfDebtsView })));
const PfWealth = lazy(() => import('./components/PfWealth').then(module => ({ default: module.PfWealth })));
const PfInvestmentsView = lazy(() => import('./components/PfInvestmentsView').then(module => ({ default: module.PfInvestmentsView })));
const PfTaxPlanning = lazy(() => import('./components/PfTaxPlanning').then(module => ({ default: module.PfTaxPlanning })));
const PfReportsView = lazy(() => import('./components/PfReportsView').then(module => ({ default: module.PfReportsView })));
const PjOverview = lazy(() => import('./components/PjOverview').then(module => ({ default: module.PjOverview })));
const PjCashflow = lazy(() => import('./components/PjCashflow').then(module => ({ default: module.PjCashflow })));
const PjReceivablesPayables = lazy(() => import('./components/PjReceivablesPayables').then(module => ({ default: module.PjReceivablesPayables })));
const PjBillingView = lazy(() => import('./components/PjBillingView').then(module => ({ default: module.PjBillingView })));
const PjDreView = lazy(() => import('./components/PjDreView').then(module => ({ default: module.PjDreView })));
const PjBreakEvenView = lazy(() => import('./components/PjBreakEvenView').then(module => ({ default: module.PjBreakEvenView })));
const PjRunwayView = lazy(() => import('./components/PjRunwayView').then(module => ({ default: module.PjRunwayView })));
const PjProjectsView = lazy(() => import('./components/PjProjectsView').then(module => ({ default: module.PjProjectsView })));
const PjCostCentersView = lazy(() => import('./components/PjCostCentersView').then(module => ({ default: module.PjCostCentersView })));
const PjTaxControlView = lazy(() => import('./components/PjTaxControlView').then(module => ({ default: module.PjTaxControlView })));
const PjCollections = lazy(() => import('./components/PjCollections').then(module => ({ default: module.PjCollections })));
const PjAccountantHubView = lazy(() => import('./components/PjAccountantHubView').then(module => ({ default: module.PjAccountantHubView })));
const PjDocumentsView = lazy(() => import('./components/PjDocumentsView').then(module => ({ default: module.PjDocumentsView })));
const PjManagement = lazy(() => import('./components/PjManagement').then(module => ({ default: module.PjManagement })));
const PjCardsView = lazy(() => import('./components/PjCardsView').then(module => ({ default: module.PjCardsView })));
const PjAccounting = lazy(() => import('./components/PjAccounting').then(module => ({ default: module.PjAccounting })));
const PjReports = lazy(() => import('./components/PjReports').then(module => ({ default: module.PjReports })));
const TransactionModal = lazy(() => import('./components/TransactionModal').then(module => ({ default: module.TransactionModal })));
const BillingModal = lazy(() => import('./components/BillingModal').then(module => ({ default: module.BillingModal })));
const ProjectModal = lazy(() => import('./components/ProjectModal').then(module => ({ default: module.ProjectModal })));
const AssetModal = lazy(() => import('./components/AssetModal').then(module => ({ default: module.AssetModal })));
const EventModal = lazy(() => import('./components/EventModal').then(module => ({ default: module.EventModal })));
const AddCreditCardModal = lazy(() => import('./components/AddCreditCardModal').then(module => ({ default: module.AddCreditCardModal })));
const AccountModal = lazy(() => import('./components/aura/AccountModal').then(module => ({ default: module.AccountModal })));
const RecurrenceModal = lazy(() => import('./components/aura/RecurrenceModal').then(module => ({ default: module.RecurrenceModal })));
const GoalModal = lazy(() => import('./components/aura/GoalModal').then(module => ({ default: module.GoalModal })));
const DebtModal = lazy(() => import('./components/aura/DebtModal').then(module => ({ default: module.DebtModal })));
const InvestmentModal = lazy(() => import('./components/aura/InvestmentModal').then(module => ({ default: module.InvestmentModal })));
const GlobalSearchModal = lazy(() => import('./components/ui/GlobalSearchModal').then(module => ({ default: module.GlobalSearchModal })));
const AuthModal = lazy(() => import('./components/auth/AuthModal').then(module => ({ default: module.AuthModal })));
const AuthLayout = lazy(() => import('./components/auth/AuthLayout').then(module => ({ default: module.AuthLayout })));
const SecuritySettingsModal = lazy(() => import('./components/auth/SecuritySettingsModal').then(module => ({ default: module.SecuritySettingsModal })));
const LegacyImportModal = lazy(() => import('./components/auth/LegacyImportModal').then(module => ({ default: module.LegacyImportModal })));
const LegacyPjImportModal = lazy(() => import('./components/auth/LegacyPjImportModal').then(module => ({ default: module.LegacyPjImportModal })));
const CrossContextModal = lazy(() => import('./components/aura/CrossContextModal').then(module => ({ default: module.CrossContextModal })));

function AppLoadingFallback() {
  return (
    <div className={'min-h-screen bg-slate-50 flex items-center justify-center px-6'} role={'status'} aria-live={'polite'}>
      <div className={'flex items-center gap-3 text-sm font-semibold text-slate-700'}>
        <span className={'h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse'} aria-hidden={true} />
        Carregando AuraFin...
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <RepositoryProvider>
          <Suspense fallback={<AppLoadingFallback />}>
            <AppContent />
          </Suspense>
        </RepositoryProvider>
      </OrganizationProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isAuthenticated, isInitializing: isAuthLoading, isPasswordRecoveryMode } = useAuth();
  const { activeOrganization } = useOrganization();
  const { 
    config, 
    personalAccountRepository, 
    personalTransactionRepository, 
    businessAccountRepository, 
    businessTransactionRepository 
  } = useRepositories();
  const currentUserIdRef = useRef<string | null>(user?.id ?? null);
  const currentOrganizationIdRef = useRef<string | null>(activeOrganization?.id ?? null);
  currentUserIdRef.current = user?.id ?? null;
  currentOrganizationIdRef.current = activeOrganization?.id ?? null;

  const [viewMode, setViewMode] = useState<ViewMode>('app');
  const [mode, setMode] = useState<ContextMode>('PF');
  const [pfTab, setPfTab] = useState<PFTab>('overview');
  const [pjTab, setPjTab] = useState<PJTab>('overview');

  // Encapsulated Storage State
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => isExplicitDemoMode() ? StorageRepository.getPrivacyMode() : false);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return isExplicitDemoMode() && config.personalTransactions === 'local' && config.businessTransactions === 'local'
      ? StorageRepository.getTransactions()
      : [];
  });
  const emptyAnalytics: TransactionAnalytics = {
    transaction_count: 0,
    total_receipts_cents: 0,
    total_expenses_cents: 0,
    total_transfers_cents: 0,
    balance_cents: 0,
    by_category: [],
    cash_flow: [],
  };
  const [pfAnalytics, setPfAnalytics] = useState<TransactionAnalytics>(emptyAnalytics);
  const [pjAnalytics, setPjAnalytics] = useState<TransactionAnalytics>(emptyAnalytics);
  const [pfListAnalytics, setPfListAnalytics] = useState<TransactionAnalytics>(emptyAnalytics);
  const [pjListAnalytics, setPjListAnalytics] = useState<TransactionAnalytics>(emptyAnalytics);
  const [pfPageNumber, setPfPageNumber] = useState(1);
  const [pjPageNumber, setPjPageNumber] = useState(1);
  const [pfPageStart, setPfPageStart] = useState<TransactionPageCursor | null>(null);
  const [pjPageStart, setPjPageStart] = useState<TransactionPageCursor | null>(null);
  const [pfPageHistory, setPfPageHistory] = useState<(TransactionPageCursor | null)[]>([null]);
  const [pjPageHistory, setPjPageHistory] = useState<(TransactionPageCursor | null)[]>([null]);
  const [pfHasNextPage, setPfHasNextPage] = useState(false);
  const [pjHasNextPage, setPjHasNextPage] = useState(false);
  const [pfNextCursor, setPfNextCursor] = useState<TransactionPageCursor | null>(null);
  const [pjNextCursor, setPjNextCursor] = useState<TransactionPageCursor | null>(null);
  const [pfFilters, setPfFilters] = useState<TransactionQueryFilters>({ pageSize: 50 });
  const [pjFilters, setPjFilters] = useState<TransactionQueryFilters>({ pageSize: 50 });
  const [assets, setAssets] = useState<Asset[]>(() => isExplicitDemoMode() ? StorageRepository.getAssets() : []);
  const [projects, setProjects] = useState<Project[]>(() => isExplicitDemoMode() ? StorageRepository.getProjects() : []);
  const [defaulters, setDefaulters] = useState<Defaulter[]>(() => isExplicitDemoMode() ? StorageRepository.getDefaulters() : []);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => isExplicitDemoMode() ? StorageRepository.getBudgetItems() : []);
  const [events, setEvents] = useState<CalendarEvent[]>(() => isExplicitDemoMode() ? StorageRepository.getEvents() : []);
  const [accounts, setAccounts] = useState<Account[]>(() => isExplicitDemoMode() ? StorageRepository.getAccounts() : []);
  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => isExplicitDemoMode() ? StorageRepository.getCreditCards() : []);
  const [recurrences, setRecurrences] = useState<RecurrenceItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>(() => isExplicitDemoMode() ? StorageRepository.getGoals() : []);
  const [debts, setDebts] = useState<Debt[]>(() => isExplicitDemoMode() ? StorageRepository.getDebts() : []);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [emergencyReserveData, setEmergencyReserveData] = useState<{ currentAmount: number; targetMonths: number; monthlyExpenseBasis: number }>({
    currentAmount: 0,
    targetMonths: 6,
    monthlyExpenseBasis: 0
  });
  const [customers, setCustomers] = useState<Customer[]>(() => isExplicitDemoMode() ? StorageRepository.getCustomers() : []);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => isExplicitDemoMode() ? StorageRepository.getSuppliers() : []);
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => isExplicitDemoMode() ? StorageRepository.getCostCenters() : []);
  const [receivables, setReceivables] = useState<BusinessReceivable[]>([]);
  const [payables, setPayables] = useState<BusinessPayable[]>([]);
  const [invoices, setInvoices] = useState<BusinessInvoice[]>([]);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSecuritySettingsOpen, setIsSecuritySettingsOpen] = useState(false);
  const [isLegacyImportModalOpen, setIsLegacyImportModalOpen] = useState(false);
  const [isLegacyPjImportModalOpen, setIsLegacyPjImportModalOpen] = useState(false);
  const [isCrossContextModalOpen, setIsCrossContextModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);


  // Clean Slate: purge memory when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setTransactions([]);
      setAccounts([]);
      setCreditCards([]);
      setAssets([]);
      setProjects([]);
      setGoals([]);
      setDebts([]);
      setCustomers([]);
      setSuppliers([]);
      setCostCenters([]);
      setReceivables([]);
      setPayables([]);
      setInvoices([]);
      setEvents([]);
    }
  }, [isAuthenticated]);

  const loadPersonalTransactionPage = async (
    cursor: TransactionPageCursor | null,
    pageNumber: number,
    filters: TransactionQueryFilters = pfFilters,
  ) => {
    if (!user || config.personalTransactions !== 'supabase') return;
    const scopeUserId = user.id;
    const guard = createScopedRequestGuard(scopeUserId);
    try {
      const pageFilters = { ...filters, cursor, pageSize: Math.min(Math.max(filters.pageSize ?? 50, 1), 100) };
      const [page, listAnalytics] = await Promise.all([
        personalTransactionRepository.listPage(scopeUserId, pageFilters),
        personalTransactionRepository.analytics(scopeUserId, pageFilters),
      ]);
      if (!guard.isActive(scopeUserId) || currentUserIdRef.current !== scopeUserId) return;
      setTransactions(prev => [...prev.filter(t => t.context === 'PJ'), ...page.rows]);
      setPfPageNumber(pageNumber);
      setPfPageStart(cursor);
      setPfNextCursor(page.nextCursor);
      setPfHasNextPage(page.hasMore);
      setPfListAnalytics(listAnalytics);
    } catch (error: any) {
      AuraLogger.error('[App] Erro ao paginar/agregar transações PF', { module: 'transactions_pf_page', error: error?.message });
    } finally {
      guard.cancel();
    }
  };

  const loadBusinessTransactionPage = async (
    organizationId: string,
    cursor: TransactionPageCursor | null,
    pageNumber: number,
    filters: TransactionQueryFilters = pjFilters,
  ) => {
    if (config.businessTransactions !== 'supabase') return;
    const guard = createScopedRequestGuard(organizationId);
    try {
      const pageFilters = { ...filters, cursor, pageSize: Math.min(Math.max(filters.pageSize ?? 50, 1), 100) };
      const [page, listAnalytics] = await Promise.all([
        businessTransactionRepository.listPage(organizationId, pageFilters),
        businessTransactionRepository.analytics(organizationId, pageFilters),
      ]);
      if (!guard.isActive(organizationId) || currentOrganizationIdRef.current !== organizationId) return;
      setTransactions(prev => [...prev.filter(t => t.context === 'PF'), ...page.rows]);
      setPjPageNumber(pageNumber);
      setPjPageStart(cursor);
      setPjNextCursor(page.nextCursor);
      setPjHasNextPage(page.hasMore);
      setPjListAnalytics(listAnalytics);
    } catch (error: any) {
      AuraLogger.error('[App] Erro ao paginar/agregar transações PJ', { module: 'transactions_pj_page', error: error?.message });
    } finally {
      guard.cancel();
    }
  };

  const refreshPersonalTransactionAnalytics = async () => {
    if (!user || config.personalTransactions !== 'supabase') return;
    const scopeUserId = user.id;
    const guard = createScopedRequestGuard(scopeUserId);
    try {
      const analytics = await personalTransactionRepository.analytics(scopeUserId);
      if (guard.isActive(scopeUserId) && currentUserIdRef.current === scopeUserId) setPfAnalytics(analytics);
    } catch (error: any) {
      AuraLogger.error('[App] Erro ao atualizar agregados PF', { module: 'transactions_pf_analytics', error: error?.message });
    } finally {
      guard.cancel();
    }
  };

  const refreshBusinessTransactionAnalytics = async (organizationId: string) => {
    if (config.businessTransactions !== 'supabase') return;
    const guard = createScopedRequestGuard(organizationId);
    try {
      const analytics = await businessTransactionRepository.analytics(organizationId);
      if (guard.isActive(organizationId) && currentOrganizationIdRef.current === organizationId) setPjAnalytics(analytics);
    } catch (error: any) {
      AuraLogger.error('[App] Erro ao atualizar agregados PJ', { module: 'transactions_pj_analytics', error: error?.message });
    } finally {
      guard.cancel();
    }
  };

  const handlePfQueryChange = (filters: TransactionQueryFilters) => {
    setPfFilters(filters);
    setPfPageHistory([null]);
    void loadPersonalTransactionPage(null, 1, filters);
  };

  const handlePjQueryChange = (filters: TransactionQueryFilters) => {
    setPjFilters(filters);
    setPjPageHistory([null]);
    if (activeOrganization) void loadBusinessTransactionPage(activeOrganization.id, null, 1, filters);
  };

  const handlePfNextPage = () => {
    if (pfNextCursor && pfHasNextPage) {
      setPfPageHistory(prev => [...prev, pfNextCursor]);
      void loadPersonalTransactionPage(pfNextCursor, pfPageNumber + 1, pfFilters);
    }
  };

  const handlePfPreviousPage = () => {
    if (pfPageHistory.length > 1) {
      const previousHistory = pfPageHistory.slice(0, -1);
      const previousCursor = previousHistory[previousHistory.length - 1] || null;
      setPfPageHistory(previousHistory);
      void loadPersonalTransactionPage(previousCursor, Math.max(1, pfPageNumber - 1), pfFilters);
    }
  };

  const handlePjNextPage = () => {
    if (activeOrganization && pjNextCursor && pjHasNextPage) {
      setPjPageHistory(prev => [...prev, pjNextCursor]);
      void loadBusinessTransactionPage(activeOrganization.id, pjNextCursor, pjPageNumber + 1, pjFilters);
    }
  };

  const handlePjPreviousPage = () => {
    if (activeOrganization && pjPageHistory.length > 1) {
      const previousHistory = pjPageHistory.slice(0, -1);
      const previousCursor = previousHistory[previousHistory.length - 1] || null;
      setPjPageHistory(previousHistory);
      void loadBusinessTransactionPage(activeOrganization.id, previousCursor, Math.max(1, pjPageNumber - 1), pjFilters);
    }
  };

  // Legacy PF Import Assistant Check (disabled by default in Production)
  useEffect(() => {
    const isLegacyImportEnabled = (import.meta as any).env?.VITE_ENABLE_LEGACY_IMPORT === 'true';
    if (!isLegacyImportEnabled || !isAuthenticated || !user) return;

    const guard = createScopedRequestGuard(user.id);
    LegacyImportService.previewImport(user.id).then(res => {
      if (guard.isActive(user.id) && res.hasLegacyData && !res.alreadyImported) {
        setIsLegacyImportModalOpen(true);
      }
    }).catch(e => {
      if (guard.isActive(user.id)) {
        AuraLogger.warn('[App] Erro ao checar legado PF', { module: 'legacy_import', error: e?.message });
      }
    });

    return () => guard.cancel();
  }, [isAuthenticated, user]);

  // Legacy PJ Import Assistant Check (disabled by default in Production)
  useEffect(() => {
    const isLegacyImportEnabled = (import.meta as any).env?.VITE_ENABLE_LEGACY_IMPORT === 'true';
    if (!isLegacyImportEnabled || !isAuthenticated || !activeOrganization) return;

    const guard = createScopedRequestGuard(activeOrganization.id);
    LegacyPjImportService.previewImport(activeOrganization.id).then(res => {
      if (guard.isActive(activeOrganization.id) && res.hasLegacyData && !res.alreadyImported) {
        setIsLegacyPjImportModalOpen(true);
      }
    }).catch(e => {
      if (guard.isActive(activeOrganization.id)) {
        AuraLogger.warn('[App] Erro ao checar legado PJ', { module: 'legacy_import_pj', error: e?.message });
      }
    });

    return () => guard.cancel();
  }, [isAuthenticated, activeOrganization]);

  // Sincronização completa de todos os módulos PF com Supabase
  useEffect(() => {
    if (isAuthenticated && user) {
      const guard = createScopedRequestGuard(user.id);

      // User boundary: do not render the previous user's PF state while the
      // next authenticated scope is being fetched.
      setTransactions(prev => prev.filter(t => t.context === 'PJ'));
      setAccounts(prev => prev.filter(a => a.context === 'PJ'));
      setCreditCards(prev => prev.filter(c => c.context === 'PJ'));
      setRecurrences([]);
      setBudgetItems([]);
      setGoals([]);
      setDebts([]);
      setAssets([]);
      setInvestments([]);
      setEmergencyReserveData({ currentAmount: 0, targetMonths: 6, monthlyExpenseBasis: 0 });

      // 1. Contas PF
      personalAccountRepository.list(user.id).then(supAccounts => {
        if (guard.isActive(user.id)) setAccounts(prev => [...supAccounts, ...prev.filter(a => a.context === 'PJ')]);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar contas PF', { error: err?.message }));

      // 2. Transações PF
      personalTransactionRepository.listPage(user.id, { pageSize: 50 }).then(page => {
        if (guard.isActive(user.id)) setTransactions(prev => [...page.rows, ...prev.filter(t => t.context === 'PJ')]);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar transações PF', { error: err?.message }));

      // 3. Cartões PF
      supabaseCreditCardRepo.list(user.id).then(supCards => {
        if (guard.isActive(user.id)) setCreditCards(prev => [...supCards, ...prev.filter(c => c.context === 'PJ')]);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar cartões PF', { error: err?.message }));

      // 4. Recorrências PF
      supabaseRecurrenceRepo.list(user.id).then(supRecs => {
        if (guard.isActive(user.id)) setRecurrences(supRecs);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar recorrências PF', { error: err?.message }));

      // 5. Orçamentos PF
      const currentMonth = new Date().toISOString().slice(0, 7);
      supabaseBudgetRepo.list(user.id, currentMonth).then(supBudgets => {
        if (guard.isActive(user.id)) setBudgetItems(supBudgets);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar orçamentos PF', { error: err?.message }));

      // 6. Metas PF
      supabaseGoalRepo.list(user.id).then(supGoals => {
        if (guard.isActive(user.id)) setGoals(supGoals);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar metas PF', { error: err?.message }));

      // 7. Reserva de Emergência PF
      supabaseEmergencyReserveRepo.get(user.id).then(resData => {
        if (guard.isActive(user.id)) setEmergencyReserveData(resData);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar reserva PF', { error: err?.message }));

      // 8. Dívidas PF
      supabaseDebtRepo.list(user.id).then(supDebts => {
        if (guard.isActive(user.id)) setDebts(supDebts);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar dívidas PF', { error: err?.message }));

      // 9. Bens & Patrimônio PF
      supabaseAssetRepo.list(user.id).then(supAssets => {
        if (guard.isActive(user.id)) setAssets(supAssets);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar bens PF', { error: err?.message }));

      // 10. Investimentos PF
      supabaseInvestmentRepo.list(user.id).then(supInvs => {
        if (guard.isActive(user.id)) setInvestments(supInvs);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar investimentos PF', { error: err?.message }));

      return () => guard.cancel();
    }
  }, [isAuthenticated, user, personalAccountRepository, personalTransactionRepository]);

  // Synchronize PJ Accounts & Transactions when module is in Supabase mode
  useEffect(() => {
    if (config.businessAccounts === 'supabase' && activeOrganization) {
      const organizationId = activeOrganization.id;
      const guard = createScopedRequestGuard(organizationId);

      // Clear all tenant-scoped collections before loading the new tenant.
      setCustomers([]);
      setSuppliers([]);
      setProjects([]);
      setDefaulters([]);
      setCostCenters([]);
      setReceivables([]);
      setPayables([]);
      setInvoices([]);
      setCreditCards(prev => prev.filter(card => card.context === 'PF'));

      businessAccountRepository.list(organizationId).then(supAccounts => {
        if (guard.isActive(organizationId)) {
          setAccounts(prev => [...prev.filter(a => a.context === 'PF'), ...supAccounts]);
        }
      }).catch(err => AuraLogger.error('[App] Erro ao carregar contas PJ do Supabase', { module: 'accounts_pj', error: err?.message }));

      Promise.all([
        supabaseBusinessDataRepo.listClients(organizationId),
        supabaseBusinessDataRepo.listSuppliers(organizationId),
        supabaseBusinessDataRepo.listProjects(organizationId),
        supabaseBusinessDataRepo.listCostCenters(organizationId),
        supabaseBusinessDataRepo.listDefaulters(organizationId),
        supabaseBusinessDataRepo.listReceivables(organizationId),
        supabaseBusinessDataRepo.listPayables(organizationId),
        supabaseBusinessDataRepo.listInvoices(organizationId),
        supabaseBusinessDataRepo.listCorporateCards(organizationId),
      ]).then(([nextCustomers, nextSuppliers, nextProjects, nextCostCenters, nextDefaulters, nextReceivables, nextPayables, nextInvoices, nextCards]) => {
        if (!guard.isActive(organizationId) || currentOrganizationIdRef.current !== organizationId) return;
        setCustomers(nextCustomers);
        setSuppliers(nextSuppliers);
        setProjects(nextProjects);
        setCostCenters(nextCostCenters);
        setDefaulters(nextDefaulters);
        setReceivables(nextReceivables);
        setPayables(nextPayables);
        setInvoices(nextInvoices);
        setCreditCards(prev => [...prev.filter(card => card.context === 'PF'), ...nextCards]);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar entidades PJ do Supabase', { module: 'pj_entities', error: err?.message }));
      return () => guard.cancel();
    }
  }, [config.businessAccounts, activeOrganization, businessAccountRepository]);

  useEffect(() => {
    // Tenant boundary: remove the previous organization's rows and aggregates
    // before any new request can resolve. This prevents Org A data from being
    // rendered while Org B is loading (or when the active org is cleared).
    setTransactions(prev => prev.filter(t => t.context === 'PF'));
    setPjAnalytics(emptyAnalytics);
    setPjListAnalytics(emptyAnalytics);
    setPjPageNumber(1);
    setPjPageStart(null);
    setPjPageHistory([null]);
    setPjHasNextPage(false);
    setPjNextCursor(null);

    if (config.businessTransactions === 'supabase' && activeOrganization) {
      const organizationId = activeOrganization.id;
      const guard = createScopedRequestGuard(organizationId);

      businessTransactionRepository.listPage(organizationId, { pageSize: 50 }).then(page => {
        if (guard.isActive(organizationId)) {
          setTransactions(prev => [...prev.filter(t => t.context === 'PF'), ...page.rows]);
        }
      }).catch(err => AuraLogger.error('[App] Erro ao carregar transações PJ do Supabase', { module: 'transactions_pj', error: err?.message }));
      return () => guard.cancel();
    }
  }, [config.businessTransactions, activeOrganization, businessTransactionRepository]);

  // Transaction pages/aggregates have an explicit lifecycle separate from the
  // legacy entity sync above, preventing a full-history fetch on auth restore
  // or organization changes.
  useEffect(() => {
    if (!isAuthenticated || !user || config.personalTransactions !== 'supabase') return;
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endDateExclusive = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
    const initialFilters: TransactionQueryFilters = { pageSize: 50, startDate, endDateExclusive };
    setPfFilters(initialFilters);
    setPfPageHistory([null]);
    void loadPersonalTransactionPage(null, 1, initialFilters);
    void refreshPersonalTransactionAnalytics();
  }, [isAuthenticated, user, config.personalTransactions, personalTransactionRepository]);

  useEffect(() => {
    if (config.businessTransactions !== 'supabase' || !activeOrganization) return;
    const initialFilters: TransactionQueryFilters = { pageSize: 50 };
    setPjFilters(initialFilters);
    setPjPageHistory([null]);
    void loadBusinessTransactionPage(activeOrganization.id, null, 1, initialFilters);
    void refreshBusinessTransactionAnalytics(activeOrganization.id);
  }, [config.businessTransactions, activeOrganization, businessTransactionRepository]);

  // Persistence Effects for local modules
  useEffect(() => {
    if (isExplicitDemoMode() && (config.personalTransactions === 'local' || config.businessTransactions === 'local')) {
      StorageRepository.saveTransactions(transactions); 
    }
  }, [transactions, config.personalTransactions, config.businessTransactions]);
  useEffect(() => { if (isExplicitDemoMode()) StorageRepository.saveAssets(assets); }, [assets]);
  useEffect(() => { if (isExplicitDemoMode()) StorageRepository.saveProjects(projects); }, [projects]);
  useEffect(() => { if (isExplicitDemoMode()) StorageRepository.saveDefaulters(defaulters); }, [defaulters]);
  useEffect(() => { if (isExplicitDemoMode()) StorageRepository.setPrivacyMode(isPrivacyMode); }, [isPrivacyMode]);

  // Calculations for Cross-Reimbursements
  const pendingReimbursements = transactions.filter(t => t.context === 'PJ' && t.isPaidByPF && !t.reimbursed);
  const pendingReimbursementAmount = config.businessTransactions === 'supabase'
    ? Number(pjAnalytics.paid_by_pf_cents || 0) / 100
    : pendingReimbursements.reduce((acc, t) => acc + t.amount, 0);

  // Reembolsar Sócio em 1-clique
  const handleReimburseSocio = () => {
    if (!isExplicitDemoMode()) {
      alert('O reembolso deve ser processado pelo RPC seguro do Supabase antes de ser habilitado nesta tela.');
      return;
    }
    if (pendingReimbursementAmount <= 0) {
      alert('Nenhum valor pendente de reembolso ao sócio.');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const crossId = `reimburse_${Date.now()}`;

    const pjOffset: Transaction = {
      id: `tx_reimburse_pj_${Date.now()}`,
      context: 'PJ',
      type: 'expense',
      title: `Reembolso Aporte Sócio (${pendingReimbursements.length} despesas)`,
      amount: pendingReimbursementAmount,
      amountCents: Math.round(pendingReimbursementAmount * 100),
      date: timestamp,
      category: 'reembolso_socio',
      subCategory: 'Liquidação Aporte Sócio',
      crossContextId: crossId,
    };

    const pfOffset: Transaction = {
      id: `tx_reimburse_pf_${Date.now()}`,
      context: 'PF',
      type: 'income',
      title: `Recebimento Reembolso Despesas PJ`,
      amount: pendingReimbursementAmount,
      amountCents: Math.round(pendingReimbursementAmount * 100),
      date: timestamp,
      category: 'outros',
      subCategory: 'Reembolso do Sócio',
      crossContextId: crossId,
      isPaidByPF: true,
      reimbursed: true,
    };

    const updated = transactions.map(t => {
      if (t.context === 'PJ' && t.isPaidByPF && !t.reimbursed) {
        return { ...t, reimbursed: true };
      }
      return t;
    });

    setTransactions([...updated, pjOffset, pfOffset]);
    alert(`Reembolso de R$ ${pendingReimbursementAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} efetuado em 1-clique!`);
  };

  const handleResetDemo = () => {
    if (!isExplicitDemoMode()) return;
    if (window.confirm('Deseja restaurar os dados originais de demonstração do AuraFin?')) {
      void StorageRepository.resetToDemo().then(() => {
        setTransactions(StorageRepository.getTransactions());
        setAssets(StorageRepository.getAssets());
        setProjects(StorageRepository.getProjects());
        setDefaulters(StorageRepository.getDefaulters());
        setIsPrivacyMode(false);
        alert('Dados restaurados com sucesso!');
      });
    }
  };

  const handleSaveTransaction = async (txData: Partial<Transaction>) => {
    const txContext = txData.context || mode;

    if (txContext === 'PF' && user) {
      try {
        const saved = await personalTransactionRepository.create(txData, user.id);
        setTransactions(prev => [saved, ...prev.filter(t => t.id !== saved.id)]);
        return;
      } catch (e: any) {
        AuraLogger.error('[App] Erro ao salvar transação PF no Supabase', { error: e?.message });
        alert(`Erro ao salvar transação: ${e.message || 'Falha na operação'}`);
        return;
      }
    }

    if (txContext === 'PJ' && activeOrganization) {
      try {
        const saved = await businessTransactionRepository.create(txData, activeOrganization.id);
        setTransactions(prev => [saved, ...prev.filter(t => t.id !== saved.id)]);
        return;
      } catch (e: any) {
        AuraLogger.error('[App] Erro ao salvar transação PJ no Supabase', { error: e?.message });
        alert(`Erro ao salvar transação: ${e.message || 'Falha na operação'}`);
        return;
      }
    }

    if (!isExplicitDemoMode()) {
      alert('O cadastro de transações requer uma sessão autenticada do Supabase.');
      return;
    }

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...txData } as Transaction : t));
      setEditingTransaction(null);
    } else {
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        context: txContext,
        type: txData.type || 'expense',
        title: txData.title || 'Novo Lançamento',
        amount: txData.amount || 0,
        amountCents: Math.round((txData.amount || 0) * 100),
        date: txData.date || new Date().toISOString().split('T')[0],
        category: txData.category || 'outros',
        subCategory: txData.subCategory,
        isTaxDeductiblePF: txData.isTaxDeductiblePF,
        isPersonalExpenseInPJ: txData.isPersonalExpenseInPJ,
        isPaidByPF: txData.isPaidByPF,
        recurrence: txData.recurrence,
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  // PF CRUD Handlers
  const handleSaveAccount = async (accData: Partial<Account>) => {
    if (user) {
      const saved = await personalAccountRepository.create(accData, user.id);
      setAccounts(prev => [...prev.filter(a => a.id !== saved.id), saved]);
    } else {
      if (!isExplicitDemoMode()) {
        alert('O cadastro de contas requer uma sessão autenticada do Supabase.');
        return;
      }
      const newAcc: Account = {
        id: `acc_${Date.now()}`,
        name: accData.name || 'Nova Conta',
        institution: accData.institution || '',
        type: accData.type || 'corrente',
        balance: accData.balance || 0,
        context: 'PF'
      };
      setAccounts(prev => [...prev, newAcc]);
    }
  };

  const handleDeleteAccount = async (accId: string) => {
    if (user) {
      await personalAccountRepository.archive(accId, user.id);
    } else if (!isExplicitDemoMode()) {
      alert('A exclusão de contas requer uma sessão autenticada do Supabase.');
      return;
    }
    setAccounts(prev => prev.filter(a => a.id !== accId));
  };

  const handleSaveCreditCard = async (cardData: Partial<CreditCard>) => {
    if (mode === 'PJ' && !isExplicitDemoMode()) {
      alert('O cadastro de cartões corporativos deve ser persistido pelo módulo Supabase PJ antes de ser habilitado.');
      return;
    }
    if (user) {
      const saved = await supabaseCreditCardRepo.create(cardData, user.id);
      if (saved) {
        setCreditCards(prev => [...prev.filter(c => c.id !== saved.id), saved]);
      }
    } else {
      if (!isExplicitDemoMode()) {
        alert('O cadastro de cartões requer uma sessão autenticada do Supabase.');
        return;
      }
      const newCard: CreditCard = {
        id: cardData.id || `card_${Date.now()}`,
        name: cardData.name || '',
        institution: cardData.institution || '',
        type: cardData.type || 'credito',
        brand: cardData.brand || '',
        lastFourDigits: cardData.lastFourDigits || '',
        limitTotal: cardData.limitTotal || 0,
        limitUsed: 0,
        currentInvoice: 0,
        closingDay: cardData.closingDay || 0,
        dueDay: cardData.dueDay || 0,
        context: mode,
        isPrimary: cardData.isPrimary || false,
        status: 'ativo',
      };
      setCreditCards(prev => [...prev, newCard]);
    }
  };

  const handleDeleteCreditCard = async (cardId: string) => {
    if (user) {
      await supabaseCreditCardRepo.delete(cardId, user.id);
    } else if (!isExplicitDemoMode()) {
      alert('A exclusão de cartões requer uma sessão autenticada do Supabase.');
      return;
    }
    setCreditCards(prev => prev.filter(c => c.id !== cardId));
  };

  const handleSaveRecurrence = async (recData: Partial<RecurrenceItem>) => {
    if (user) {
      const saved = await supabaseRecurrenceRepo.create(recData, user.id);
      if (saved) {
        setRecurrences(prev => [...prev, saved]);
      }
    } else {
      if (!isExplicitDemoMode()) {
        alert('O cadastro de recorrências requer uma sessão autenticada do Supabase.');
        return;
      }
      const newRec: RecurrenceItem = {
        id: `rec_${Date.now()}`,
        title: recData.title || 'Nova Recorrência',
        amount: recData.amount || 0,
        frequency: recData.frequency || 'mensal',
        category: recData.category || 'moradia',
        nextDueDate: recData.nextDueDate || new Date().toISOString().split('T')[0],
        context: 'PF'
      };
      setRecurrences(prev => [...prev, newRec]);
    }
  };

  const handleDeleteRecurrence = async (recId: string) => {
    if (user) {
      await supabaseRecurrenceRepo.delete(recId, user.id);
    } else if (!isExplicitDemoMode()) {
      alert('A exclusão de recorrências requer uma sessão autenticada do Supabase.');
      return;
    }
    setRecurrences(prev => prev.filter(r => r.id !== recId));
  };

  const handleSaveBudgets = async (newBudgets: { category: string; planned: number }[]) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (user) {
      for (const b of newBudgets) {
        await supabaseBudgetRepo.upsert(user.id, b.category, b.planned, currentMonth);
      }
      const updated = await supabaseBudgetRepo.list(user.id, currentMonth);
      setBudgetItems(updated);
    }
  };

  const handleCopyPreviousMonthBudgets = async () => {
    if (user) {
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7);
      const prevDate = new Date();
      prevDate.setMonth(prevDate.getMonth() - 1);
      const previousMonth = prevDate.toISOString().slice(0, 7);
      await supabaseBudgetRepo.copyFromPreviousMonth(user.id, currentMonth, previousMonth);
      const updated = await supabaseBudgetRepo.list(user.id, currentMonth);
      setBudgetItems(updated);
      alert('Orçamentos do mês anterior copiados com sucesso!');
    }
  };

  const handleSaveGoal = async (goalData: Partial<Goal>) => {
    if (user) {
      const saved = await supabaseGoalRepo.create(goalData, user.id);
      if (saved) {
        setGoals(prev => [...prev, saved]);
      }
    } else {
      if (!isExplicitDemoMode()) {
        alert('O cadastro de metas requer uma sessão autenticada do Supabase.');
        return;
      }
      const newGoal: Goal = {
        id: `goal_${Date.now()}`,
        title: goalData.title || 'Nova Meta',
        targetAmount: goalData.targetAmount || 0,
        currentAmount: goalData.currentAmount || 0,
        targetDate: goalData.targetDate || new Date().toISOString().split('T')[0],
        category: goalData.category || 'outros'
      };
      setGoals(prev => [...prev, newGoal]);
    }
  };

  const handleContributeGoal = async (goalId: string, amount: number, notes?: string) => {
    if (user) {
      await supabaseGoalRepo.addContribution(goalId, amount, user.id, notes);
      const reloaded = await supabaseGoalRepo.list(user.id);
      setGoals(reloaded);
    } else {
      if (!isExplicitDemoMode()) {
        alert('A contribuição requer uma sessão autenticada do Supabase.');
        return;
      }
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g));
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (user) {
      await supabaseGoalRepo.delete(goalId, user.id);
    } else if (!isExplicitDemoMode()) {
      alert('A exclusão de metas requer uma sessão autenticada do Supabase.');
      return;
    }
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const handleSaveEmergencyReserve = async (targetMonths: number, monthlyExpense: number, currentAmount: number) => {
    if (user) {
      await supabaseEmergencyReserveRepo.save(user.id, {
        targetMonths,
        monthlyExpenseBasis: monthlyExpense,
        currentAmount
      });
      setEmergencyReserveData({
        targetMonths,
        monthlyExpenseBasis: monthlyExpense,
        currentAmount
      });
    }
  };

  const handleSaveDebt = async (debtData: Partial<Debt>) => {
    if (user) {
      const saved = await supabaseDebtRepo.create(debtData, user.id);
      if (saved) {
        setDebts(prev => [...prev, saved]);
      }
    } else {
      if (!isExplicitDemoMode()) {
        alert('O cadastro de dívidas requer uma sessão autenticada do Supabase.');
        return;
      }
      const newDebt: Debt = {
        id: `debt_${Date.now()}`,
        title: debtData.title || 'Nova Dívida',
        totalBalance: debtData.totalBalance || 0,
        monthlyPayment: debtData.monthlyPayment || 0,
        remainingInstallments: debtData.remainingInstallments || 0,
        interestRatePct: debtData.interestRatePct || 0,
        dueDate: debtData.dueDate || new Date().toISOString().split('T')[0]
      };
      setDebts(prev => [...prev, newDebt]);
    }
  };

  const handlePayDebtInstallment = async (debtId: string, amount: number) => {
    if (user) {
      await supabaseDebtRepo.payInstallment(debtId, amount, user.id);
      const reloadedDebts = await supabaseDebtRepo.list(user.id);
      setDebts(reloadedDebts);

      // Register expense transaction
      const newTx = await personalTransactionRepository.create({
        context: 'PF',
        type: 'expense',
        title: `Pagamento Parcela Dívida`,
        amount,
        amountCents: Math.round(amount * 100),
        date: new Date().toISOString().split('T')[0],
        category: 'outros'
      }, user.id);
      setTransactions(prev => [newTx, ...prev]);
    } else {
      if (!isExplicitDemoMode()) {
        alert('O pagamento requer uma sessão autenticada do Supabase.');
        return;
      }
      setDebts(prev => prev.map(d => d.id === debtId ? {
        ...d,
        totalBalance: Math.max(0, d.totalBalance - amount),
        remainingInstallments: Math.max(0, d.remainingInstallments - 1)
      } : d));
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (user) {
      await supabaseDebtRepo.delete(debtId, user.id);
    } else if (!isExplicitDemoMode()) {
      alert('A exclusão de dívidas requer uma sessão autenticada do Supabase.');
      return;
    }
    setDebts(prev => prev.filter(d => d.id !== debtId));
  };

  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    if (user) {
      const saved = await supabaseAssetRepo.create(assetData, user.id);
      if (saved) {
        setAssets(prev => [...prev, saved]);
      }
    } else {
      if (!isExplicitDemoMode()) {
        alert('O cadastro de ativos requer uma sessão autenticada do Supabase.');
        return;
      }
      const newAsset: Asset = {
        id: `ast_${Date.now()}`,
        name: assetData.name || 'Novo Bem',
        category: assetData.category || 'outros',
        value: assetData.value || 0,
        notes: assetData.notes
      };
      setAssets(prev => [...prev, newAsset]);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (user) {
      await supabaseAssetRepo.delete(assetId, user.id);
    } else if (!isExplicitDemoMode()) {
      alert('A exclusão de ativos requer uma sessão autenticada do Supabase.');
      return;
    }
    setAssets(prev => prev.filter(a => a.id !== assetId));
  };

  const handleSaveInvestment = async (invData: Partial<InvestmentItem>) => {
    if (user) {
      const saved = await supabaseInvestmentRepo.create(invData, user.id);
      if (saved) {
        setInvestments(prev => [...prev, saved]);
      }
    } else {
      if (!isExplicitDemoMode()) {
        alert('O cadastro de investimentos requer uma sessão autenticada do Supabase.');
        return;
      }
      const newInv: InvestmentItem = {
        id: `inv_${Date.now()}`,
        name: invData.name || 'Novo Investimento',
        assetType: invData.assetType || 'Renda Fixa',
        institution: invData.institution || 'Corretora',
        totalValue: invData.totalValue || 0,
        investedValue: invData.investedValue || 0,
        yieldPct: '+0.0%'
      };
      setInvestments(prev => [...prev, newInv]);
    }
  };

  const handleDeleteInvestment = async (invId: string) => {
    if (user) {
      await supabaseInvestmentRepo.delete(invId, user.id);
    } else if (!isExplicitDemoMode()) {
      alert('A exclusão de investimentos requer uma sessão autenticada do Supabase.');
      return;
    }
    setInvestments(prev => prev.filter(i => i.id !== invId));
  };

  if (isAuthLoading) {
    return <AppLoadingFallback />;
  }

  if (isPasswordRecoveryMode) {
    return <AuthLayout initialMode="reset-password" />;
  }

  if (!isAuthenticated && viewMode !== 'landing') {
    return <AuthLayout />;
  }

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onEnterApp={() => setViewMode('app')}
        onSelectMode={(selectedMode) => {
          setMode(selectedMode);
          setViewMode('app');
        }}
      />
    );
  }

  return (
    <AuraShell
      mode={mode}
      setMode={setMode}
      viewMode={viewMode}
      setViewMode={setViewMode}
      pfTab={pfTab}
      setPfTab={setPfTab}
      pjTab={pjTab}
      setPjTab={setPjTab}
      isPrivacyMode={isPrivacyMode}
      setIsPrivacyMode={setIsPrivacyMode}
      pendingReimbursementAmount={pendingReimbursementAmount}
      defaultersCount={defaulters.length}
      onOpenSearch={() => setIsGlobalSearchOpen(true)}
      onResetDemo={isExplicitDemoMode() ? handleResetDemo : undefined}
      onOpenTransactionModal={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
      onOpenBillingModal={() => setIsBillingModalOpen(true)}
      onOpenAuthModal={() => setIsAuthModalOpen(true)}
      onOpenSecuritySettings={() => setIsSecuritySettingsOpen(true)}
    >
      {/* MODO PESSOA FÍSICA (PF) */}
      {mode === 'PF' && (
        <>
          {pfTab === 'overview' && (
            <ErrorBoundary isAreaBoundary moduleName="pf_overview" fallbackTitle="Falha ao carregar visão geral PF">
              <PfOverview
                transactions={transactions}
                analytics={config.personalTransactions === 'supabase' ? pfAnalytics : undefined}
                accounts={accounts}
                events={events}
                assets={assets}
                budgetItems={budgetItems}
                goals={goals}
                creditCards={creditCards}
                isPrivacyMode={isPrivacyMode}
                onAddTransaction={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
                onAddAccount={() => setIsAccountModalOpen(true)}
                onAddGoal={() => setIsGoalModalOpen(true)}
                onNavigateTab={(tab) => setPfTab(tab as PFTab)}
                onAddCard={() => setIsAddCardModalOpen(true)}
              />
            </ErrorBoundary>
          )}

          {pfTab === 'transactions' && (
            <PfTransactions
              transactions={transactions}
              accounts={accounts}
              creditCards={creditCards}
              isPrivacyMode={isPrivacyMode}
              analytics={config.personalTransactions === 'supabase' ? pfListAnalytics : undefined}
              pageNumber={pfPageNumber}
              hasNextPage={config.personalTransactions === 'supabase' ? pfHasNextPage : false}
              hasPreviousPage={config.personalTransactions === 'supabase' ? pfPageHistory.length > 1 : false}
              onNextPage={config.personalTransactions === 'supabase' ? handlePfNextPage : undefined}
              onPreviousPage={config.personalTransactions === 'supabase' ? handlePfPreviousPage : undefined}
              onQueryChange={config.personalTransactions === 'supabase' ? handlePfQueryChange : undefined}
              onAddTransaction={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
            />
          )}

          {pfTab === 'accounts' && (
            <PfAccounts
              accounts={accounts}
              transactions={transactions}
              isPrivacyMode={isPrivacyMode}
              onAddAccount={() => setIsAccountModalOpen(true)}
              onOpenTransferModal={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
              onDeleteAccount={handleDeleteAccount}
            />
          )}

          {pfTab === 'cards' && (
            <PfCards
              creditCards={creditCards}
              transactions={transactions}
              isPrivacyMode={isPrivacyMode}
              onAddCard={() => setIsAddCardModalOpen(true)}
              onDeleteCard={handleDeleteCreditCard}
            />
          )}

          {pfTab === 'recurrences' && (
            <PfRecurrences
              recurrences={recurrences}
              isPrivacyMode={isPrivacyMode}
              onAddRecurrence={() => setIsRecurrenceModalOpen(true)}
              onDeleteRecurrence={handleDeleteRecurrence}
            />
          )}

          {pfTab === 'planning' && (
            <PfPlanning
              transactions={transactions}
              budgetItems={budgetItems}
              isPrivacyMode={isPrivacyMode}
              onSaveBudgets={handleSaveBudgets}
              onCopyPreviousMonth={handleCopyPreviousMonthBudgets}
            />
          )}

          {pfTab === 'goals' && (
            <PfGoalsView
              goals={goals}
              isPrivacyMode={isPrivacyMode}
              onAddGoal={() => setIsGoalModalOpen(true)}
              onContributeGoal={handleContributeGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {pfTab === 'reserve' && (
            <PfEmergencyReserveView
              accounts={accounts}
              transactions={transactions}
              reserveAmount={emergencyReserveData.currentAmount}
              monthlyExpenseSetting={emergencyReserveData.monthlyExpenseBasis}
              targetMonthsSetting={emergencyReserveData.targetMonths}
              isPrivacyMode={isPrivacyMode}
              onSaveSettings={handleSaveEmergencyReserve}
              onAddDeposit={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
            />
          )}

          {pfTab === 'debts' && (
            <PfDebtsView
              debts={debts}
              transactions={transactions}
              isPrivacyMode={isPrivacyMode}
              onAddDebt={() => setIsDebtModalOpen(true)}
              onPayInstallment={handlePayDebtInstallment}
              onDeleteDebt={handleDeleteDebt}
            />
          )}

          {pfTab === 'wealth' && (
            <PfWealth
              assets={assets}
              accounts={accounts}
              debts={debts}
              creditCards={creditCards}
              transactions={transactions}
              isPrivacyMode={isPrivacyMode}
              onAddAsset={() => setIsAssetModalOpen(true)}
              onDeleteAsset={handleDeleteAsset}
            />
          )}

          {pfTab === 'investments' && (
            <PfInvestmentsView
              investments={investments}
              isPrivacyMode={isPrivacyMode}
              onAddInvestment={() => setIsInvestmentModalOpen(true)}
              onDeleteInvestment={handleDeleteInvestment}
            />
          )}

          {pfTab === 'tax_planning' && (
            <PfTaxPlanning
              assets={assets}
              transactions={transactions}
              onExportCsv={(filters) => user ? personalTransactionRepository.exportCsv(user.id, filters) : Promise.resolve('')}
              isPrivacyMode={isPrivacyMode}
            />
          )}

          {pfTab === 'reports' && (
              <PfReportsView
                transactions={transactions}
                analytics={config.personalTransactions === 'supabase' ? pfAnalytics : undefined}
              accounts={accounts}
                assets={assets}
                debts={debts}
                isPrivacyMode={isPrivacyMode}
                onExportCsv={(filters) => user ? personalTransactionRepository.exportCsv(user.id, filters) : Promise.resolve('')}
                onNavigateTab={(tab) => setPfTab(tab as PFTab)}
            />
          )}

          {pfTab === 'conciliations' && (
            <PfPjReconciliation
              transactions={transactions}
              onReimburseSocio={handleReimburseSocio}
              isPrivacyMode={isPrivacyMode}
            />
          )}
        </>
      )}

      {/* MODO PESSOA JURÍDICA (PJ) */}
      {mode === 'PJ' && (
        <>
          {pjTab === 'overview' && (
            <ErrorBoundary isAreaBoundary moduleName="pj_overview" fallbackTitle="Falha ao carregar visão geral PJ">
              <PjOverview
                transactions={transactions}
                analytics={config.businessTransactions === 'supabase' ? pjAnalytics : undefined}
                events={events}
                creditCards={creditCards.filter(c => c.context === 'PJ')}
                isPrivacyMode={isPrivacyMode}
                onAddTransaction={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
                onEditTransaction={(t) => { setEditingTransaction(t); setIsTransactionModalOpen(true); }}
                onDeleteTransaction={(id) => {
                  if (!isExplicitDemoMode()) {
                    alert('A exclusão de transações deve ser processada pelo Supabase autenticado.');
                    return;
                  }
                  setTransactions(prev => prev.filter(t => t.id !== id));
                }}
                onAddEvent={() => { if (isExplicitDemoMode()) { setEditingEvent(null); setIsEventModalOpen(true); } else alert('Agenda financeira ainda não possui fonte Supabase ativa.'); }}
                onEditEvent={(e) => { if (isExplicitDemoMode()) { setEditingEvent(e); setIsEventModalOpen(true); } }}
                onDeleteEvent={() => { if (!isExplicitDemoMode()) alert('Agenda financeira ainda não possui fonte Supabase ativa.'); }}
                onActionClickEvent={() => setIsBillingModalOpen(true)}
                onOpenBillingModal={() => setIsBillingModalOpen(true)}
                onNavigateTab={(tab) => setPjTab(tab as PJTab)}
                onAddCard={() => setIsAddCardModalOpen(true)}
              />
            </ErrorBoundary>
          )}

            {pjTab === 'cashflow' && (
              <PjCashflow
                transactions={transactions}
                analytics={config.businessTransactions === 'supabase' ? pjAnalytics : undefined}
                isPrivacyMode={isPrivacyMode}
                onAddTransaction={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
                onOpenTransferModal={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
              />
            )}

            {pjTab === 'receivables_payables' && (
              <PjReceivablesPayables
                customers={customers}
                suppliers={suppliers}
                costCenters={costCenters}
                receivables={receivables}
                payables={payables}
                isPrivacyMode={isPrivacyMode}
              />
            )}

            {pjTab === 'billing' && (
              <PjBillingView
                invoices={invoices}
                isPrivacyMode={isPrivacyMode}
                onAddBilling={() => setIsBillingModalOpen(true)}
              />
            )}

            {pjTab === 'dre' && (
              <PjDreView
                transactions={transactions}
                analytics={config.businessTransactions === 'supabase' ? pjAnalytics : undefined}
                isPrivacyMode={isPrivacyMode}
              />
            )}

            {pjTab === 'breakeven' && (
              <PjBreakEvenView
                analytics={config.businessTransactions === 'supabase' ? pjAnalytics : undefined}
                isPrivacyMode={isPrivacyMode}
              />
            )}

            {pjTab === 'runway' && (
              <PjRunwayView
                accounts={accounts}
                analytics={config.businessTransactions === 'supabase' ? pjAnalytics : undefined}
                isPrivacyMode={isPrivacyMode}
              />
            )}

            {pjTab === 'projects' && (
              <PjProjectsView
                projects={projects}
                customers={customers}
                isPrivacyMode={isPrivacyMode}
                onAddProject={() => setIsProjectModalOpen(true)}
              />
            )}

            {pjTab === 'cost_centers' && (
              <PjCostCentersView
                costCenters={costCenters}
                isPrivacyMode={isPrivacyMode}
              />
            )}

            {pjTab === 'delinquency' && (
              <PjCollections
                defaulters={defaulters}
                isPrivacyMode={isPrivacyMode}
                onOpenBillingModal={() => setIsBillingModalOpen(true)}
              />
            )}

            {pjTab === 'taxes' && (
              <PjTaxControlView
                isPrivacyMode={isPrivacyMode}
              />
            )}

            {pjTab === 'accountant' && (
            <PjAccountantHubView
              transactions={transactions}
              isPrivacyMode={isPrivacyMode}
              onExportCsv={() => activeOrganization ? businessTransactionRepository.exportCsv(activeOrganization.id) : Promise.resolve('')}
              onExportJson={() => activeOrganization ? businessTransactionRepository.exportJson(activeOrganization.id) : Promise.resolve([])}
            />
            )}

            {pjTab === 'documents' && (
              <PjDocumentsView
                isPrivacyMode={isPrivacyMode}
              />
            )}

            {pjTab === 'management' && (
              <PjManagement
                projects={projects}
                customers={customers}
                suppliers={suppliers}
                costCenters={costCenters}
                isPrivacyMode={isPrivacyMode}
                onAddProject={() => setIsProjectModalOpen(true)}
              />
            )}

            {pjTab === 'cards' && (
              <PjCardsView
                creditCards={creditCards.filter(c => c.context === 'PJ')}
                accounts={accounts}
                transactions={transactions}
                isPrivacyMode={isPrivacyMode}
                onAddCard={() => setIsAddCardModalOpen(true)}
                onPayInvoice={(cardId, amount) => {
                  if (!isExplicitDemoMode()) {
                    alert('O pagamento de fatura deve ser persistido pelo Supabase antes de ser habilitado.');
                    return;
                  }
                  const newTx: Transaction = {
                    id: `tx_card_pay_${Date.now()}`,
                    context: 'PJ',
                    type: 'expense',
                    title: `Pagamento Fatura Cartão PJ`,
                    amount,
                    amountCents: Math.round(amount * 100),
                    date: new Date().toISOString().split('T')[0],
                    category: 'software_infra',
                  };
                  setTransactions(prev => [newTx, ...prev]);
                  alert(`Pagamento da fatura de R$ ${amount.toLocaleString('pt-BR')} registrado como saída real no Caixa PJ!`);
                }}
              />
            )}

            {pjTab === 'collections' && (
              <PjCollections
                defaulters={defaulters}
                isPrivacyMode={isPrivacyMode}
                onOpenBillingModal={() => setIsBillingModalOpen(true)}
              />
            )}

            {pjTab === 'accounting' && (
              <PjAccounting
                transactions={transactions}
                analytics={config.businessTransactions === 'supabase' ? pjAnalytics : undefined}
                onExportJson={() => activeOrganization ? businessTransactionRepository.exportJson(activeOrganization.id) : Promise.resolve([])}
                onReimburse={handleReimburseSocio}
              />
            )}

            {pjTab === 'reports' && (
              <PjReports
                transactions={transactions}
                analytics={config.businessTransactions === 'supabase' ? pjAnalytics : undefined}
                accounts={accounts}
                customers={customers}
                suppliers={suppliers}
                projects={projects}
                costCenters={costCenters}
                defaulters={defaulters}
                creditCards={creditCards}
                isPrivacyMode={isPrivacyMode}
                onExportCsv={(filters) => activeOrganization ? businessTransactionRepository.exportCsv(activeOrganization.id, filters) : Promise.resolve('')}
                onNavigateTab={(tab) => setPjTab(tab as PJTab)}
              />
            )}

            {pjTab === 'conciliations' && (
              <PfPjReconciliation
                transactions={transactions}
                onReimburseSocio={handleReimburseSocio}
                isPrivacyMode={isPrivacyMode}
                isPJ
              />
            )}
          </>
      )}

      {/* Modais */}
      {isTransactionModalOpen && (
        <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
          editingTransaction={editingTransaction}
        />
      )}

      {isBillingModalOpen && (
        <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onSave={(data) => {
          if (!isExplicitDemoMode()) {
            alert('Emissão de faturamento deve ser persistida pelo módulo Supabase antes de ser habilitada.');
            return false;
          }
          const newTx: Transaction = {
            id: `pj_bill_${Date.now()}`,
            context: 'PJ',
            type: 'income',
            title: `Fatura: ${data.description}`,
            amount: data.amount,
            amountCents: Math.round(data.amount * 100),
            date: data.dueDate,
            category: 'receita_servico',
          };
          setTransactions(prev => [newTx, ...prev]);
          return true;
          }}
        />
      )}

      {isProjectModalOpen && (
        <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={(data) => {
          if (!isExplicitDemoMode()) {
            alert('Cadastro de projetos deve ser persistido pelo módulo Supabase antes de ser habilitado.');
            return;
          }
          const newProj: Project = {
            id: `proj_${Date.now()}`,
            name: data.name,
            client: data.client,
            revenue: data.revenue,
            cost: data.cost,
            status: 'em_andamento',
            deadline: data.deadline,
          };
          setProjects(prev => [newProj, ...prev]);
          }}
        />
      )}

      {isAssetModalOpen && (
        <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSave={(data) => {
          const newAsset: Asset = {
            id: `ast_${Date.now()}`,
            name: data.name,
            category: data.category,
            value: data.value,
            notes: data.notes,
          };
          setAssets(prev => [newAsset, ...prev]);
          }}
        />
      )}

      {isAddCardModalOpen && (
        <AddCreditCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
          onSave={handleSaveCreditCard}
        />
      )}

      {isEventModalOpen && isExplicitDemoMode() && (
        <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={(data) => {
          const newEv: CalendarEvent = {
            id: `ev_${Date.now()}`,
            title: data.title,
            time: data.time,
            duration: data.duration,
            client: data.client,
            value: data.value,
            type: mode,
            status: 'confirmed',
          };
          setEvents(prev => [newEv, ...prev]);
        }}
          editingEvent={editingEvent}
        />
      )}

      {isGlobalSearchOpen && (
        <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        transactions={transactions}
        projects={projects}
        customers={customers}
        onSelectTransaction={(t) => {
          setMode(t.context);
          setEditingTransaction(t);
          setIsTransactionModalOpen(true);
          }}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
        isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {isLegacyImportModalOpen && (
        <LegacyImportModal
        isOpen={isLegacyImportModalOpen}
        onClose={() => setIsLegacyImportModalOpen(false)}
        onSuccess={() => {
          if (user) {
            const userId = user.id;
            const guard = createScopedRequestGuard(userId);
            personalAccountRepository.list(userId).then(supAccounts => {
              if (guard.isActive(userId) && currentUserIdRef.current === userId) {
                setAccounts(prev => [...supAccounts, ...prev.filter(a => a.context === 'PJ')]);
              }
            });
            personalTransactionRepository.listPage(userId, { pageSize: 50 }).then(page => {
              if (guard.isActive(userId) && currentUserIdRef.current === userId) {
                setTransactions(prev => [...page.rows, ...prev.filter(t => t.context === 'PJ')]);
              }
            });
          }
          }}
        />
      )}

      {isLegacyPjImportModalOpen && (
        <LegacyPjImportModal
        isOpen={isLegacyPjImportModalOpen}
        onClose={() => setIsLegacyPjImportModalOpen(false)}
        onSuccess={() => {
          if (activeOrganization) {
            const organizationId = activeOrganization.id;
            const guard = createScopedRequestGuard(organizationId);
            businessAccountRepository.list(organizationId).then(supAccounts => {
              if (guard.isActive(organizationId) && currentOrganizationIdRef.current === organizationId) {
                setAccounts(prev => [...prev.filter(a => a.context === 'PF'), ...supAccounts]);
              }
            });
            businessTransactionRepository.listPage(organizationId, { pageSize: 50 }).then(page => {
              if (guard.isActive(organizationId) && currentOrganizationIdRef.current === organizationId) {
                setTransactions(prev => [...prev.filter(t => t.context === 'PF'), ...page.rows]);
              }
            });
          }
          }}
        />
      )}

      {isCrossContextModalOpen && (
        <CrossContextModal
        isOpen={isCrossContextModalOpen}
        onClose={() => setIsCrossContextModalOpen(false)}
        pfAccounts={accounts.filter(a => a.context === 'PF')}
        pjAccounts={accounts.filter(a => a.context === 'PJ')}
        onSuccess={() => {
          if (user) {
            const userId = user.id;
            const guard = createScopedRequestGuard(userId);
            personalAccountRepository.list(userId).then(supAccounts => {
              if (guard.isActive(userId) && currentUserIdRef.current === userId) {
                setAccounts(prev => [...supAccounts, ...prev.filter(a => a.context === 'PJ')]);
              }
            });
            personalTransactionRepository.listPage(userId, { pageSize: 50 }).then(page => {
              if (guard.isActive(userId) && currentUserIdRef.current === userId) {
                setTransactions(prev => [...page.rows, ...prev.filter(t => t.context === 'PJ')]);
              }
            });
          }
          if (activeOrganization) {
            const organizationId = activeOrganization.id;
            const guard = createScopedRequestGuard(organizationId);
            businessAccountRepository.list(organizationId).then(supAccounts => {
              if (guard.isActive(organizationId) && currentOrganizationIdRef.current === organizationId) {
                setAccounts(prev => [...prev.filter(a => a.context === 'PF'), ...supAccounts]);
              }
            });
            businessTransactionRepository.listPage(organizationId, { pageSize: 50 }).then(page => {
              if (guard.isActive(organizationId) && currentOrganizationIdRef.current === organizationId) {
                setTransactions(prev => [...prev.filter(t => t.context === 'PF'), ...page.rows]);
              }
            });
          }
          }}
        />
      )}

      {isSecuritySettingsOpen && (
        <SecuritySettingsModal
        isOpen={isSecuritySettingsOpen}
          onClose={() => setIsSecuritySettingsOpen(false)}
        />
      )}

      {isAccountModalOpen && (
        <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
          onSave={handleSaveAccount}
        />
      )}

      {isRecurrenceModalOpen && (
        <RecurrenceModal
        isOpen={isRecurrenceModalOpen}
        onClose={() => setIsRecurrenceModalOpen(false)}
          onSave={handleSaveRecurrence}
        />
      )}

      {isGoalModalOpen && (
        <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
          onSave={handleSaveGoal}
        />
      )}

      {isDebtModalOpen && (
        <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
          onSave={handleSaveDebt}
        />
      )}

      {isInvestmentModalOpen && (
        <InvestmentModal
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
          onSave={handleSaveInvestment}
        />
      )}

    </AuraShell>
  );
}
