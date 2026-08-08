import { Transaction, CalendarEvent } from '../types';
import { FinancialSummary } from './FinancialSummary';
import { IntegratedCalendar } from './IntegratedCalendar';
import { Building2, TrendingUp, AlertCircle, ArrowUpRight, DollarSign, Clock, FileText, Plus, ShieldCheck } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';
import { HelpTooltip } from './ui/HelpTooltip';

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
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-slate-900 text-white rounded">
              Modo PJ — Operação Empresa
            </span>
            <span className="text-xs text-slate-500 font-medium">Caixa Corporativo & DRE</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-1.5">
            Visão Geral Executiva
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Acompanhe o faturamento, controle de caixa, recebíveis e saúde financeira da sua empresa.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onOpenBillingModal}
            className="flex items-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Emitir Fatura / Pix PJ</span>
          </button>
        </div>
      </div>

      {/* Hero Card do Caixa Operacional */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-md border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Caixa Operacional Disponível nas Contas PJ</span>
              <HelpTooltip term="Caixa Operacional" explanation="Saldo total disponível em bancos da empresa descontando faturas a pagar já compromissadas no período." />
            </div>

            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight font-mono">
              R$ {currentCash.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Sua empresa possui <strong className="text-white font-mono">{runwayDays} dias de Runway</strong> garantidos com o caixa atual na velocidade de queima operacional diária (R$ {dailyBurn}/dia).
            </p>
          </div>

          <div className="md:col-span-4 bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-3 font-mono">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-semibold font-sans">Faturamento Bruto:</span>
              <span className="font-bold text-emerald-400">R$ {grossRevenue.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-semibold font-sans">A Receber Pendente:</span>
              <span className="font-bold text-amber-400">R$ {receivables.toLocaleString('pt-BR')}</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs text-slate-300">
              <span className="font-semibold font-sans">Pró-labore do Sócio:</span>
              <span className="font-bold text-white">R$ {prolaborePaid.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloco "Atenção Operacional Hoje" */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-700" />
          <h2 className="text-base font-bold text-slate-900">Atenção Operacional Hoje</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">2 Títulos em Atraso</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">R$ 7.300 pendentes de recebimento (Alfa Serviços e Studio Beta).</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">DRE Gerencial Emitido</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">Resultado operacional positivo com margem líquida de 32%.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-lg shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Aporte a Reembolsar</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">1 despesa de servidor paga no cartão PF aguardando acerto.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: DRE & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6">
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
