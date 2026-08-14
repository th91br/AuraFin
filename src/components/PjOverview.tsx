import { useState } from 'react';
import { Transaction, CalendarEvent, CreditCard } from '../types';
import { MetricCard, DonutChartCard, GoalCard, ActivityRow, VisualPaymentCard } from './aura/AuraCards';
import { Plus, FileText, AlertTriangle, ArrowUpRight, ArrowDownRight, ShieldCheck, DollarSign, CreditCard as CreditCardIcon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  events: CalendarEvent[];
  creditCards?: CreditCard[];
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

export function PjOverview({
  transactions,
  events,
  creditCards = [],
  isPrivacyMode = false,
  onAddTransaction,
  onOpenBillingModal,
  onNavigateTab,
  onAddCard,
}: Props) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const pjTxs = transactions.filter(t => t.context === 'PJ');

  const grossRevenue = pjTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = pjTxs.filter(t => t.type === 'expense' && !t.isPersonalExpenseInPJ).reduce((acc, t) => acc + t.amount, 0);
  const prolaborePaid = pjTxs.filter(t => t.category === 'prolabore_pago' || t.category === 'pro_labore').reduce((acc, t) => acc + t.amount, 0);

  const currentCash = grossRevenue - totalExpenses - prolaborePaid;
  const netProfit = currentCash;
  const marginPercent = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  const budgetCategories = [
    { label: 'Custos Operacionais', amount: pjTxs.filter(t => t.category === 'operacional').reduce((acc, t) => acc + t.amount, 0), color: '#0891B2' },
    { label: 'Pró-labore dos Sócios', amount: prolaborePaid, color: '#4338CA' },
    { label: 'Impostos Simples Nacional', amount: pjTxs.filter(t => t.category === 'impostos').reduce((acc, t) => acc + t.amount, 0), color: '#10B981' },
    { label: 'Softwares & Ferramentas', amount: pjTxs.filter(t => t.category === 'software').reduce((acc, t) => acc + t.amount, 0), color: '#F43F5E' },
  ];

  const activeCards = creditCards;
  const activeCard = activeCards[activeCardIndex] || activeCards[0];
  const availableLimit = activeCard ? activeCard.limitTotal - activeCard.limitUsed : 0;
  const usedPercentage = activeCard ? Math.min(100, Math.round((activeCard.limitUsed / (activeCard.limitTotal || 1)) * 100)) : 0;

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
        <MetricCard
          title="Faturamento Bruto"
          value={grossRevenue}
          isPrivacyMode={isPrivacyMode}
          isPJ
          subtitle="Mês Atual"
          trend="up"
          trendValue="+18.4%"
        />
        <MetricCard
          title="Caixa Operacional"
          value={currentCash}
          isPrivacyMode={isPrivacyMode}
          isPJ
          subtitle="Contas PJ"
          trend="up"
          trendValue="+10.2%"
        />
        <MetricCard
          title="Resultado Líquido"
          value={netProfit}
          isPrivacyMode={isPrivacyMode}
          isPJ
          subtitle="Após impostos e pró-labore"
        />
        <MetricCard
          title="Margem Líquida"
          value={marginPercent}
          isPrivacyMode={isPrivacyMode}
          isPJ
          prefix=""
          subtitle={isPrivacyMode ? "Operacional: •••••• %" : `Operacional: ${marginPercent}%`}
        />
      </div>

      {/* 2. ÁREA ANALÍTICA EM DUAS COLUNAS VERTICAIS INDEPENDENTES (LEFT STACK 5/12 & RIGHT STACK 7/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT STACK (5/12): Estrutura de Despesas & Custos → Cartões Corporativos */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* MÓDULO 1: Estrutura de Despesas & Custos (Donut Chart) */}
          <DonutChartCard
            title="Estrutura de Despesas & Custos"
            subtitle="DRE Gerencial em execução."
            spent={totalExpenses + prolaborePaid}
            target={18500}
            categories={budgetCategories}
            isPJ
            isPrivacyMode={isPrivacyMode}
          />

          {/* MÓDULO 2: CARTÕES CORPORATIVOS */}
          <div className="bg-[#172033] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <CreditCardIcon className="w-4 h-4 text-cyan-400" />
                  <span>Cartões Corporativos</span>
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
                      className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white bg-slate-900"
                      title="Cartão anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveCardIndex(prev => (prev < activeCards.length - 1 ? prev + 1 : 0))}
                      className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white bg-slate-900"
                      title="Próximo cartão"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => onAddCard ? onAddCard() : alert('Formulário de novo cartão PJ')}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
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

                <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs space-y-2 font-mono">
                  <div className="flex justify-between text-slate-300 font-sans font-semibold">
                    <span>Fatura Atual ({activeCard.closingDay}/28):</span>
                    <span className="font-mono font-bold text-white">
                      <PrivacyText value={activeCard.currentInvoice} isPrivacyMode={isPrivacyMode} />
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Limite Disponível:</span>
                    <span className="font-bold text-emerald-400">
                      <PrivacyText value={availableLimit} isPrivacyMode={isPrivacyMode} />
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Limite Utilizado ({usedPercentage}%):</span>
                    <span className="font-bold text-slate-200">
                      <PrivacyText value={activeCard.limitUsed} isPrivacyMode={isPrivacyMode} /> de <PrivacyText value={activeCard.limitTotal} isPrivacyMode={isPrivacyMode} />
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${usedPercentage}%` }} />
                  </div>
                </div>

                <div className="pt-1 text-right">
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('cards')}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-end ml-auto"
                  >
                    <span>Ver todos os cartões</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-900 rounded-xl border border-dashed border-white/10 space-y-2">
                <CreditCardIcon className="w-8 h-8 text-slate-500 mx-auto" />
                <h4 className="font-bold text-xs text-white">Você ainda não cadastrou cartões da empresa</h4>
                <button
                  onClick={() => onAddCard ? onAddCard() : alert('Formulário de novo cartão PJ')}
                  className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl"
                >
                  Adicionar Cartão
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT STACK (7/12): Fluxo de Caixa → Evolução do Faturamento → Break-even & Metas */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Fluxo de Caixa PJ */}
          <div className="bg-[#172033] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">Fluxo de Caixa & Projeção</h3>
              <span className="text-xs font-mono font-bold text-cyan-400">Runway: 180 Dias</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-sans font-medium text-slate-400 mb-1">
                  <span>Faturamento Entradas</span>
                  <span className="font-mono font-bold text-emerald-400">
                    <PrivacyText value={grossRevenue} isPrivacyMode={isPrivacyMode} />
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-sans font-medium text-slate-400 mb-1">
                  <span>Saídas & Pró-labore</span>
                  <span className="font-mono font-bold text-rose-400">
                    <PrivacyText value={totalExpenses + prolaborePaid} isPrivacyMode={isPrivacyMode} />
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Line Chart (Faturamento 6 Meses) */}
          <div className="bg-[#172033] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xs">
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

          {/* Card 3: Indicadores Operacionais lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GoalCard title="Ponto de Equilíbrio (Break-even)" current={5610} target={5610} daysLeft={0} isPJ isPrivacyMode={isPrivacyMode} />
            <GoalCard title="Meta de Faturamento Mensal" current={grossRevenue} target={25000} daysLeft={21} isPJ isPrivacyMode={isPrivacyMode} />
          </div>

        </div>

      </div>

      {/* 3. SEÇÃO FULL-WIDTH: LANÇAMENTOS RECENTES & INSIGHT CONTEXTUAL */}
      <div className="space-y-6">
        
        {/* Business Insight Contextual Card */}
        <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold uppercase text-[10px] text-cyan-400 tracking-wider block">Insight AuraFin</span>
              <p>Seu Runway atual cobre <strong>180 dias de operação</strong> sem necessidade de aportes externos.</p>
            </div>
          </div>
        </div>

        {/* Lançamentos & Faturas Recentes (Full-Width) */}
        <div className="bg-[#172033] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-tight">Lançamentos & Faturas Recentes</h3>
            <button
              onClick={() => onNavigateTab && onNavigateTab('cashflow')}
              className="text-xs text-cyan-400 font-bold hover:underline flex items-center"
            >
              <span>Ver todas as movimentações</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-2">
            {pjTxs.slice(0, 6).map(tx => (
              <ActivityRow
                key={tx.id}
                title={tx.title}
                subtitle={`${tx.date} • ${tx.category}`}
                amount={tx.amount}
                isIncome={tx.type === 'income'}
                isPJ
                isPrivacyMode={isPrivacyMode}
              />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
