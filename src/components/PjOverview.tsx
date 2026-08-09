import React from 'react';
import { Transaction, CalendarEvent } from '../types';
import { MetricCard, DonutChartCard, GoalCard, ActivityRow } from './aura/AuraCards';
import { Plus, FileText, AlertTriangle, ArrowUpRight, ArrowDownRight, ShieldCheck, DollarSign } from 'lucide-react';
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
  onOpenBillingModal,
}: Props) {
  const pjTxs = transactions.filter(t => t.context === 'PJ');

  const grossRevenue = pjTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 18500;
  const totalExpenses = pjTxs.filter(t => t.type === 'expense' && !t.isPersonalExpenseInPJ).reduce((acc, t) => acc + t.amount, 0) || 4500;
  const prolaborePaid = pjTxs.filter(t => t.category === 'prolabore_pago').reduce((acc, t) => acc + t.amount, 0) || 8500;

  const currentCash = 35000 + (grossRevenue - totalExpenses - prolaborePaid);
  const netProfit = grossRevenue - totalExpenses - prolaborePaid;
  const marginPercent = Math.round((netProfit / (grossRevenue || 1)) * 100);

  const budgetCategories = [
    { label: 'Custos Operacionais', amount: 4500, color: '#0891B2' },
    { label: 'Pró-labore dos Sócios', amount: 8500, color: '#4338CA' },
    { label: 'Impostos Simples Nacional', amount: 1110, color: '#10B981' },
    { label: 'Softwares & Ferramentas', amount: 850, color: '#F43F5E' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-white">
      
      {/* 1. Page Header & Top KPIs (Dark Theme Executivo) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Dashboard PJ — Execução & Performance
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Painel Executivo da Empresa
          </h1>
        </div>

        <button
          onClick={onOpenBillingModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <FileText className="w-4 h-4" />
          <span>Emitir Fatura Pix</span>
        </button>
      </div>

      {/* Top 4 Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Faturamento Bruto" value={grossRevenue} isPJ subtitle="Mês Atual" trend="up" trendValue="+18.4%" />
        <MetricCard title="Caixa Operacional" value={currentCash} isPJ subtitle="Contas PJ" trend="up" trendValue="+10.2%" />
        <MetricCard title="Resultado Líquido" value={netProfit} isPJ subtitle="Após impostos e pró-labore" />
        <MetricCard title="Margem Líquida" value={marginPercent} isPJ prefix="" subtitle={`Operacional: ${marginPercent}%`} />
      </div>

      {/* 2. Grid Modular 12 Colunas (Exatamente o mesmo padrão do PF em Tema Escuro) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Chart Card (Distribuição de Custos PJ) */}
        <div className="lg:col-span-5">
          <DonutChartCard
            title="Estrutura de Despesas & Custos"
            subtitle="DRE Gerencial em execução."
            spent={totalExpenses + prolaborePaid}
            target={18500}
            categories={budgetCategories}
            isPJ
          />
        </div>

        {/* Cashflow Bar & Projeção 6 Meses */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Fluxo de Caixa PJ */}
          <div className="bg-[#172033] p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">Fluxo de Caixa & Projeção</h3>
              <span className="text-xs font-mono font-bold text-cyan-400">Runway: 180 Dias</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-sans font-medium text-slate-400 mb-1">
                  <span>Faturamento Entradas</span>
                  <span className="font-mono font-bold text-emerald-400">R$ {grossRevenue.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-sans font-medium text-slate-400 mb-1">
                  <span>Saídas & Pró-labore</span>
                  <span className="font-mono font-bold text-rose-400">R$ {(totalExpenses + prolaborePaid).toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Line Chart Card: Faturamento 6 Meses */}
          <div className="bg-[#172033] p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">Evolução do Faturamento (Últimos 6 Meses)</h3>
              <span className="text-xs font-semibold text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">Crescimento Sustentável</span>
            </div>

            <div className="h-36 w-full flex items-end justify-between px-2 pt-6 pb-2 border-b border-white/5 relative">
              <svg className="absolute inset-0 w-full h-full text-cyan-500/20" preserveAspectRatio="none" viewBox="0 0 100 50">
                <path d="M0,40 Q25,30 50,15 T100,5 L100,50 L0,50 Z" fill="currentColor" />
                <path d="M0,40 Q25,30 50,15 T100,5" fill="none" stroke="#0891B2" strokeWidth="2" />
              </svg>

              <div className="relative z-10 text-center text-[10px] font-bold text-slate-500">Mai</div>
              <div className="relative z-10 text-center text-[10px] font-bold text-slate-500">Jun</div>
              <div className="relative z-10 text-center text-[10px] font-bold text-slate-500">Jul</div>
              <div className="relative z-10 text-center text-[10px] font-bold text-slate-500">Ago</div>
              <div className="relative z-10 text-center text-[10px] font-bold text-slate-500">Set</div>
              <div className="relative z-10 text-center text-[10px] font-bold text-cyan-400">Out</div>
            </div>
          </div>

          {/* Indicadores Operacionais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GoalCard title="Ponto de Equilíbrio (Break-even)" current={5610} target={5610} daysLeft={0} isPJ />
            <GoalCard title="Meta de Faturamento Mensal" current={grossRevenue} target={25000} daysLeft={21} isPJ />
          </div>

        </div>

      </div>

      {/* 3. Bottom Section: Movimentações Corporativas Recentes */}
      <div className="bg-[#172033] p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm tracking-tight">Lançamentos & Faturas Recentes</h3>
          <span className="text-xs text-slate-400 font-semibold">Atualizado em Tempo Real</span>
        </div>

        <div className="space-y-2">
          {pjTxs.slice(0, 4).map(tx => (
            <ActivityRow
              key={tx.id}
              title={tx.title}
              subtitle={`${tx.date} • ${tx.category}`}
              amount={tx.amount}
              isIncome={tx.type === 'income'}
              isPJ
            />
          ))}
        </div>
      </div>

    </div>
  );
}
