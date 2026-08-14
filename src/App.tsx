import { useState, useEffect } from 'react';
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
  RecurrenceItem
} from './types';
import { StorageRepository } from './services/storage/storageRepository';

// Shell & Landing
import { AuraShell } from './components/aura/AuraShell';
import { RightRail } from './components/RightRail';
import { LandingPage } from './components/LandingPage';
import { PfPjReconciliation } from './components/PfPjReconciliation';

// PF Component Views
import { PfOverview } from './components/PfOverview';
import { PfTransactions } from './components/PfTransactions';
import { PfAccounts } from './components/PfAccounts';
import { PfCards } from './components/PfCards';
import { PfRecurrences } from './components/PfRecurrences';
import { PfPlanning } from './components/PfPlanning';
import { PfGoalsView } from './components/PfGoalsView';
import { PfEmergencyReserveView } from './components/PfEmergencyReserveView';
import { PfDebtsView } from './components/PfDebtsView';
import { PfWealth } from './components/PfWealth';
import { PfInvestmentsView } from './components/PfInvestmentsView';
import { PfPrivacyShieldView } from './components/aura/PfPrivacyShieldView';
import { PjPrivacyShieldView } from './components/aura/PjPrivacyShieldView';
import { PfTaxPlanning } from './components/PfTaxPlanning';
import { PfReportsView } from './components/PfReportsView';

// PJ Component Views (Bloco 1, Bloco 2 & Bloco 4)
import { PjOverview } from './components/PjOverview';
import { PjCashflow } from './components/PjCashflow';
import { PjReceivablesPayables } from './components/PjReceivablesPayables';
import { PjBillingView } from './components/PjBillingView';
import { PjDreView } from './components/PjDreView';
import { PjBreakEvenView } from './components/PjBreakEvenView';
import { PjRunwayView } from './components/PjRunwayView';
import { PjProjectsView } from './components/PjProjectsView';
import { PjCostCentersView } from './components/PjCostCentersView';
import { PjTaxControlView } from './components/PjTaxControlView';
import { PjCollections } from './components/PjCollections';
import { PjAccountantHubView } from './components/PjAccountantHubView';
import { PjDocumentsView } from './components/PjDocumentsView';
import { PjManagement } from './components/PjManagement';
import { PjCardsView } from './components/PjCardsView';
import { PjAccounting } from './components/PjAccounting';
import { PjReports } from './components/PjReports';

// Modals
import { TransactionModal } from './components/TransactionModal';
import { BillingModal } from './components/BillingModal';
import { ProjectModal } from './components/ProjectModal';
import { AssetModal } from './components/AssetModal';
import { EventModal } from './components/EventModal';
import { AddCreditCardModal } from './components/AddCreditCardModal';
import { AccountModal } from './components/aura/AccountModal';
import { RecurrenceModal } from './components/aura/RecurrenceModal';
import { GoalModal } from './components/aura/GoalModal';
import { DebtModal } from './components/aura/DebtModal';
import { InvestmentModal } from './components/aura/InvestmentModal';
import { GlobalSearchModal } from './components/ui/GlobalSearchModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrganizationProvider, useOrganization } from './context/OrganizationContext';
import { RepositoryProvider, useRepositories } from './context/RepositoryContext';
import { AuthModal } from './components/auth/AuthModal';
import { AuthLayout } from './components/auth/AuthLayout';
import { SecuritySettingsModal } from './components/auth/SecuritySettingsModal';
import { LegacyImportModal } from './components/auth/LegacyImportModal';
import { LegacyPjImportModal } from './components/auth/LegacyPjImportModal';
import { CrossContextModal } from './components/aura/CrossContextModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuraLogger } from './lib/logger';
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

