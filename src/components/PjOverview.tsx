import { useMemo } from 'react';
import { Transaction, CalendarEvent, CreditCard, TransactionAnalytics } from '../types';
import { MetricCard, DonutChartCard, ActivityRow, VisualPaymentCard } from './aura/AuraCards';
import { Plus, FileText, CreditCard as CreditCardIcon } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  events: CalendarEvent[];
  creditCards?: CreditCard[];
  analytics?: TransactionAnalytics;
  isPrivacyMode?: boolean;
  onAddTransaction: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddEvent: () => void;
  onEditEvent: (e: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onActionClickEvent: (e: CalendarEvent) => void;
  onOpenBillingModal: () => void;
  onNavigateTab?: (tab: string) => void;
  onAddCard?: () => void;
}

const reais = (cents: number | undefined) => Number(cents || 0) / 100;
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PjOverview({
  transactions,
  creditCards = [],
  analytics,
  isPrivacyMode = false,
  onAddTransaction,
  onOpenBillingModal,
  onNavigateTab,
  onAddCard,
}: Props) {
  const pjTxs = transactions.filter((transaction) => transaction.context === 'PJ');
  const hasData = Boolean(analytics?.transaction_count || pjTxs.length || creditCards.length);

  const totals = useMemo(() => {
    if (analytics) {
      return {
        receipts: reais(analytics.total_receipts_cents),
        expenses: reais(analytics.operating_expenses_cents ?? analytics.total_expenses_cents),
        balance: reais(analytics.balance_cents),
        prolabore: reais(analytics.prolabore_cents),
      };
    }
    const receipts = pjTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = pjTxs.filter((t) => t.type === 'expense' && !t.isPersonalExpenseInPJ).reduce((sum, t) => sum + t.amount, 0);
    const balance = receipts - expenses;
    return { receipts, expenses, balance, prolabore: pjTxs.filter((t) => t.category === 'prolabore_pago' || t.category === 'pro_labore').reduce((sum, t) => sum + t.amount, 0) };
  }, [analytics, pjTxs]);

  const categories = useMemo(() => {
    if (analytics?.by_category?.length) {
      return analytics.by_category
        .filter((item) => item.expenses_cents > 0)
        .map((item, index) => ({ label: item.category, amount: reais(item.expenses_cents), color: ['#0891B2', '#4338CA', '#10B981', '#F43F5E', '#F59E0B'][index % 5] }));
    }
    const grouped = new Map<string, number>();
    pjTxs.filter((t) => t.type === 'expense').forEach((t) => grouped.set(t.category, (grouped.get(t.category) || 0) + t.amount));
    return Array.from(grouped, ([label, amount], index) => ({ label, amount, color: ['#0891B2', '#4338CA', '#10B981', '#F43F5E', '#F59E0B'][index % 5] }));
  }, [analytics, pjTxs]);

  const activeCard = creditCards[0];
  const availableLimit = activeCard ? Math.max(0, activeCard.limitTotal - activeCard.limitUsed) : 0;
  const usedPercentage = activeCard?.limitTotal ? Math.min(100, Math.round((activeCard.limitUsed / activeCard.limitTotal) * 100)) : 0;
  const cashFlow = analytics?.cash_flow || [];
  const maxCashFlow = Math.max(0, ...cashFlow.flatMap((item) => [item.receipts_cents, item.expenses_cents]));

  if (!hasData) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center gap-4 text-center text-slate-300 bg-slate-900/60 p-12 rounded-2xl border border-dashed border-white/10">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Painel Executivo da Empresa</h1>
        <p className="text-sm text-slate-300 max-w-md">Nenhuma movimentação ou conta registrada para esta organização ainda. Comece emitindo uma fatura ou cadastrando sua primeira movimentação.</p>
        <button onClick={onAddTransaction} className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-xs">Cadastrar primeira movimentação</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Painel Executivo da Empresa</h1>
          <p className="text-xs text-slate-300 mt-0.5">Visão consolidada de caixa, faturamento e cartões corporativos.</p>
        </div>
        <button onClick={onOpenBillingModal} className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs"><FileText className="w-4 h-4" /><span>Emitir fatura</span></button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Receitas" value={totals.receipts} isPrivacyMode={isPrivacyMode} isPJ subtitle="Faturamento registrado" />
        <MetricCard title="Despesas" value={totals.expenses} isPrivacyMode={isPrivacyMode} isPJ subtitle="Saídas operacionais" />
        <MetricCard title="Saldo de Caixa" value={totals.balance} isPrivacyMode={isPrivacyMode} isPJ subtitle="Resultado do período" />
        <MetricCard title="Margem Operacional" value={totals.receipts > 0 ? Math.round((totals.balance / totals.receipts) * 100) : 0} isPrivacyMode={isPrivacyMode} isPJ prefix="" subtitle="Calculada sobre receitas" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          {categories.length ? (
            <DonutChartCard
              title="Despesas por categoria"
              subtitle="Agregado no Supabase"
              spent={totals.expenses}
              target={totals.expenses}
              categories={categories}
              isPJ
              isPrivacyMode={isPrivacyMode}
            />
          ) : (
            <DataUnavailable title="Despesas por categoria" />
          )}

          <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">Cartões corporativos</h3>
              <button
                onClick={onAddCard}
                className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {activeCard ? (
              <div className="space-y-3">
                <VisualPaymentCard
                  cardName={activeCard.name}
                  cardNumberMasked={`•••• •••• •••• ${activeCard.lastFourDigits || '—'}`}
                  balance={activeCard.currentInvoice}
                  dueDate={activeCard.dueDay ? String(activeCard.dueDay) : '—'}
                  brand={activeCard.brand}
                  isPJ
                />
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Limite disponível</span>
                  <strong className="text-white font-mono">{money(availableLimit)}</strong>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${usedPercentage}%` }}
                  />
                </div>
                <button
                  onClick={() => onNavigateTab?.('cards')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
                >
                  Ver cartões cadastrados
                </button>
              </div>
            ) : (
              <DataUnavailable title="Cartões corporativos" action={onAddCard} actionLabel="Adicionar cartão" />
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {cashFlow.length ? (
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="font-bold text-sm text-white">Fluxo de caixa</h3>
              {cashFlow.slice(-6).map((item) => (
                <div key={item.period} className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{item.period}</span>
                    <PrivacyText value={reais(item.balance_cents)} isPrivacyMode={isPrivacyMode} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className="h-2 bg-emerald-500/80 rounded"
                      style={{
                        width: `${maxCashFlow ? Math.max(2, (item.receipts_cents / maxCashFlow) * 100) : 0}%`,
                      }}
                    />
                    <div
                      className="h-2 bg-rose-500/80 rounded"
                      style={{
                        width: `${maxCashFlow ? Math.max(2, (item.expenses_cents / maxCashFlow) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataUnavailable title="Fluxo de caixa" />
          )}

          <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/10">
            <h3 className="font-bold text-sm mb-4 text-white">Pró-labore registrado</h3>
            <PrivacyText value={totals.prolabore} isPrivacyMode={isPrivacyMode} />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-white">Movimentações recentes</h3>
          <button onClick={() => onNavigateTab?.('cashflow')} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold">
            Ver todas
          </button>
        </div>
        {pjTxs.length ? (
          pjTxs.slice(0, 6).map((tx) => (
            <ActivityRow
              key={tx.id}
              title={tx.title}
              subtitle={`${tx.date} • ${tx.category}`}
              amount={tx.amount}
              isIncome={tx.type === 'income'}
              isPJ
              isPrivacyMode={isPrivacyMode}
            />
          ))
        ) : (
          <p className="text-sm text-slate-300">Nenhum dado disponível</p>
        )}
      </div>
    </div>
  );
}

function DataUnavailable({ title, action, actionLabel }: { title: string; action?: () => void; actionLabel?: string }) {
  return (
    <div className="bg-slate-900/80 p-8 rounded-2xl border border-dashed border-white/10 text-center space-y-3">
      <h3 className="font-bold text-sm text-white">{title}</h3>
      <p className="text-xs text-slate-300">Nenhum registro encontrado no momento.</p>
      {action && (
        <button
          onClick={action}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-xs"
        >
          {actionLabel || 'Cadastrar'}
        </button>
      )}
    </div>
  );
}
