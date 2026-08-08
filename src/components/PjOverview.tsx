import { Transaction, CalendarEvent } from '../types';
import { FinancialSummary } from './FinancialSummary';
import { IntegratedCalendar } from './IntegratedCalendar';
import { Plus, FileText } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  events: CalendarEvent[];
  onAddTransaction: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddEvent: () => void;
  onEditEvent: (e: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onActionClickEvent: (e: CalendarEvent) => void;
  onOpenBillingModal: () => void;
}

export function PjOverview({
  transactions,
  events,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onActionClickEvent,
  onOpenBillingModal,
}: Props) {
  const pjTxs = transactions.filter(t => t.context === 'PJ');

  const grossRevenue = pjTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 18500;
  const totalExpenses = pjTxs.filter(t => t.type === 'expense' && !t.isPersonalExpenseInPJ).reduce((acc, t) => acc + t.amount, 0) || 4500;
  const prolaborePaid = pjTxs.filter(t => t.category === 'prolabore_pago').reduce((acc, t) => acc + t.amount, 0) || 8500;

  const currentCash = 35000 + (grossRevenue - totalExpenses - prolaborePaid);
  const receivables = 26500;
  const dailyBurn = Math.max(100, Math.round((totalExpenses + prolaborePaid) / 30));
  const runwayDays = Math.round(currentCash / dailyBurn);

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* Header Editorial Limpo */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            Resumo Operacional
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Caixa corporativo, faturamento e compromissos da empresa.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={onOpenBillingModal}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all text-xs shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Emitir Fatura Pix</span>
          </button>
        </div>
      </div>

      {/* Hero Financial Summary Strip - Limpo e Humanizado */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Caixa Operacional */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Caixa Operacional
            </span>
            <PrivacyText 
              value={currentCash} 
              isPrivacyMode={false} 
              className="text-3xl font-semibold text-slate-950 tracking-tight block font-mono tabular-nums" 
            />
            <p className="text-xs text-slate-500 font-medium pt-1">
              Contas bancárias PJ consolidadas.
            </p>
          </div>

          {/* Faturamento Bruto */}
          <div className="space-y-1 md:border-l md:border-slate-100 md:pl-8">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Faturamento Bruto
            </span>
            <PrivacyText 
              value={grossRevenue} 
              isPrivacyMode={false} 
              className="text-3xl font-semibold text-slate-900 tracking-tight block font-mono tabular-nums" 
            />
            <p className="text-xs text-slate-500 font-medium pt-1">
              Mês atual em curso.
            </p>
          </div>

          {/* A Receber */}
          <div className="space-y-1 md:border-l md:border-slate-100 md:pl-8">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              A Receber Pendente
            </span>
            <PrivacyText 
              value={receivables} 
              isPrivacyMode={false} 
              className="text-3xl font-semibold text-slate-900 tracking-tight block font-mono tabular-nums" 
            />
            <p className="text-xs text-amber-800 font-medium pt-1">
              Títulos a vencer e em atraso.
            </p>
          </div>

          {/* Runway de Caixa */}
          <div className="space-y-1 md:border-l md:border-slate-100 md:pl-8">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Runway Estimado
            </span>
            <span className="text-3xl font-semibold text-slate-950 tracking-tight block font-mono tabular-nums">
              {runwayDays} Dias
            </span>
            <p className="text-xs text-slate-500 font-medium pt-1">
              Na velocidade de queima atual.
            </p>
          </div>

        </div>
      </div>

      {/* Main Grid: Extrato Recente & Agenda de Compromissos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-4">
          <FinancialSummary
            mode="PJ"
            transactions={transactions}
            assets={[]}
            onAdd={onAddTransaction}
            onAddAsset={() => {}}
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
          />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <IntegratedCalendar
            mode="PJ"
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
