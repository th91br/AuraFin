import { useState, useEffect } from 'react';
import { ContextMode, ViewMode, PFTab, PJTab, CalendarEvent, Transaction, Asset, Project, Defaulter, BudgetItem } from './types';
import { 
  pfEvents as initialPfEvents, 
  pjEvents as initialPjEvents, 
  initialTransactions, 
  initialAssets, 
  initialProjects, 
  initialDefaulters, 
  initialBudgetItems 
} from './data';

import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { RightRail } from './components/RightRail';

import { PfOverview } from './components/PfOverview';
import { PfBudget } from './components/PfBudget';
import { PfWealth } from './components/PfWealth';
import { PfTaxPlanning } from './components/PfTaxPlanning';

import { PjOverview } from './components/PjOverview';
import { PjDreCashflow } from './components/PjDreCashflow';
import { PjProjects } from './components/PjProjects';
import { PjDefaulters } from './components/PjDefaulters';
import { PjAccounting } from './components/PjAccounting';

import { BillingModal } from './components/BillingModal';
import { TransactionModal } from './components/TransactionModal';
import { EventModal } from './components/EventModal';
import { AssetModal } from './components/AssetModal';
import { ProjectModal } from './components/ProjectModal';

const LOCAL_STORAGE_KEYS = {
  VIEW_MODE: 'aurafin_view_mode_v3',
  TRANSACTIONS: 'aurafin_transactions_v3',
  EVENTS: 'aurafin_events_v3',
  ASSETS: 'aurafin_assets_v3',
  PROJECTS: 'aurafin_projects_v3',
  DEFAULTERS: 'aurafin_defaulters_v3',
  BUDGET_ITEMS: 'aurafin_budget_items_v3',
  MODE: 'aurafin_mode_v3',
  PF_TAB: 'aurafin_pf_tab_v3',
  PJ_TAB: 'aurafin_pj_tab_v3',
  SIDEBAR_COLLAPSED: 'aurafin_sidebar_collapsed_v3',
  RIGHT_RAIL_OPEN: 'aurafin_right_rail_open_v3',
};

