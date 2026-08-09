import React from 'react';
import { Transaction, CalendarEvent, Asset, BudgetItem, Goal, CreditCard } from '../types';
import { DonutChartCard, GoalCard, VisualPaymentCard, ActivityRow, MetricCard } from './aura/AuraCards';
import { Plus, CreditCard as CreditCardIcon, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  events: CalendarEvent[];
  assets: Asset[];
  budgetItems?: BudgetItem[];
  goals?: Goal[];
  creditCards?: CreditCard[];
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
  goals = [],
  creditCards = [],
  isPrivacyMode = false,
  onAddTransaction,
  onAddAsset,
}: Props) {
  const pfTxs = transactions.filter(t => t.context === 'PF');

  const totalIncome = pfTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) + 8500;
  const totalSpent = pfTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const currentBalance = totalIncome - totalSpent;

  // Categorias de orçamento para o Donut Chart
  const budgetCategories = [
    { label: 'Moradia & Contas', amount: 2150, color: '#4F46E5' },
    { label: 'Alimentação & Mercado', amount: 1420.50, color: '#059669' },
    { label: 'Saúde & Farmácia', amount: 1250, color: '#E11D48' },
    { label: 'Educação & Cursos', amount: 980, color: '#D97706' },
    { label: 'Lazer & Viagens', amount: 650, color: '#0284C7' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Page Header & Top KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Dashboard PF — Tranquilidade & Futuro
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Minhas Finanças Pessoais
          </h1>
        </div>

        <button
          onClick={onAddTransaction}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Saldo Atual" value={currentBalance} isPrivacyMode={isPrivacyMode} subtitle="Contas unificadas" trend="up" trendValue="+8.2%" />
        <MetricCard title="Entradas" value={totalIncome} isPrivacyMode={isPrivacyMode} subtitle="Pró-labore e Aportes" trend="up" trendValue="+12%" />
        <MetricCard title="Saídas" value={totalSpent} isPrivacyMode={isPrivacyMode} subtitle="Despesas do mês" trend="down" trendValue="-3.4%" />
        <MetricCard title="Economizado" value={28500} isPrivacyMode={isPrivacyMode} subtitle="Renda Fixa" trend="up" trendValue="+15%" />
        <MetricCard title="Pró-labore" value={8500} isPrivacyMode={isPrivacyMode} subtitle="Recebido da PJ" />
      </div>

      {/* 2. Grid Modular 12 Colunas Inspirado na Referência Dribbble */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna Esquerda: Donut Chart Card ("Meu Orçamento") */}
        <div className="lg:col-span-5">
          <DonutChartCard
            title="Meu Orçamento de Outubro"
            subtitle="Excelente! Seu orçamento está no teto esperado."
            spent={totalSpent || 6450.50}
            target={8000}
            categories={budgetCategories}
          />
        </div>

        {/* Coluna Central: Cashflow Bar, Line Chart e Goals Grid 2x2 */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Fluxo do Mês (Progress Bars) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">Fluxo de Caixa do Mês</h3>
              <span className="text-xs font-mono font-bold text-slate-900">Saldo: R$ {currentBalance.toLocaleString('pt-BR')}</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-sans font-medium text-slate-500 mb-1">
                  <span>Entradas (Receitas)</span>
                  <span className="font-mono font-bold text-emerald-600">R$ {totalIncome.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-sans font-medium text-slate-500 mb-1">
                  <span>Saídas (Despesas)</span>
                  <span className="font-mono font-bold text-rose-600">R$ {totalSpent.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Line Chart Card: Evolução Financeira 6 Meses */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">Evolução Financeira (Últimos 6 Meses)</h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">Renda Fixa & Reserva</span>
            </div>

            {/* Simulated Line Chart Curve */}
            <div className="h-36 w-full flex items-end justify-between px-2 pt-6 pb-2 border-b border-slate-100 relative">
              <svg className="absolute inset-0 w-full h-full text-indigo-500/20" preserveAspectRatio="none" viewBox="0 0 100 50">
                <path d="M0,45 Q20,35 40,25 T80,15 T100,5 L100,50 L0,50 Z" fill="currentColor" />
                <path d="M0,45 Q20,35 40,25 T80,15 T100,5" fill="none" stroke="#4F46E5" strokeWidth="2" />
              </svg>

              <div className="relative z-10 text-center text-[10px] font-bold text-slate-400">Mai</div>
              <div className="relative z-10 text-center text-[10px] font-bold text-slate-400">Jun</div>
              <div className="relative z-10 text-center text-[10px] font-bold text-slate-400">Jul</div>
              <div className="relative z-10 text-center text-[10px] font-bold text-slate-400">Ago</div>
              <div className="relative z-10 text-center text-[10px] font-bold text-slate-400">Set</div>
              <div className="relative z-10 text-center text-[10px] font-bold text-slate-900">Out</div>
            </div>
          </div>

          {/* Progress of Financial Goals Grid 2x2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">Progresso das Metas Financeiras</h3>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">+ Nova Meta</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GoalCard title="Viagem de Férias Europa" current={18500} target={25000} daysLeft={120} />
              <GoalCard title="Reserva de Emergência" current={28500} target={30000} daysLeft={45} />
              <GoalCard title="Troca de Veículo" current={45000} target={80000} daysLeft={240} />
              <GoalCard title="Pós-Graduação UX/UI" current={980} target={1200} daysLeft={15} />
            </div>
          </div>

        </div>

      </div>

      {/* 3. Bottom Section: Gastos da Semana & Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gastos da Semana (Mini Bar Chart) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm tracking-tight">Gastos da Semana</h3>
          <div className="h-32 flex items-end justify-between px-3 pt-4 border-b border-slate-100">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => {
              const heights = [40, 65, 30, 80, 50, 90, 20];
              return (
                <div key={day} className="flex flex-col items-center space-y-1.5 flex-1">
                  <div className="w-4 bg-indigo-600 rounded-t-sm transition-all" style={{ height: `${heights[i]}%` }} />
                  <span className="text-[10px] font-bold text-slate-400">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Atividades Recentes List */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-tight">Atividades & Movimentações Recentes</h3>
            <span className="text-xs text-slate-400 font-semibold">Hoje, 09 de Agosto</span>
          </div>

          <div className="space-y-2">
            {pfTxs.slice(0, 4).map(tx => (
              <ActivityRow
                key={tx.id}
                title={tx.title}
                subtitle={`${tx.date} • ${tx.category}`}
                amount={tx.amount}
                isIncome={tx.type === 'income'}
              />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
