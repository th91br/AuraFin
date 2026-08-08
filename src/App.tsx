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
  CostCenter
} from './types';
import { StorageRepository } from './services/storage/storageRepository';

// Component Imports
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RightRail } from './components/RightRail';
import { LandingPage } from './components/LandingPage';

// PF Component Views
import { PfOverview } from './components/PfOverview';
import { PfTransactions } from './components/PfTransactions';
import { PfPlanning } from './components/PfPlanning';
import { PfWealth } from './components/PfWealth';
import { PfTaxPlanning } from './components/PfTaxPlanning';
import { PfReports } from './components/PfReports';

// PJ Component Views
import { PjOverview } from './components/PjOverview';
import { PjCashflow } from './components/PjCashflow';
import { PjReceivablesPayables } from './components/PjReceivablesPayables';
import { PjManagement } from './components/PjManagement';
import { PjCollections } from './components/PjCollections';
import { PjAccounting } from './components/PjAccounting';
import { PjReports } from './components/PjReports';

// Modals & Overlay Utilities
import { TransactionModal } from './components/TransactionModal';
import { BillingModal } from './components/BillingModal';
import { ProjectModal } from './components/ProjectModal';
import { AssetModal } from './components/AssetModal';
import { EventModal } from './components/EventModal';
import { GlobalSearchModal } from './components/ui/GlobalSearchModal';
import { OnboardingModal } from './components/ui/OnboardingModal';

