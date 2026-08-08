import { Transaction, CalendarEvent } from '../types';
import { FinancialSummary } from './FinancialSummary';
import { IntegratedCalendar } from './IntegratedCalendar';
import { FileText } from 'lucide-react';

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
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Executive Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded">
              Visão Gerencial Executiva
            </span>
            <span className="text-xs text-slate-400">Ambiente Seguro PJ</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-2">
            Painel da Operação Corporativa
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Controle de caixa, faturamento e previsibilidade operacional para escalar seu negócio com segurança.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onOpenBillingModal}
            className="flex items-center space-x-2 px-5 py-3 bg-slate-100 hover:bg-white text-slate-950 font-extrabold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
          >
            <FileText className="w-4 h-4 text-slate-700" />
            <span>Emitir Nova Fatura / Pix</span>
          </button>
        </div>
      </div>

      {/* Grid: Financial Summary & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6">
          <FinancialSummary
            mode="PJ"
            transactions={transactions}
            onAdd={onAddTransaction}
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
          />
        </div>

        <div className="lg:col-span-6">
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
