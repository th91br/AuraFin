import { useState } from 'react';
import { ContextMode, CalendarEvent, Transaction, Asset } from './types';
import { pfEvents as initialPfEvents, pjEvents as initialPjEvents, initialTransactions } from './data';
import { Header } from './components/Header';
import { FinancialSummary } from './components/FinancialSummary';
import { IntegratedCalendar } from './components/IntegratedCalendar';
import { BillingModal } from './components/BillingModal';
import { TransactionModal } from './components/TransactionModal';
import { EventModal } from './components/EventModal';
import { AssetModal } from './components/AssetModal';

import { PfPlanning } from './components/PfPlanning';

import { PjPlanning } from './components/PjPlanning';

export default function App() {
  const [mode, setMode] = useState<ContextMode>('PF'); // Back to PF for this view
  const [selectedBillingEvent, setSelectedBillingEvent] = useState<CalendarEvent | null>(null);

  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [events, setEvents] = useState<CalendarEvent[]>([...initialPfEvents, ...initialPjEvents]);
  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', name: 'Reserva de Emergência', category: 'renda_fixa', value: 15000 },
    { id: '2', name: 'Carro', category: 'veiculo', value: 45000 }
  ]);

  // Modals state
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isAssetModalOpen, setAssetModalOpen] = useState(false);

  // Handlers: Transactions
  const handleSaveTransaction = (data: Omit<Transaction, 'id' | 'context' | 'date'>) => {
    const newTx: Transaction = {
      id: Date.now().toString(),
      ...data,
      context: mode,
      date: 'Agora mesmo'
    };

    let additionalTxs: Transaction[] = [];

    if (mode === 'PJ' && data.type === 'expense') {
      if (data.isPersonalExpenseInPJ) {
        additionalTxs.push({
          id: (Date.now() + 1).toString(),
          title: `Pró-labore: ${data.title}`,
          amount: data.amount,
          type: 'income',
          date: 'Agora mesmo',
          context: 'PF'
        });
      } else if (data.isPaidByPF) {
        additionalTxs.push({
          id: (Date.now() + 1).toString(),
          title: `Empréstimo p/ Empresa: ${data.title}`,
          amount: data.amount,
          type: 'expense',
          date: 'Agora mesmo',
          context: 'PF'
        });
      }
    }

    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...t, ...data } : t));
    } else {
      setTransactions([newTx, ...additionalTxs, ...transactions]);
    }
    setTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleReimburse = () => {
    const pending = transactions.filter(t => t.context === 'PJ' && t.isPaidByPF && !t.reimbursed);
    if (pending.length === 0) return;

    const total = pending.reduce((acc, t) => acc + t.amount, 0);
    const time = Date.now();

    const updatedTxs = transactions.map(t => {
      if (t.context === 'PJ' && t.isPaidByPF && !t.reimbursed) {
        return { ...t, reimbursed: true };
      }
      return t;
    });

    const newPjTx: Transaction = {
      id: time.toString(),
      title: 'Reembolso ao Sócio',
      amount: total,
      type: 'expense',
      context: 'PJ',
      date: 'Agora mesmo'
    };
    
    const newPfTx: Transaction = {
      id: (time + 1).toString(),
      title: 'Reembolso da Empresa',
      amount: total,
      type: 'income',
      context: 'PF',
      date: 'Agora mesmo'
    };

    setTransactions([newPjTx, newPfTx, ...updatedTxs]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Handlers: Events
  const handleSaveEvent = (data: Omit<CalendarEvent, 'id' | 'type' | 'status'>) => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...data } : e));
    } else {
      setEvents([{
        id: Date.now().toString(),
        ...data,
        type: mode,
        status: 'scheduled'
      } as CalendarEvent, ...events]);
    }
    setEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleSaveAsset = (data: Omit<Asset, 'id'>) => {
    setAssets([{
      id: Date.now().toString(),
      ...data
    }, ...assets]);
    setAssetModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      <Header mode={mode} setMode={setMode} />

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {mode === 'PJ' ? 'Dashboard Gerencial.' : 'Bom dia, Thiago.'}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {mode === 'PJ' ? 'Operações em andamento e caixa atualizado. Pronto para escalar.' : 'Seu dinheiro organizado para você viver o presente e planejar o futuro.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <FinancialSummary 
              mode={mode} 
              transactions={transactions}
              assets={assets}
              onAdd={() => { setEditingTransaction(null); setTransactionModalOpen(true); }}
              onAddAsset={() => setAssetModalOpen(true)}
              onEdit={(t) => { setEditingTransaction(t); setTransactionModalOpen(true); }}
              onDelete={handleDeleteTransaction}
            />
          </div>

          <div className="lg:col-span-7">
            <IntegratedCalendar 
              mode={mode} 
              events={events}
              onActionClick={setSelectedBillingEvent}
              onAdd={() => { setEditingEvent(null); setEventModalOpen(true); }}
              onEdit={(e) => { setEditingEvent(e); setEventModalOpen(true); }}
              onDelete={handleDeleteEvent}
            />
          </div>
        </div>

        {mode === 'PF' && (
          <PfPlanning assets={assets} transactions={transactions} />
        )}
        {mode === 'PJ' && (
          <PjPlanning transactions={transactions} onReimburse={handleReimburse} />
        )}
      </main>

      {selectedBillingEvent && (
        <BillingModal event={selectedBillingEvent} onClose={() => setSelectedBillingEvent(null)} />
      )}

      {isTransactionModalOpen && (
        <TransactionModal 
          mode={mode}
          transaction={editingTransaction} 
          onClose={() => { setTransactionModalOpen(false); setEditingTransaction(null); }} 
          onSave={handleSaveTransaction} 
        />
      )}

      {isEventModalOpen && (
        <EventModal 
          mode={mode}
          event={editingEvent} 
          onClose={() => { setEventModalOpen(false); setEditingEvent(null); }} 
          onSave={handleSaveEvent} 
        />
      )}

      {isAssetModalOpen && (
        <AssetModal
          onClose={() => setAssetModalOpen(false)}
          onSave={handleSaveAsset}
        />
      )}
    </div>
  );
}