export default function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <RepositoryProvider>
          <AppContent />
        </RepositoryProvider>
      </OrganizationProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { activeOrganization } = useOrganization();
  const { 
    config, 
    personalAccountRepository, 
    personalTransactionRepository, 
    businessAccountRepository, 
    businessTransactionRepository 
  } = useRepositories();

  const [viewMode, setViewMode] = useState<ViewMode>('app');
  const [mode, setMode] = useState<ContextMode>('PF');
  const [pfTab, setPfTab] = useState<PFTab>('overview');
  const [pjTab, setPjTab] = useState<PJTab>('overview');

  // Encapsulated Storage State
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => StorageRepository.getPrivacyMode());
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageRepository.getTransactions());
  const [assets, setAssets] = useState<Asset[]>(() => StorageRepository.getAssets());
  const [projects, setProjects] = useState<Project[]>(() => StorageRepository.getProjects());
  const [defaulters, setDefaulters] = useState<Defaulter[]>(() => StorageRepository.getDefaulters());
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => StorageRepository.getBudgetItems());
  const [events, setEvents] = useState<CalendarEvent[]>(() => StorageRepository.getEvents());
  const [accounts, setAccounts] = useState<Account[]>(() => StorageRepository.getAccounts());
  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => StorageRepository.getCreditCards());
  const [recurrences, setRecurrences] = useState<RecurrenceItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>(() => StorageRepository.getGoals());
  const [debts, setDebts] = useState<Debt[]>(() => StorageRepository.getDebts());
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [emergencyReserveData, setEmergencyReserveData] = useState<{ currentAmount: number; targetMonths: number; monthlyExpenseBasis: number }>({
    currentAmount: 0,
    targetMonths: 6,
    monthlyExpenseBasis: 0
  });
  const [customers, setCustomers] = useState<Customer[]>(() => StorageRepository.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => StorageRepository.getSuppliers());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => StorageRepository.getCostCenters());

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
    }
  }, [isAuthenticated]);

  // Legacy PF Import Assistant Check (disabled by default in Production)
  useEffect(() => {
    const isLegacyImportEnabled = (import.meta as any).env?.VITE_ENABLE_LEGACY_IMPORT === 'true';
    if (isLegacyImportEnabled && isAuthenticated && user) {
      LegacyImportService.previewImport(user.id).then(res => {
        if (res.hasLegacyData && !res.alreadyImported) {
          setIsLegacyImportModalOpen(true);
        }
      }).catch(e => AuraLogger.warn('[App] Erro ao checar legado PF', { module: 'legacy_import', error: e?.message }));
    }
  }, [isAuthenticated, user]);

  // Legacy PJ Import Assistant Check (disabled by default in Production)
  useEffect(() => {
    const isLegacyImportEnabled = (import.meta as any).env?.VITE_ENABLE_LEGACY_IMPORT === 'true';
    if (isLegacyImportEnabled && isAuthenticated && activeOrganization) {
      LegacyPjImportService.previewImport(activeOrganization.id).then(res => {
        if (res.hasLegacyData && !res.alreadyImported) {
          setIsLegacyPjImportModalOpen(true);
        }
      }).catch(e => AuraLogger.warn('[App] Erro ao checar legado PJ', { module: 'legacy_import_pj', error: e?.message }));
    }
  }, [isAuthenticated, activeOrganization]);

  // Sincronização completa de todos os módulos PF com Supabase
  useEffect(() => {
    if (isAuthenticated && user) {
      // 1. Contas PF
      personalAccountRepository.list(user.id).then(supAccounts => {
        setAccounts(prev => [...supAccounts, ...prev.filter(a => a.context === 'PJ')]);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar contas PF', { error: err?.message }));

      // 2. Transações PF
      personalTransactionRepository.list(user.id).then(supTxs => {
        setTransactions(prev => [...supTxs, ...prev.filter(t => t.context === 'PJ')]);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar transações PF', { error: err?.message }));

      // 3. Cartões PF
      supabaseCreditCardRepo.list(user.id).then(supCards => {
        setCreditCards(prev => [...supCards, ...prev.filter(c => c.context === 'PJ')]);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar cartões PF', { error: err?.message }));

      // 4. Recorrências PF
      supabaseRecurrenceRepo.list(user.id).then(supRecs => {
        setRecurrences(supRecs);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar recorrências PF', { error: err?.message }));

      // 5. Orçamentos PF
      const currentMonth = new Date().toISOString().slice(0, 7);
      supabaseBudgetRepo.list(user.id, currentMonth).then(supBudgets => {
        setBudgetItems(supBudgets);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar orçamentos PF', { error: err?.message }));

      // 6. Metas PF
      supabaseGoalRepo.list(user.id).then(supGoals => {
        setGoals(supGoals);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar metas PF', { error: err?.message }));

      // 7. Reserva de Emergência PF
      supabaseEmergencyReserveRepo.get(user.id).then(resData => {
        setEmergencyReserveData(resData);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar reserva PF', { error: err?.message }));

      // 8. Dívidas PF
      supabaseDebtRepo.list(user.id).then(supDebts => {
        setDebts(supDebts);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar dívidas PF', { error: err?.message }));

      // 9. Bens & Patrimônio PF
      supabaseAssetRepo.list(user.id).then(supAssets => {
        setAssets(supAssets);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar bens PF', { error: err?.message }));

      // 10. Investimentos PF
      supabaseInvestmentRepo.list(user.id).then(supInvs => {
        setInvestments(supInvs);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar investimentos PF', { error: err?.message }));
    }
  }, [isAuthenticated, user, personalAccountRepository, personalTransactionRepository]);

  // Synchronize PJ Accounts & Transactions when module is in Supabase mode
  useEffect(() => {
    if (config.businessAccounts === 'supabase' && activeOrganization) {
      businessAccountRepository.list(activeOrganization.id).then(supAccounts => {
        setAccounts(prev => [...prev.filter(a => a.context === 'PF'), ...supAccounts]);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar contas PJ do Supabase', { module: 'accounts_pj', error: err?.message }));
    }
  }, [config.businessAccounts, activeOrganization, businessAccountRepository]);

  useEffect(() => {
    if (config.businessTransactions === 'supabase' && activeOrganization) {
      businessTransactionRepository.list(activeOrganization.id).then(supTxs => {
        setTransactions(prev => [...prev.filter(t => t.context === 'PF'), ...supTxs]);
      }).catch(err => AuraLogger.error('[App] Erro ao carregar transações PJ do Supabase', { module: 'transactions_pj', error: err?.message }));
    }
  }, [config.businessTransactions, activeOrganization, businessTransactionRepository]);

  // Persistence Effects for local modules
  useEffect(() => { 
    if (config.personalTransactions === 'local' || config.businessTransactions === 'local') {
      StorageRepository.saveTransactions(transactions); 
    }
  }, [transactions, config.personalTransactions, config.businessTransactions]);
  useEffect(() => { StorageRepository.saveAssets(assets); }, [assets]);
  useEffect(() => { StorageRepository.saveProjects(projects); }, [projects]);
  useEffect(() => { StorageRepository.saveDefaulters(defaulters); }, [defaulters]);
  useEffect(() => { StorageRepository.setPrivacyMode(isPrivacyMode); }, [isPrivacyMode]);

  // Calculations for Cross-Reimbursements
  const pendingReimbursements = transactions.filter(t => t.context === 'PJ' && t.isPaidByPF && !t.reimbursed);
  const pendingReimbursementAmount = pendingReimbursements.reduce((acc, t) => acc + t.amount, 0);

  // Reembolsar Sócio em 1-clique
  const handleReimburseSocio = () => {
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
    if (window.confirm('Deseja restaurar os dados originais de demonstração do AuraFin?')) {
      StorageRepository.resetToDemo();
      setTransactions(StorageRepository.getTransactions());
      setAssets(StorageRepository.getAssets());
      setProjects(StorageRepository.getProjects());
      setDefaulters(StorageRepository.getDefaulters());
      setIsPrivacyMode(false);
      alert('Dados restaurados com sucesso!');
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
      const newAcc: Account = {
        id: `acc_${Date.now()}`,
        name: accData.name || 'Nova Conta',
        institution: accData.institution || 'Banco',
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
    }
    setAccounts(prev => prev.filter(a => a.id !== accId));
  };

  const handleSaveCreditCard = async (cardData: Partial<CreditCard>) => {
    if (user) {
      const saved = await supabaseCreditCardRepo.create(cardData, user.id);
      if (saved) {
        setCreditCards(prev => [...prev.filter(c => c.id !== saved.id), saved]);
      }
    } else {
      const newCard: CreditCard = {
        id: cardData.id || `card_${Date.now()}`,
        name: cardData.name || 'Novo Cartão',
        institution: cardData.institution || 'Banco',
        type: cardData.type || 'credito',
        brand: cardData.brand || 'Mastercard',
        lastFourDigits: cardData.lastFourDigits || '4554',
        limitTotal: cardData.limitTotal || 0,
        limitUsed: 0,
        currentInvoice: 0,
        closingDay: cardData.closingDay || 15,
        dueDay: cardData.dueDay || 25,
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
      const newGoal: Goal = {
        id: `goal_${Date.now()}`,
        title: goalData.title || 'Nova Meta',
        targetAmount: goalData.targetAmount || 1000,
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
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g));
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (user) {
      await supabaseGoalRepo.delete(goalId, user.id);
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
      const newDebt: Debt = {
        id: `debt_${Date.now()}`,
        title: debtData.title || 'Nova Dívida',
        totalBalance: debtData.totalBalance || 0,
        monthlyPayment: debtData.monthlyPayment || 0,
        remainingInstallments: debtData.remainingInstallments || 1,
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
    }
    setInvestments(prev => prev.filter(i => i.id !== invId));
  };

  if (!isAuthenticated && !isAuthLoading && viewMode !== 'landing') {
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
      onResetDemo={handleResetDemo}
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
              isPrivacyMode={isPrivacyMode}
            />
          )}

          {pfTab === 'reports' && (
            <PfReportsView
              transactions={transactions}
              accounts={accounts}
              assets={assets}
              debts={debts}
              isPrivacyMode={isPrivacyMode}
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
                events={events}
                creditCards={creditCards.filter(c => c.context === 'PJ')}
                isPrivacyMode={isPrivacyMode}
                onAddTransaction={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
                onEditTransaction={(t) => { setEditingTransaction(t); setIsTransactionModalOpen(true); }}
                onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))}
                onAddEvent={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
                onEditEvent={(e) => { setEditingEvent(e); setIsEventModalOpen(true); }}
                onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))}
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
                isPrivacyMode={isPrivacyMode}
              />
            )}

            {pjTab === 'billing' && (
              <PjBillingView
                isPrivacyMode={isPrivacyMode}
                onAddBilling={() => setIsBillingModalOpen(true)}
              />
            )}

            {pjTab === 'dre' && (
              <PjDreView
                transactions={transactions}
                isPrivacyMode={isPrivacyMode}
              />
            )}

            {pjTab === 'breakeven' && (
              <PjBreakEvenView
                isPrivacyMode={isPrivacyMode}
              />
            )}

            {pjTab === 'runway' && (
              <PjRunwayView
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
                onReimburse={handleReimburseSocio}
              />
            )}

            {pjTab === 'reports' && (
              <PjReports
                transactions={transactions}
                accounts={accounts}
                customers={customers}
                suppliers={suppliers}
                projects={projects}
                costCenters={costCenters}
                defaulters={defaulters}
                creditCards={creditCards}
                isPrivacyMode={isPrivacyMode}
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
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onSave={(data) => {
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
        }}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={(data) => {
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

      <AddCreditCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onSave={handleSaveCreditCard}
      />

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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <LegacyImportModal
        isOpen={isLegacyImportModalOpen}
        onClose={() => setIsLegacyImportModalOpen(false)}
        onSuccess={() => {
          if (user) {
            personalAccountRepository.list(user.id).then(supAccounts => setAccounts(prev => [...supAccounts, ...prev.filter(a => a.context === 'PJ')]));
            personalTransactionRepository.list(user.id).then(supTxs => setTransactions(prev => [...supTxs, ...prev.filter(t => t.context === 'PJ')]));
          }
        }}
      />

      <LegacyPjImportModal
        isOpen={isLegacyPjImportModalOpen}
        onClose={() => setIsLegacyPjImportModalOpen(false)}
        onSuccess={() => {
          if (activeOrganization) {
            businessAccountRepository.list(activeOrganization.id).then(supAccounts => setAccounts(prev => [...prev.filter(a => a.context === 'PF'), ...supAccounts]));
            businessTransactionRepository.list(activeOrganization.id).then(supTxs => setTransactions(prev => [...prev.filter(t => t.context === 'PF'), ...supTxs]));
          }
        }}
      />

      <CrossContextModal
        isOpen={isCrossContextModalOpen}
        onClose={() => setIsCrossContextModalOpen(false)}
        pfAccounts={accounts.filter(a => a.context === 'PF')}
        pjAccounts={accounts.filter(a => a.context === 'PJ')}
        onSuccess={() => {
          if (user) {
            personalAccountRepository.list(user.id).then(supAccounts => setAccounts(prev => [...supAccounts, ...prev.filter(a => a.context === 'PJ')]));
            personalTransactionRepository.list(user.id).then(supTxs => setTransactions(prev => [...supTxs, ...prev.filter(t => t.context === 'PJ')]));
          }
          if (activeOrganization) {
            businessAccountRepository.list(activeOrganization.id).then(supAccounts => setAccounts(prev => [...prev.filter(a => a.context === 'PF'), ...supAccounts]));
            businessTransactionRepository.list(activeOrganization.id).then(supTxs => setTransactions(prev => [...prev.filter(t => t.context === 'PF'), ...supTxs]));
          }
        }}
      />

      <SecuritySettingsModal
        isOpen={isSecuritySettingsOpen}
        onClose={() => setIsSecuritySettingsOpen(false)}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
      />

      <RecurrenceModal
        isOpen={isRecurrenceModalOpen}
        onClose={() => setIsRecurrenceModalOpen(false)}
        onSave={handleSaveRecurrence}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
      />

      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
        onSave={handleSaveDebt}
      />

      <InvestmentModal
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
        onSave={handleSaveInvestment}
      />

    </AuraShell>
  );
}

