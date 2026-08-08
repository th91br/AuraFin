import { Transaction, CalendarEvent, Asset } from '../types';
import { FinancialSummary } from './FinancialSummary';
import { IntegratedCalendar } from './IntegratedCalendar';

interface Props {
  transactions: Transaction[];
  events: CalendarEvent[];
  assets: Asset[];
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
  onAddTransaction,
  onAddAsset,
  onEditTransaction,
  onDeleteTransaction,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onActionClickEvent,
}: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Intro Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Olá, Thiago. Sua vida financeira em paz.
        </h1>
        <p className="text-slate-500 mt-1 text-lg">
          Acompanhe seu saldo disponível, compromissos pessoais e evolução patrimonial de forma clara.
        </p>
      </div>

      {/* Grid Layout: Financial Summary & Integrated Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6">
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

        <div className="lg:col-span-6">
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