export default function App() {
  // Navigation & Shell States
  const [viewMode, setViewMode] = useState<ViewMode>('app');
  const [mode, setMode] = useState<ContextMode>('PF');
  const [pfTab, setPfTab] = useState<PFTab>('overview');
  const [pjTab, setPjTab] = useState<PJTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightRailOpen, setIsRightRailOpen] = useState(true);

  // Storage Encapsulated States
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => StorageRepository.getPrivacyMode());
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageRepository.getTransactions());
  const [assets, setAssets] = useState<Asset[]>(() => StorageRepository.getAssets());
  const [projects, setProjects] = useState<Project[]>(() => StorageRepository.getProjects());
  const [defaulters, setDefaulters] = useState<Defaulter[]>(() => StorageRepository.getDefaulters());
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => StorageRepository.getBudgetItems());
  const [events, setEvents] = useState<CalendarEvent[]>(() => StorageRepository.getEvents());
  const [accounts, setAccounts] = useState<Account[]>(() => StorageRepository.getAccounts());
  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => StorageRepository.getCreditCards());
  const [goals, setGoals] = useState<Goal[]>(() => StorageRepository.getGoals());
  const [debts, setDebts] = useState<Debt[]>(() => StorageRepository.getDebts());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageRepository.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => StorageRepository.getSuppliers());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => StorageRepository.getCostCenters());

  // Modal States
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Persist State Changes using StorageRepository
  useEffect(() => {
    StorageRepository.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    StorageRepository.saveAssets(assets);
  }, [assets]);

  useEffect(() => {
    StorageRepository.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    StorageRepository.saveDefaulters(defaulters);
  }, [defaulters]);

  useEffect(() => {
    StorageRepository.saveEvents(events);
  }, [events]);

  useEffect(() => {
    StorageRepository.setPrivacyMode(isPrivacyMode);
  }, [isPrivacyMode]);

  // Calculations for Cross-Reimbursements
  const pendingReimbursements = transactions.filter(t => t.context === 'PJ' && t.isPaidByPF && !t.reimbursed);
  const pendingReimbursementAmount = pendingReimbursements.reduce((acc, t) => acc + t.amount, 0);

  // Motor PF <-> PJ: Reembolsar Sócio em 1 clique
  const handleReimburseSocio = () => {
    if (pendingReimbursementAmount <= 0) {
      alert('Nenhum valor pendente de reembolso ao sócio.');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const crossId = `reimburse_${Date.now()}`;

    // Lançamento Saída PJ
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

    // Lançamento Entrada PF
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

    // Atualiza transações marcando-as como reembolsadas
    const updated = transactions.map(t => {
      if (t.context === 'PJ' && t.isPaidByPF && !t.reimbursed) {
        return { ...t, reimbursed: true };
      }
      return t;
    });

    setTransactions([...updated, pjOffset, pfOffset]);
    alert(`Reembolso de R$ ${pendingReimbursementAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} realizado com sucesso em 1 clique!`);
  };

  // Restauração de dados de demonstração
  const handleResetDemo = () => {
    if (window.confirm('Deseja restaurar os dados originais de demonstração do AuraFin?')) {
      StorageRepository.resetToDemo();
      setTransactions(StorageRepository.getTransactions());
      setAssets(StorageRepository.getAssets());
      setProjects(StorageRepository.getProjects());
      setDefaulters(StorageRepository.getDefaulters());
      setBudgetItems(StorageRepository.getBudgetItems());
      setEvents(StorageRepository.getEvents());
      setAccounts(StorageRepository.getAccounts());
      setCreditCards(StorageRepository.getCreditCards());
      setGoals(StorageRepository.getGoals());
      setDebts(StorageRepository.getDebts());
      setCustomers(StorageRepository.getCustomers());
      setSuppliers(StorageRepository.getSuppliers());
      setCostCenters(StorageRepository.getCostCenters());
      setIsPrivacyMode(false);
      alert('Dados de demonstração restaurados!');
    }
  };

  // Handlers para Transação
  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...txData } as Transaction : t));
      setEditingTransaction(null);
    } else {
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        context: txData.context || mode,
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

      // Se for despesa pessoal paga na conta PJ, cria o espelho automático na PF
      if (newTx.context === 'PJ' && newTx.isPersonalExpenseInPJ) {
        const mirrorPf: Transaction = {
          id: `tx_pf_mirror_${Date.now()}`,
          context: 'PF',
          type: 'income',
          title: `Retirada / Pró-labore: ${newTx.title}`,
          amount: newTx.amount,
          amountCents: newTx.amountCents,
          date: newTx.date,
          category: 'salario_prolabore',
          crossContextId: newTx.id,
        };
        setTransactions(prev => [newTx, mirrorPf, ...prev]);
      } else {
        setTransactions(prev => [newTx, ...prev]);
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Handlers de Faturamento e Demais Modais
  const handleSaveBilling = (data: { client: string; amount: number; description: string; dueDate: string }) => {
    const newTx: Transaction = {
      id: `pj_bill_${Date.now()}`,
      context: 'PJ',
      type: 'income',
      title: `Fatura: ${data.description}`,
      amount: data.amount,
      amountCents: Math.round(data.amount * 100),
      date: data.dueDate,
      category: 'receita_servico',
      subCategory: 'Faturamento Pix',
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleSaveProject = (data: { name: string; client: string; revenue: number; cost: number; deadline: string }) => {
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
  };

  const handleSaveAsset = (data: { name: string; category: any; value: number; notes: string }) => {
    const newAsset: Asset = {
      id: `ast_${Date.now()}`,
      name: data.name,
      category: data.category,
      value: data.value,
      notes: data.notes,
    };
    setAssets(prev => [newAsset, ...prev]);
  };

  const handleSaveEvent = (data: { title: string; time: string; duration: string; client?: string; value?: number }) => {
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
  };

  // Se estiver visualizando a Landing Page Institucional
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
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${
      mode === 'PJ' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Sidebar Lateral Retrátil (Logo sempre visível) */}
      <Sidebar
        mode={mode}
        pfTab={pfTab}
        setPfTab={setPfTab}
        pjTab={pjTab}
        setPjTab={setPjTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        pendingReimbursementAmount={pendingReimbursementAmount}
        defaultersCount={defaulters.length}
        onOpenTransactionModal={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
        onOpenBillingModal={() => setIsBillingModalOpen(true)}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Superior Principal */}
        <Header
          mode={mode}
          setMode={setMode}
          viewMode={viewMode}
          setViewMode={setViewMode}
          pendingReimbursementAmount={pendingReimbursementAmount}
          onResetDemo={handleResetDemo}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isRightRailOpen={isRightRailOpen}
          setIsRightRailOpen={setIsRightRailOpen}
          isPrivacyMode={isPrivacyMode}
          setIsPrivacyMode={setIsPrivacyMode}
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
        />

        {/* Dynamic Page Viewer Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* MODO PESSOA FÍSICA (PF) */}
          {mode === 'PF' && (
            <>
              {pfTab === 'overview' && (
                <PfOverview
                  transactions={transactions}
                  events={events}
                  assets={assets}
                  onAddTransaction={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
                  onAddAsset={() => setIsAssetModalOpen(true)}
                  onEditTransaction={(t) => { setEditingTransaction(t); setIsTransactionModalOpen(true); }}
                  onDeleteTransaction={handleDeleteTransaction}
                  onAddEvent={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
                  onEditEvent={(e) => { setEditingEvent(e); setIsEventModalOpen(true); }}
                  onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))}
                  onActionClickEvent={() => {}}
                />
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

              {pfTab === 'planning' && (
                <PfPlanning
                  transactions={transactions}
                  budgetItems={budgetItems}
                  goals={goals}
                  debts={debts}
                  isPrivacyMode={isPrivacyMode}
                  onAddTransaction={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
                />
              )}

              {pfTab === 'wealth' && (
                <PfWealth
                  assets={assets}
                  transactions={transactions}
                  onAddAsset={() => setIsAssetModalOpen(true)}
                />
              )}

              {pfTab === 'tax_planning' && (
                <PfTaxPlanning
                  assets={assets}
                  transactions={transactions}
                />
              )}

              {pfTab === 'reports' && (
                <PfReports
                  transactions={transactions}
                  assets={assets}
                  isPrivacyMode={isPrivacyMode}
                />
              )}
            </>
          )}

          {/* MODO PESSOA JURÍDICA (PJ) */}
          {mode === 'PJ' && (
            <>
              {pjTab === 'overview' && (
                <PjOverview
                  transactions={transactions}
                  events={events}
                  onAddTransaction={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
                  onEditTransaction={(t) => { setEditingTransaction(t); setIsTransactionModalOpen(true); }}
                  onDeleteTransaction={handleDeleteTransaction}
                  onAddEvent={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
                  onEditEvent={(e) => { setEditingEvent(e); setIsEventModalOpen(true); }}
                  onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))}
                  onActionClickEvent={() => setIsBillingModalOpen(true)}
                  onOpenBillingModal={() => setIsBillingModalOpen(true)}
                />
              )}

              {pjTab === 'cashflow' && (
                <PjCashflow
                  transactions={transactions}
                  isPrivacyMode={isPrivacyMode}
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
                  isPrivacyMode={isPrivacyMode}
                />
              )}
            </>
          )}

        </main>
      </div>

      {/* Right Rail Contextual Panel */}
      {isRightRailOpen && (
        <RightRail
          mode={mode}
          transactions={transactions}
          assets={assets}
          defaulters={defaulters}
          pendingReimbursementAmount={pendingReimbursementAmount}
          onOpenTransactionModal={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
          onOpenBillingModal={() => setIsBillingModalOpen(true)}
          onReimburseSocio={handleReimburseSocio}
        />
      )}

      {/* Modais da Aplicação */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onSave={handleSaveBilling}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
      />

      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSave={handleSaveAsset}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
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

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onFinish={(selectedMode) => {
          setMode(selectedMode);
          setIsOnboardingOpen(false);
        }}
      />

    </div>
  );
}
