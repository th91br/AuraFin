import { useState } from 'react';
import { Transaction, CalendarEvent, Asset, BudgetItem, Goal, CreditCard } from '../types';
import { MetricCard, DonutChartCard, GoalCard, ActivityRow, VisualPaymentCard } from './aura/AuraCards';
import { Plus, Sparkles, ChevronLeft, ChevronRight, CreditCard as CreditCardIcon, ArrowUpRight, TrendingDown } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  events: CalendarEvent[];
  assets: Asset[];
  budgetItems: BudgetItem[];
  goals: Goal[];
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
  creditCards = [],
  isPrivacyMode = false,
  onAddTransaction,
  onNavigateTab,
  onAddCard,
}: Props) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const pfTxs = transactions.filter(t => t.context === 'PF');

  const totalIncome = pfTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalSpent = pfTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const currentBalance = totalIncome - totalSpent;
  const proLaboreReceived = pfTxs.filter(t => t.category === 'pro_labore' || t.title?.toLowerCase().includes('pró-labore') || t.title?.toLowerCase().includes('pro-labore')).reduce((acc, t) => acc + t.amount, 0);

  const budgetCategories = [
    { label: 'Moradia & Contas', amount: pfTxs.filter(t => t.category === 'moradia').reduce((acc, t) => acc + t.amount, 0), color: '#4338CA' },
    { label: 'Alimentação & Mercado', amount: pfTxs.filter(t => t.category === 'alimentacao').reduce((acc, t) => acc + t.amount, 0), color: '#0891B2' },
    { label: 'Transporte & Veículo', amount: pfTxs.filter(t => t.category === 'transporte').reduce((acc, t) => acc + t.amount, 0), color: '#10B981' },
    { label: 'Lazer & Estilo de Vida', amount: pfTxs.filter(t => t.category === 'lazer').reduce((acc, t) => acc + t.amount, 0), color: '#F43F5E' },
  ];

  const activeCards = creditCards;
  const activeCard = activeCards[activeCardIndex] || activeCards[0];
  const availableLimit = activeCard ? activeCard.limitTotal - activeCard.limitUsed : 0;
  const usedPercentage = activeCard ? Math.min(100, Math.round((activeCard.limitUsed / (activeCard.limitTotal || 1)) * 100)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-900">
      
      {/* 1. Header do Dashboard com Botão de Novo Lançamento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded">
            Visão Geral PF — AuraFin
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
        <MetricCard title="Saldo Atual" value={currentBalance} isPrivacyMode={isPrivacyMode} subtitle="Contas unificadas" />
        <MetricCard title="Entradas" value={totalIncome} isPrivacyMode={isPrivacyMode} subtitle="Receitas do mês" />
        <MetricCard title="Saídas" value={totalSpent} isPrivacyMode={isPrivacyMode} subtitle="Despesas do mês" />
        <MetricCard title="Resultado" value={currentBalance} isPrivacyMode={isPrivacyMode} subtitle="Balanço mensal" />
        <MetricCard title="Pró-labore" value={proLaboreReceived} isPrivacyMode={isPrivacyMode} subtitle="Recebido da PJ" />
      </div>

      {/* 2. Insight Banner Integrado */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-950 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold uppercase text-[10px] text-indigo-700 tracking-wider block">Inteligência AuraFin</span>
            <p>{pfTxs.length === 0 ? 'Seu ambiente financeiro pessoal está pronto. Comece adicionando sua primeira conta ou transação.' : `Você possui ${pfTxs.length} lançamentos registrados neste ciclo.`}</p>
          </div>
        </div>
      </div>

      {/* 3. Seção Superior do Grid: Orçamento (Esquerda) + Fluxo do Mês (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-5">
          <DonutChartCard
            title="Meu Orçamento de Gastos"
            subtitle={totalSpent > 0 ? "Distribuição das suas despesas por categoria." : "Cadastre transações para visualizar o orçamento."}
            spent={totalSpent}
            target={totalIncome > 0 ? totalIncome : 1}
            categories={budgetCategories}
            isPrivacyMode={isPrivacyMode}
          />
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">Fluxo de Caixa do Mês</h3>
              <span className="text-xs font-mono font-bold text-slate-950">
                Saldo: <PrivacyText value={currentBalance} isPrivacyMode={isPrivacyMode} />
              </span>
            </div>

            <div className="space-y-4 font-mono text-xs my-auto">
              <div>
                <div className="flex justify-between text-[11px] font-sans font-medium text-slate-500 mb-1">
                  <span>Entradas (Receitas)</span>
                  <span className="font-mono font-bold text-emerald-600">
                    <PrivacyText value={totalIncome} isPrivacyMode={isPrivacyMode} />
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-sans font-medium text-slate-500 mb-1">
                  <span>Saídas (Despesas)</span>
                  <span className="font-mono font-bold text-rose-600">
                    <PrivacyText value={totalSpent} isPrivacyMode={isPrivacyMode} />
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">Resultado do mês:</span>
              <span className="font-mono font-bold text-emerald-600">
                <PrivacyText value={totalIncome - totalSpent} isPrivacyMode={isPrivacyMode} prefix="+ R$" />
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. SEÇÃO PRINCIPAL REORGANIZADA: DUAS PILHAS VERTICAIS INDEPENDENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PILHA DA ESQUERDA (5 cols): Meus Cartões → Gastos da Semana */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* MÓDULO 1: MEUS CARTÕES */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-950 flex items-center space-x-2">
                  <CreditCardIcon className="w-4 h-4 text-indigo-600" />
                  <span>Meus Cartões</span>
                </h3>
                {activeCards.length > 1 && (
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Cartão {activeCardIndex + 1} de {activeCards.length}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {activeCards.length > 1 && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setActiveCardIndex(prev => (prev > 0 ? prev - 1 : activeCards.length - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 bg-slate-50"
                      title="Cartão anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveCardIndex(prev => (prev < activeCards.length - 1 ? prev + 1 : 0))}
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
                  Adicionar Cartão
                </button>
              </div>
            </div>

            {activeCard ? (
              <div className="space-y-4">
                <VisualPaymentCard
                  cardName={activeCard.name}
                  cardNumberMasked="•••• •••• •••• 4554"
                  balance={availableLimit}
                  dueDate={`${activeCard.dueDay}/28`}
                  isPrivacyMode={isPrivacyMode}
                />

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-2 font-mono">
                  <div className="flex justify-between text-slate-700 font-sans font-semibold">
                    <span>Fatura Atual ({activeCard.closingDay}/28):</span>
                    <span className="font-mono font-bold text-slate-950">
                      <PrivacyText value={activeCard.currentInvoice} isPrivacyMode={isPrivacyMode} />
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Limite Disponível:</span>
                    <span className="font-bold text-emerald-600">
                      <PrivacyText value={availableLimit} isPrivacyMode={isPrivacyMode} />
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Limite Utilizado ({usedPercentage}%):</span>
                    <span className="font-bold text-slate-900">
                      <PrivacyText value={activeCard.limitUsed} isPrivacyMode={isPrivacyMode} /> de <PrivacyText value={activeCard.limitTotal} isPrivacyMode={isPrivacyMode} />
                    </span>
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
                <p className="text-xs font-semibold text-slate-700">Nenhum cartão cadastrado</p>
                <p className="text-[11px] text-slate-500">Adicione seus cartões para acompanhar limites e faturas.</p>
              </div>
            )}
          </div>

          {/* MÓDULO 2: GASTOS DA SEMANA REFINADO */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm tracking-tight text-slate-950">Gastos da Semana</h3>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Total acumulado nos lançamentos</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-2xl font-black font-mono text-slate-950 tracking-tight">
                <PrivacyText value={totalSpent} isPrivacyMode={isPrivacyMode} />
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-36 flex items-end justify-between px-2 pt-4 border-b border-slate-100">
              {[
                { day: 'Seg', val: 320, height: 40 },
                { day: 'Ter', val: 580, height: 65 },
                { day: 'Qua', val: 210, height: 30 },
                { day: 'Qui', val: 840, height: 85 },
                { day: 'Sex', val: 490, height: 55 },
                { day: 'Sáb', val: 310, height: 40 },
                { day: 'Dom', val: 90, height: 15 },
              ].map(item => (
                <div key={item.day} className="flex flex-col items-center space-y-1.5 flex-1 group">
                  <div className="w-5 bg-indigo-600 rounded-t-md transition-all group-hover:bg-indigo-500" style={{ height: `${item.height}%` }} />
                  <span className="text-[10px] font-bold text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 font-medium">
              <span>Maior gasto: Quinta (<PrivacyText value={840} isPrivacyMode={isPrivacyMode} />)</span>
              <span>Média: <PrivacyText value={405.78} isPrivacyMode={isPrivacyMode} />/dia</span>
            </div>
          </div>

        </div>

        {/* PILHA DA DIREITA (7 cols): Metas Financeiras → Atividades Recentes */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* MÓDULO 1: PROGRESSO DAS METAS FINANCEIRAS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight text-slate-950">Progresso das Metas Financeiras</h3>
              <button
                onClick={() => onNavigateTab && onNavigateTab('goals')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Ver todas as metas →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GoalCard title="Viagem de Férias Europa" current={18500} target={25000} daysLeft={120} isPrivacyMode={isPrivacyMode} />
              <GoalCard title="Reserva de Emergência" current={28500} target={30000} daysLeft={45} isPrivacyMode={isPrivacyMode} />
              <GoalCard title="Troca de Veículo" current={45000} target={80000} daysLeft={240} isPrivacyMode={isPrivacyMode} />
              <GoalCard title="Pós-Graduação UX/UI" current={980} target={1200} daysLeft={15} isPrivacyMode={isPrivacyMode} />
            </div>
          </div>

          {/* MÓDULO 2: ATIVIDADES RECENTES */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight text-slate-950">Atividades & Movimentações Recentes</h3>
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
                  isPrivacyMode={isPrivacyMode}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
