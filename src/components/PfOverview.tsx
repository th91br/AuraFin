import { Transaction, CalendarEvent, Asset, BudgetItem } from '../types';
import { FinancialSummary } from './FinancialSummary';
import { IntegratedCalendar } from './IntegratedCalendar';
import { Sparkles, AlertTriangle, ShieldCheck, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Clock, Plus, Landmark } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';
import { HelpTooltip } from './ui/HelpTooltip';

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
  budgetItems = [],
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

  // Provisão de contas fixas do mês (exemplo: R$ 3.420)
  const fixedBillsReserved = 3420;
  const safeSpendLimit = Math.max(0, currentBalance - fixedBillsReserved);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner & Action Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200/80 rounded">
              Vida Financeira Pessoal
            </span>
            <span className="text-xs text-slate-500 font-medium">Ambiente Sereno & Seguro</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-1.5">
            Olá, Thiago. Sua vida financeira sob controle.
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Acompanhe seu saldo disponível, compromissos pessoais e metas de vida de forma humana e descomplicada.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onAddTransaction}
            className="flex items-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento PF</span>
          </button>
        </div>
      </div>

      {/* Hero Card: Disponibilidade Real de Gastos */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Quanto você pode gastar sem preocupação este mês</span>
              <HelpTooltip term="Limite Seguro de Gastos" explanation="Calculado subtraindo do seu saldo atual as provisões de contas fixas e faturas que vencem até o final do mês." />
            </div>

            <PrivacyText value={safeSpendLimit} isPrivacyMode={isPrivacyMode} className="text-4xl md:text-5xl font-black text-white tracking-tight" />

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Seu saldo total é R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Reservamos R$ {fixedBillsReserved.toLocaleString('pt-BR')} para contas fixas e faturas deste mês.
            </p>
          </div>

          <div className="md:col-span-4 bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-semibold">Patrimônio Total:</span>
              <PrivacyText value={currentBalance + totalAssetsValue} isPrivacyMode={isPrivacyMode} className="font-bold text-white" />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-semibold">Guardado / Investido:</span>
              <PrivacyText value={investedAmount} isPrivacyMode={isPrivacyMode} className="font-bold text-emerald-400" />
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs text-slate-300">
              <span className="font-semibold">Reserva Emergência:</span>
              <span className="font-bold text-emerald-400">95% Concluída</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bloco "Atenção Necessária" */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">Precisando da sua atenção hoje</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Orçamento Alimentação</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">Você utilizou 92% do teto mensal planejado para Mercado & Restaurantes.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-lg shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Fatura do Cartão</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">Sua fatura do cartão fecha em 3 dias (Previsão: R$ 1.420,50).</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Comprovante IRPF</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">Recibo do curso de especialização anexado e marcado como dedutível.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Financial Summary (Extrato) & Calendar */}
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