export default function App() {
  // View & Mode state
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.VIEW_MODE);
      return (saved as ViewMode) || 'app';
    } catch {
      return 'app';
    }
  });

  const [mode, setMode] = useState<ContextMode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.MODE);
      return saved === 'PJ' || saved === 'PF' ? saved : 'PF';
    } catch {
      return 'PF';
    }
  });

  const [pfTab, setPfTab] = useState<PFTab>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PF_TAB);
      return (saved as PFTab) || 'overview';
    } catch {
      return 'overview';
    }
  });

  const [pjTab, setPjTab] = useState<PJTab>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PJ_TAB);
      return (saved as PJTab) || 'overview';
    } catch {
      return 'overview';
    }
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isRightRailOpen, setIsRightRailOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.RIGHT_RAIL_OPEN);
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : [...initialPfEvents, ...initialPjEvents];
    } catch {
      return [...initialPfEvents, ...initialPjEvents];
    }
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ASSETS);
      return saved ? JSON.parse(saved) : initialAssets;
    } catch {
      return initialAssets;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  const [defaulters, setDefaulters] = useState<Defaulter[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.DEFAULTERS);
      return saved ? JSON.parse(saved) : initialDefaulters;
    } catch {
      return initialDefaulters;
    }
  });

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BUDGET_ITEMS);
      return saved ? JSON.parse(saved) : initialBudgetItems;
    } catch {
      return initialBudgetItems;
    }
  });

  // Modals state
  const [selectedBillingEvent, setSelectedBillingEvent] = useState<CalendarEvent | null>(null);
  const [isBillingModalOpen, setBillingModalOpen] = useState(false);
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isAssetModalOpen, setAssetModalOpen] = useState(false);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VIEW_MODE, viewMode);
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(LOCAL_STORAGE_KEYS.EVENTS, JSON.stringify(events));
      localStorage.setItem(LOCAL_STORAGE_KEYS.ASSETS, JSON.stringify(assets));
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      localStorage.setItem(LOCAL_STORAGE_KEYS.DEFAULTERS, JSON.stringify(defaulters));
      localStorage.setItem(LOCAL_STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify(budgetItems));
      localStorage.setItem(LOCAL_STORAGE_KEYS.MODE, mode);
      localStorage.setItem(LOCAL_STORAGE_KEYS.PF_TAB, pfTab);
      localStorage.setItem(LOCAL_STORAGE_KEYS.PJ_TAB, pjTab);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(isSidebarCollapsed));
      localStorage.setItem(LOCAL_STORAGE_KEYS.RIGHT_RAIL_OPEN, JSON.stringify(isRightRailOpen));
    } catch (err) {
      console.error('Erro ao persistir dados no LocalStorage:', err);
    }
  }, [viewMode, transactions, events, assets, projects, defaulters, budgetItems, mode, pfTab, pjTab, isSidebarCollapsed, isRightRailOpen]);

  // Handlers
  const handleResetDemoData = () => {
    if (window.confirm('Deseja restaurar os dados originais de demonstração? Suas alterações serão redefinidas.')) {
      setTransactions(initialTransactions);
      setEvents([...initialPfEvents, ...initialPjEvents]);
      setAssets(initialAssets);
      setProjects(initialProjects);
      setDefaulters(initialDefaulters);
      setBudgetItems(initialBudgetItems);
      setMode('PF');
      setPfTab('overview');
      setPjTab('overview');
    }
  };

  const handleSaveTransaction = (data: Omit<Transaction, 'id' | 'context' | 'date'>) => {
    const now = Date.now();

    if (editingTransaction) {
      const updatedTxs = transactions.map((t) => {
        if (t.id === editingTransaction.id) {
          return { ...t, ...data, timestamp: t.timestamp || now };
        }
        if (editingTransaction.linkedTransactionId && t.id === editingTransaction.linkedTransactionId) {
          let updatedTitle = t.title;
          if (data.isPersonalExpenseInPJ) {
            updatedTitle = `Pró-labore: ${data.title}`;
          } else if (data.isPaidByPF) {
            updatedTitle = `Empréstimo p/ Empresa: ${data.title}`;
          }
          return { ...t, title: updatedTitle, amount: data.amount };
        }
        return t;
      });
      setTransactions(updatedTxs);
    } else {
      const txId = now.toString();
      const linkedId = (now + 1).toString();
      let linkedTx: Transaction | null = null;

      if (mode === 'PJ' && data.type === 'expense') {
        if (data.isPersonalExpenseInPJ) {
          linkedTx = {
            id: linkedId,
            title: `Pró-labore: ${data.title}`,
            amount: data.amount,
            type: 'income',
            date: 'Agora mesmo',
            context: 'PF',
            category: 'salario_prolabore',
            linkedTransactionId: txId,
            timestamp: now,
          };
        } else if (data.isPaidByPF) {
          linkedTx = {
            id: linkedId,
            title: `Aporte p/ Empresa: ${data.title}`,
            amount: data.amount,
            type: 'expense',
            date: 'Agora mesmo',
            context: 'PF',
            category: 'outros',
            linkedTransactionId: txId,
            timestamp: now,
          };
        }
      }

      const newTx: Transaction = {
        id: txId,
        ...data,
        context: mode,
        date: 'Agora mesmo',
        linkedTransactionId: linkedTx ? linkedId : undefined,
        timestamp: now,
      };

      setTransactions(linkedTx ? [newTx, linkedTx, ...transactions] : [newTx, ...transactions]);
    }

    setTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleReimburse = () => {
    const pending = transactions.filter((t) => t.context === 'PJ' && t.isPaidByPF && !t.reimbursed);
    if (pending.length === 0) return;

    const total = pending.reduce((acc, t) => acc + t.amount, 0);
    const time = Date.now();
    const pjTxId = time.toString();
    const pfTxId = (time + 1).toString();

    const updatedTxs = transactions.map((t) => {
      if (t.context === 'PJ' && t.isPaidByPF && !t.reimbursed) {
        return { ...t, reimbursed: true };
      }
      return t;
    });

    const newPjTx: Transaction = {
      id: pjTxId,
      title: 'Reembolso Oficial ao Sócio',
      amount: total,
      type: 'expense',
      context: 'PJ',
      category: 'equipe_terceiros',
      date: 'Agora mesmo',
      linkedTransactionId: pfTxId,
      timestamp: time,
    };

    const newPfTx: Transaction = {
      id: pfTxId,
      title: 'Reembolso Recebido da Empresa (PJ)',
      amount: total,
      type: 'income',
      context: 'PF',
      category: 'salario_prolabore',
      date: 'Agora mesmo',
      linkedTransactionId: pjTxId,
      timestamp: time,
    };

    setTransactions([newPjTx, newPfTx, ...updatedTxs]);
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    if (target.linkedTransactionId) {
      setTransactions(transactions.filter((t) => t.id !== id && t.id !== target.linkedTransactionId));
    } else {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const handleSaveEvent = (data: Omit<CalendarEvent, 'id' | 'type' | 'status'>) => {
    const now = Date.now();
    if (editingEvent) {
      setEvents(events.map((e) => (e.id === editingEvent.id ? { ...e, ...data } : e)));
    } else {
      setEvents([
        {
          id: now.toString(),
          ...data,
          type: mode,
          status: 'scheduled',
          timestamp: now,
        } as CalendarEvent,
        ...events,
      ]);
    }
    setEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleSaveAsset = (data: Omit<Asset, 'id'>) => {
    setAssets([{ id: Date.now().toString(), ...data }, ...assets]);
    setAssetModalOpen(false);
  };

  const handleSaveProject = (data: Omit<Project, 'id'>) => {
    setProjects([{ id: Date.now().toString(), ...data }, ...projects]);
    setProjectModalOpen(false);
  };

  const pendingReimbursements = transactions.filter((t) => t.context === 'PJ' && t.isPaidByPF && !t.reimbursed);
  const pendingReimbursementAmount = pendingReimbursements.reduce((acc, t) => acc + t.amount, 0);

  // If in Landing Page mode, render Landing Page component
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

  // App Shell Layout
  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-500 selection:bg-cyan-200 selection:text-slate-900 ${
      mode === 'PJ' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Collapsible Left Sidebar */}
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
        onOpenTransactionModal={() => {
          setEditingTransaction(null);
          setTransactionModalOpen(true);
        }}
        onOpenBillingModal={() => setBillingModalOpen(true)}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          mode={mode}
          setMode={setMode}
          viewMode={viewMode}
          setViewMode={setViewMode}
          pendingReimbursementAmount={pendingReimbursementAmount}
          onResetDemo={handleResetDemoData}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isRightRailOpen={isRightRailOpen}
          setIsRightRailOpen={setIsRightRailOpen}
        />

        {/* Content View Body & Optional Right Rail */}
        <div className="flex-1 flex min-w-0">
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 min-w-0">
            {mode === 'PF' ? (
              <>
                {pfTab === 'overview' && (
                  <PfOverview
                    transactions={transactions}
                    events={events}
                    assets={assets}
                    onAddTransaction={() => {
                      setEditingTransaction(null);
                      setTransactionModalOpen(true);
                    }}
                    onAddAsset={() => setAssetModalOpen(true)}
                    onEditTransaction={(t) => {
                      setEditingTransaction(t);
                      setTransactionModalOpen(true);
                    }}
                    onDeleteTransaction={handleDeleteTransaction}
                    onAddEvent={() => {
                      setEditingEvent(null);
                      setEventModalOpen(true);
                    }}
                    onEditEvent={(e) => {
                      setEditingEvent(e);
                      setEventModalOpen(true);
                    }}
                    onDeleteEvent={handleDeleteEvent}
                    onActionClickEvent={setSelectedBillingEvent}
                  />
                )}

                {pfTab === 'budget' && (
                  <PfBudget
                    transactions={transactions}
                    budgetItems={budgetItems}
                    onAddTransaction={() => {
                      setEditingTransaction(null);
                      setTransactionModalOpen(true);
                    }}
                  />
                )}

                {pfTab === 'wealth' && (
                  <PfWealth
                    assets={assets}
                    transactions={transactions}
                    onAddAsset={() => setAssetModalOpen(true)}
                  />
                )}

                {pfTab === 'tax_planning' && (
                  <PfTaxPlanning
                    assets={assets}
                    transactions={transactions}
                  />
                )}
              </>
            ) : (
              <>
                {pjTab === 'overview' && (
                  <PjOverview
                    transactions={transactions}
                    events={events}
                    onAddTransaction={() => {
                      setEditingTransaction(null);
                      setTransactionModalOpen(true);
                    }}
                    onEditTransaction={(t) => {
                      setEditingTransaction(t);
                      setTransactionModalOpen(true);
                    }}
                    onDeleteTransaction={handleDeleteTransaction}
                    onAddEvent={() => {
                      setEditingEvent(null);
                      setEventModalOpen(true);
                    }}
                    onEditEvent={(e) => {
                      setEditingEvent(e);
                      setEventModalOpen(true);
                    }}
                    onDeleteEvent={handleDeleteEvent}
                    onActionClickEvent={setSelectedBillingEvent}
                    onOpenBillingModal={() => setBillingModalOpen(true)}
                  />
                )}

                {pjTab === 'dre_cashflow' && (
                  <PjDreCashflow transactions={transactions} />
                )}

                {pjTab === 'projects' && (
                  <PjProjects
                    projects={projects}
                    onAddProject={() => setProjectModalOpen(true)}
                  />
                )}

                {pjTab === 'defaulters' && (
                  <PjDefaulters defaulters={defaulters} />
                )}

                {pjTab === 'accounting' && (
                  <PjAccounting
                    transactions={transactions}
                    onReimburse={handleReimburse}
                  />
                )}
              </>
            )}
          </main>

          {/* Contextual Right Rail (Inspirado no Cashtracker / Banksy) */}
          {isRightRailOpen && (
            <RightRail
              mode={mode}
              transactions={transactions}
              assets={assets}
              defaulters={defaulters}
              pendingReimbursementAmount={pendingReimbursementAmount}
              onOpenTransactionModal={() => {
                setEditingTransaction(null);
                setTransactionModalOpen(true);
              }}
              onOpenBillingModal={() => setBillingModalOpen(true)}
              onReimburseSocio={handleReimburse}
            />
          )}
        </div>
      </div>

      {/* Global Modals */}
      {(selectedBillingEvent || isBillingModalOpen) && (
        <BillingModal
          event={selectedBillingEvent || {
            id: 'billing_demo',
            title: 'Fatura de Serviço Consultoria',
            time: '14:00',
            duration: '1h',
            type: 'PJ',
            value: 4500,
            status: 'action_required',
            client: 'TechFlow Ltda'
          }}
          onClose={() => {
            setSelectedBillingEvent(null);
            setBillingModalOpen(false);
          }}
        />
      )}

      {isTransactionModalOpen && (
        <TransactionModal
          mode={mode}
          transaction={editingTransaction}
          onClose={() => {
            setTransactionModalOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
        />
      )}

      {isEventModalOpen && (
        <EventModal
          mode={mode}
          event={editingEvent}
          onClose={() => {
            setEventModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
        />
      )}

      {isAssetModalOpen && (
        <AssetModal onClose={() => setAssetModalOpen(false)} onSave={handleSaveAsset} />
      )}

      {isProjectModalOpen && (
        <ProjectModal onClose={() => setProjectModalOpen(false)} onSave={handleSaveProject} />
      )}
    </div>
  );
}
