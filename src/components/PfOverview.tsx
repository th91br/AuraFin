import { Transaction, CalendarEvent, Asset, BudgetItem } from '../types';
import { FinancialSummary } from './FinancialSummary';
import { IntegratedCalendar } from './IntegratedCalendar';
import { Plus } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  events: CalendarEvent[];
  assets: Asset[];
  budgetItems?: BudgetItem[];
  isPrivacyMode?: boolean;
  onAddTransaction: () => void;
  onAddAsset: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddEvent: () => void;
  onEditEvent: (e: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onActionClickEvent: (e: CalendarEvent) => void;
}

export function PfOverview({
  transactions,
  events,
  assets,
  isPrivacyMode = false,
  onAddTransaction,
  onAddAsset,
  onEditTransaction,
  onDeleteTransaction,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onActionClickEvent,
}: Props) {
  const pfTxs = transactions.filter(t => t.context === 'PF');

  const baseBalance = 7052.45;
  const currentBalance = pfTxs.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), baseBalance);
  
  const totalAssetsValue = assets.reduce((acc, a) => acc + a.value, 0);
  const investedAmount = assets.filter(a => a.category === 'renda_fixa' || a.category === 'acoes').reduce((acc, a) => acc + a.value, 0);

  const fixedBillsReserved = 3420;
  const safeSpendLimit = Math.max(0, currentBalance - fixedBillsReserved);

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* Header Editorial Limpo */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            Visão Geral Financeira
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Resumo de caixa disponível, compromissos pessoais e extrato recente.
          </p>
        </div>

        <button
          onClick={onAddTransaction}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all text-xs shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Hero Financial Summary Strip - Limpo e Humanizado */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Stat: Limite Livre */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saldo Livre para Gastos
            </span>
            <PrivacyText 
              value={safeSpendLimit} 
              isPrivacyMode={isPrivacyMode} 
              className="text-4xl font-semibold text-slate-950 tracking-tight block font-mono tabular-nums" 
            />
            <p className="text-xs text-slate-500 font-medium pt-1">
              Após provisão de R$ {fixedBillsReserved.toLocaleString('pt-BR')} para despesas do mês.
            </p>
          </div>

          {/* Secondary Stat: Saldo em Conta */}
          <div className="space-y-1 md:border-l md:border-slate-100 md:pl-8">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saldo Total em Conta
            </span>
            <PrivacyText 
              value={currentBalance} 
              isPrivacyMode={isPrivacyMode} 
              className="text-3xl font-semibold text-slate-900 tracking-tight block font-mono tabular-nums" 
            />
            <p className="text-xs text-slate-500 font-medium pt-1">
              Contas bancárias consolidadas.
            </p>
          </div>

          {/* Third Stat: Investimentos & Reserva */}
          <div className="space-y-1 md:border-l md:border-slate-100 md:pl-8">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Guardado / Investimentos
            </span>
            <PrivacyText 
              value={investedAmount} 
              isPrivacyMode={isPrivacyMode} 
              className="text-3xl font-semibold text-slate-900 tracking-tight block font-mono tabular-nums" 
            />
            <p className="text-xs text-emerald-700 font-medium pt-1">
              Renda Fixa & Reserva de Emergência.
            </p>
          </div>

        </div>
      </div>

      {/* Main Grid: Extrato Recente & Agenda de Compromissos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-4">
          <FinancialSummary
            mode="PF"
            transactions={transactions}
            assets={assets}
            onAdd={onAddTransaction}
            onAddAsset={onAddAsset}
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
          />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <IntegratedCalendar
            mode="PF"
            events={events}
            onActionClick={onActionClickEvent}
            onAdd={onAddEvent}
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
          />
        </div>
      </div>

    </div>
  );
}
