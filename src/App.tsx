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
import { PfWealth } from './components/PfWealth';
import { PfTaxPlanning } from './components/PfTaxPlanning';

// PJ Component Views
import { PjOverview } from './components/PjOverview';
import { PjCashflow } from './components/PjCashflow';
import { PjReceivablesPayables } from './components/PjReceivablesPayables';
import { PjManagement } from './components/PjManagement';
import { PjCollections } from './components/PjCollections';
import { PjAccounting } from './components/PjAccounting';
import { PjReports } from './components/PjReports';

// Modals
import { TransactionModal } from './components/TransactionModal';
import { BillingModal } from './components/BillingModal';
import { ProjectModal } from './components/ProjectModal';
import { AssetModal } from './components/AssetModal';
import { EventModal } from './components/EventModal';
import { AddCreditCardModal } from './components/AddCreditCardModal';
import { GlobalSearchModal } from './components/ui/GlobalSearchModal';

export default function App() {
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
  const [goals, setGoals] = useState<Goal[]>(() => StorageRepository.getGoals());
  const [debts, setDebts] = useState<Debt[]>(() => StorageRepository.getDebts());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageRepository.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => StorageRepository.getSuppliers());
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => StorageRepository.getCostCenters());

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Persistence Effects
  useEffect(() => { StorageRepository.saveTransactions(transactions); }, [transactions]);
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

  const handleSaveCreditCard = (cardData: Partial<CreditCard>) => {
    const newCard: CreditCard = {
      id: cardData.id || `card_${Date.now()}`,
      name: cardData.name || 'Novo Cartão',
      institution: cardData.institution || 'Banco',
      limitTotal: cardData.limitTotal || 10000,
      limitUsed: 0,
      currentInvoice: 0,
      closingDay: cardData.closingDay || 20,
      dueDay: cardData.dueDay || 28,
      context: 'PF',
    };
    setCreditCards(prev => [...prev, newCard]);
  };

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
      rightRailContent={
        <RightRail
          mode={mode}
          transactions={transactions}
          assets={assets}
          defaulters={defaulters}
          pendingReimbursementAmount={pendingReimbursementAmount}
          onOpenTransactionModal={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
          onOpenBillingModal={() => setIsBillingModalOpen(true)}
          onReimburseSocio={handleReimburseSocio}
          isPrivacyMode={isPrivacyMode}
        />
      }
    >
      {/* MODO PESSOA FÍSICA (PF) */}
      {mode === 'PF' && (
        <>
          {pfTab === 'overview' && (
            <PfOverview
              transactions={transactions}
              events={events}
              assets={assets}
              budgetItems={budgetItems}
              goals={goals}
              creditCards={creditCards}
              isPrivacyMode={isPrivacyMode}
              onAddTransaction={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
              onAddAsset={() => setIsAssetModalOpen(true)}
              onEditTransaction={(t) => { setEditingTransaction(t); setIsTransactionModalOpen(true); }}
              onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))}
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

          {pfTab === 'accounts' && (
            <PfAccounts
              accounts={accounts}
              transactions={transactions}
              isPrivacyMode={isPrivacyMode}
              onAddAccount={() => alert('Formulário de nova conta')}
              onOpenTransferModal={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
            />
          )}

          {pfTab === 'cards' && (
            <PfCards
              creditCards={creditCards}
              transactions={transactions}
              isPrivacyMode={isPrivacyMode}
              onAddCard={() => setIsAddCardModalOpen(true)}
            />
          )}

          {pfTab === 'recurrences' && (
            <PfRecurrences
              isPrivacyMode={isPrivacyMode}
              onAddRecurrence={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
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
            <PjOverview
              transactions={transactions}
              events={events}
              onAddTransaction={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }}
              onEditTransaction={(t) => { setEditingTransaction(t); setIsTransactionModalOpen(true); }}
              onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))}
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

    </AuraShell>
  );
}
