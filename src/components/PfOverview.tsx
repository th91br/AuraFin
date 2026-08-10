import { useState } from 'react';
import { Transaction, CalendarEvent, Asset, BudgetItem, Goal, CreditCard } from '../types';
import { DonutChartCard, GoalCard, VisualPaymentCard, ActivityRow, MetricCard } from './aura/AuraCards';
import { Plus, CreditCard as CreditCardIcon, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
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
  onNavigateTab?: (tab: string) => void;
  onAddCard?: () => void;
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
  onNavigateTab,
  onAddCard,
}: Props) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

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

  const defaultCards: CreditCard[] = creditCards.length > 0 ? creditCards : [
    { id: 'c1', name: 'Nubank Violeta Ultra', institution: 'Nubank', limitTotal: 15000, limitUsed: 4250, currentInvoice: 2450, closingDay: 20, dueDay: 28, context: 'PF' },
    { id: 'c2', name: 'Itaú Personnalité Black', institution: 'Itaú', limitTotal: 25000, limitUsed: 8900, currentInvoice: 3800, closingDay: 15, dueDay: 23, context: 'PF' },
  ];

  const activeCard = defaultCards[activeCardIndex] || defaultCards[0];
  const availableLimit = activeCard ? activeCard.limitTotal - activeCard.limitUsed : 0;
  const usedPercentage = activeCard ? Math.min(100, Math.round((activeCard.limitUsed / (activeCard.limitTotal || 1)) * 100)) : 0;

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

      {/* 2. Grid Modular 12 Colunas Integrado sem Painel Oculto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna Esquerda (5 cols): "Meu Orçamento" + Módulo "Meus Cartões" */}
        <div className="lg:col-span-5 space-y-6">
          
          <DonutChartCard
            title="Meu Orçamento de Gastos"
            subtitle="Excelente! Seu orçamento está dentro do planejado."
            spent={totalSpent || 6450.50}
            target={8000}
            categories={budgetCategories}
          />

          {/* MÓDULO ESTRATÉGICO: MEUS CARTÕES (Logo abaixo de Meu Orçamento) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            
            {/* Header do Módulo de Cartões */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-950 flex items-center space-x-2">
                  <CreditCardIcon className="w-4 h-4 text-indigo-600" />
                  <span>Meus Cartões de Crédito</span>
                </h3>
                {defaultCards.length > 1 && (
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Cartão {activeCardIndex + 1} de {defaultCards.length}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {defaultCards.length > 1 && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setActiveCardIndex(prev => (prev > 0 ? prev - 1 : defaultCards.length - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 bg-slate-50"
                      title="Cartão anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveCardIndex(prev => (prev < defaultCards.length - 1 ? prev + 1 : 0))}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 bg-slate-50"
                      title="Próximo cartão"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => onAddCard ? onAddCard() : alert('Formulário de novo cartão')}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
                >
                  + Adicionar
                </button>
              </div>
            </div>

            {/* Cartão Ativo Visual + Detalhes Compactos */}
            {activeCard ? (
              <div className="space-y-4">
                <VisualPaymentCard
                  cardName={activeCard.name}
                  cardNumberMasked="•••• •••• •••• 4554"
                  balance={availableLimit}
                  dueDate={`${activeCard.dueDay}/28`}
                />

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-2 font-mono">
                  <div className="flex justify-between text-slate-700 font-sans font-semibold">
                    <span>Fatura Atual ({activeCard.closingDay}/28):</span>
                    <span className="font-mono font-bold text-slate-950">R$ {activeCard.currentInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Limite Disponível:</span>
                    <span className="font-bold text-emerald-600">R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Limite Utilizado ({usedPercentage}%):</span>
                    <span className="font-bold text-slate-900">R$ {activeCard.limitUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {activeCard.limitTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${usedPercentage}%` }} />
                  </div>
                </div>

                <div className="pt-1 text-right">
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('cards')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-end ml-auto"
                  >
                    <span>Ver todos os cartões</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <CreditCardIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-900">Você ainda não cadastrou nenhum cartão</h4>
                <button
                  onClick={() => onAddCard ? onAddCard() : alert('Formulário de novo cartão')}
                  className="px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-xl"
                >
                  + Adicionar Cartão
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Coluna Central / Direita (7 cols): Fluxo, Insight, Evolução & Metas */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Insight AuraFin Integrado ao Grid */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-950 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold uppercase text-[10px] text-indigo-700 tracking-wider block">Insight AuraFin</span>
                <p>Você já atingiu <strong>95% da sua meta de Reserva de Emergência</strong> (R$ 28.500 de R$ 30.000).</p>
              </div>
            </div>
          </div>

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

          {/* Progress of Financial Goals Grid 2x2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">Progresso das Metas Financeiras</h3>
              <button onClick={() => onNavigateTab && onNavigateTab('goals')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Ver todas as metas →</button>
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

      {/* 3. Bottom Section: Gastos da Semana & Atividades Recentes Integradas */}
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

        {/* Atividades Recentes List Integrada no Grid */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-tight">Atividades & Movimentações Recentes</h3>
            <button
              onClick={() => onNavigateTab && onNavigateTab('transactions')}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center"
            >
              <span>Ver todas as movimentações</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-2">
            {pfTxs.slice(0, 5).map(tx => (
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
