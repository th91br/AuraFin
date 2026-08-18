import { useState } from 'react';
import { Transaction, CalendarEvent, Asset, BudgetItem, Goal, CreditCard, Account, TransactionAnalytics } from '../types';
import { MetricCard, DonutChartCard, GoalCard, ActivityRow, VisualPaymentCard } from './aura/AuraCards';
import { Plus, Sparkles, ChevronLeft, ChevronRight, CreditCard as CreditCardIcon, ArrowUpRight, Target, Landmark, ArrowRight } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  accounts?: Account[];
  events?: CalendarEvent[];
  assets?: Asset[];
  budgetItems?: BudgetItem[];
  goals?: Goal[];
  creditCards?: CreditCard[];
  analytics?: TransactionAnalytics;
  isPrivacyMode?: boolean;
  onAddTransaction: () => void;
  onAddAccount?: () => void;
  onAddAsset?: () => void;
  onAddGoal?: () => void;
  onEditTransaction?: (t: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onAddEvent?: () => void;
  onEditEvent?: (e: CalendarEvent) => void;
  onDeleteEvent?: (id: string) => void;
  onActionClickEvent?: (e: CalendarEvent) => void;
  onNavigateTab?: (tab: string) => void;
  onAddCard?: () => void;
}

export function PfOverview({
  transactions,
  accounts = [],
  goals = [],
  creditCards = [],
  analytics,
  isPrivacyMode = false,
  onAddTransaction,
  onAddAccount,
  onAddGoal,
  onNavigateTab,
  onAddCard,
}: Props) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const pfTxs = transactions.filter(t => t.context === 'PF');
  const pfAccounts = accounts.filter(a => a.context === 'PF');
  const pfCards = creditCards.filter(c => c.context === 'PF');

  // Real Totals
  const totalAccountBalance = pfAccounts.reduce((acc, a) => acc + a.balance, 0);
  const totalIncome = analytics ? Number(analytics.total_receipts_cents || 0) / 100 : pfTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalSpent = analytics ? Number(analytics.total_expenses_cents || 0) / 100 : pfTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const currentNetResult = totalIncome - totalSpent;
  const proLaboreReceived = analytics ? Number(analytics.prolabore_cents || 0) / 100 : pfTxs
    .filter(t => t.category === 'salario_prolabore' || t.category === 'distribuicao_lucro' || t.title?.toLowerCase().includes('pró-labore') || t.title?.toLowerCase().includes('pro-labore'))
    .reduce((acc, t) => acc + t.amount, 0);

  // Dynamic Category Breakdown for Donut Chart
  const categoryMap: Record<string, { label: string; color: string; amount: number }> = {
    moradia: { label: 'Moradia & Contas', color: '#4338CA', amount: 0 },
    alimentacao: { label: 'Alimentação & Mercado', color: '#0891B2', amount: 0 },
    transporte: { label: 'Transporte & Veículo', color: '#10B981', amount: 0 },
    saude: { label: 'Saúde & Farmácia', color: '#E11D48', amount: 0 },
    educacao: { label: 'Educação & Cursos', color: '#8B5CF6', amount: 0 },
    lazer: { label: 'Lazer & Estilo de Vida', color: '#F43F5E', amount: 0 },
    investimentos: { label: 'Investimentos', color: '#059669', amount: 0 },
    outros: { label: 'Outras Despesas', color: '#64748B', amount: 0 },
  };

  if (analytics) {
    analytics.by_category.forEach(category => {
      const key = categoryMap[category.category] ? category.category : 'outros';
      categoryMap[key].amount += Number(category.expenses_cents || 0) / 100;
    });
  } else {
    pfTxs.filter(t => t.type === 'expense').forEach(t => {
      const key = categoryMap[t.category] ? t.category : 'outros';
      categoryMap[key].amount += t.amount;
    });
  }

  const budgetCategories = Object.values(categoryMap).filter(c => c.amount > 0);

  // Active Credit Card logic
  const activeCard = pfCards[activeCardIndex] || pfCards[0];
  const availableLimit = activeCard ? Math.max(0, activeCard.limitTotal - activeCard.limitUsed) : 0;
  const usedPercentage = activeCard && activeCard.limitTotal > 0 ? Math.min(100, Math.round((activeCard.limitUsed / activeCard.limitTotal) * 100)) : 0;

  // Real Weekly Spend calculation (last 7 days)
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = daysOfWeek[d.getDay()];
    const daySpent = pfTxs
      .filter(t => t.type === 'expense' && t.date === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);
    return { day: dayLabel, date: dateStr, amount: daySpent };
  });

  const hasData = Boolean(analytics?.transaction_count || pfTxs.length || pfAccounts.length || goals.length || pfCards.length);
  if (!hasData) return <div className="min-h-[420px] flex flex-col items-center justify-center gap-4 text-center"><Landmark className="w-10 h-10 text-slate-400" /><h1 className="text-2xl font-black text-slate-950">Visão Geral PF</h1><p className="text-sm text-slate-500">Nenhum dado disponível</p><button onClick={onAddTransaction} className="px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold">Cadastrar primeira movimentação</button></div>;

  const maxWeeklyDay = Math.max(...last7Days.map(d => d.amount), 1);
  const totalWeeklySpent = last7Days.reduce((acc, d) => acc + d.amount, 0);
  const avgDailySpent = totalWeeklySpent / 7;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-900">
      
      {/* 1. Header do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Visão Geral PF — AuraFin
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Minhas Finanças Pessoais
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Acompanhe seu saldo consolidado, fluxo mensal, cartões e objetivos em tempo real.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {onAddAccount && (
            <button
              onClick={onAddAccount}
              className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all text-xs border border-slate-200"
            >
              <Landmark className="w-4 h-4 text-indigo-600" />
              <span>Nova Conta</span>
            </button>
          )}

          <button
            onClick={onAddTransaction}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Saldo Consolidado" value={totalAccountBalance} isPrivacyMode={isPrivacyMode} subtitle="Contas e carteiras ativas" />
        <MetricCard title="Entradas do Mês" value={totalIncome} isPrivacyMode={isPrivacyMode} subtitle="Receitas registradas" />
        <MetricCard title="Saídas do Mês" value={totalSpent} isPrivacyMode={isPrivacyMode} subtitle="Despesas e pagamentos" />
        <MetricCard title="Resultado Líquido" value={currentNetResult} isPrivacyMode={isPrivacyMode} subtitle="Superávit do período" />
        <MetricCard title="Pró-labore Recebido" value={proLaboreReceived} isPrivacyMode={isPrivacyMode} subtitle="Transferências da PJ" />
      </div>

      {/* 2. Onboarding / Insight Banner */}
      {pfTxs.length === 0 && pfAccounts.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-950">Painel Financeiro Pessoal</h3>
              <p className="text-xs text-slate-600 mt-0.5">Cadastre suas contas bancárias ou crie seu primeiro lançamento para ver relatórios e análises automáticas.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onAddAccount && (
              <button
                onClick={onAddAccount}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                + Cadastrar Conta
              </button>
            )}
            <button
              onClick={onAddTransaction}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              + Novo Lançamento
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-800 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-700">{pfTxs.length} lançamento(s) e {pfAccounts.length} conta(s) sincronizados com sucesso.</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Seção Superior: Orçamento + Fluxo do Mês */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-5">
          <DonutChartCard
            title="Meu Orçamento de Gastos"
            subtitle={totalSpent > 0 ? "Distribuição real das despesas por categoria." : "Cadastre despesas para visualizar a divisão orçamentária."}
            spent={totalSpent}
            target={totalIncome > 0 ? totalIncome : totalSpent > 0 ? totalSpent : 1}
            categories={budgetCategories.length > 0 ? budgetCategories : [{ label: 'Sem despesas', amount: 0, color: '#94A3B8' }]}
            isPrivacyMode={isPrivacyMode}
          />
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight text-slate-950">Fluxo do Período</h3>
              <span className="text-xs font-mono font-bold text-slate-950">
                Resultado: <PrivacyText value={currentNetResult} isPrivacyMode={isPrivacyMode} />
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
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: totalIncome > 0 ? '100%' : '0%' }} />
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
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{ width: totalIncome > 0 ? `${Math.min(100, Math.round((totalSpent / totalIncome) * 100))}%` : totalSpent > 0 ? '100%' : '0%' }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">Saldo Líquido Real:</span>
              <span className={`font-mono font-bold ${currentNetResult >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <PrivacyText value={currentNetResult} isPrivacyMode={isPrivacyMode} />
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Duas Colunas: Cartões + Gastos Semanais & Metas + Lançamentos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Coluna Esquerda (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* MÓDULO: MEUS CARTÕES */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-950 flex items-center space-x-2">
                  <CreditCardIcon className="w-4 h-4 text-indigo-600" />
                  <span>Meus Cartões de Crédito</span>
                </h3>
                {pfCards.length > 1 && (
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Cartão {activeCardIndex + 1} de {pfCards.length}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {pfCards.length > 1 && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setActiveCardIndex(prev => (prev > 0 ? prev - 1 : pfCards.length - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 bg-slate-50"
                      title="Cartão anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveCardIndex(prev => (prev < pfCards.length - 1 ? prev + 1 : 0))}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 bg-slate-50"
                      title="Próximo cartão"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {onAddCard && (
                  <button
                    onClick={onAddCard}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
                  >
                    + Cartão
                  </button>
                )}
              </div>
            </div>

            {activeCard ? (
              <div className="space-y-4">
                <VisualPaymentCard
                  cardName={activeCard.name}
                  cardNumberMasked={`•••• •••• •••• ${activeCard.lastFourDigits || '—'}`}
                  balance={availableLimit}
                  dueDate={activeCard.dueDay ? String(activeCard.dueDay) : '—'}
                  brand={activeCard.brand}
                  isPrivacyMode={isPrivacyMode}
                />

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-2 font-mono">
                  <div className="flex justify-between text-slate-700 font-sans font-semibold">
                    <span>Fatura Atual{activeCard.closingDay ? ` (${activeCard.closingDay})` : ''}:</span>
                    <span className="font-mono font-bold text-slate-950">
                      <PrivacyText value={activeCard.currentInvoice || activeCard.limitUsed} isPrivacyMode={isPrivacyMode} />
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
                {onAddCard && (
                  <button
                    onClick={onAddCard}
                    className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
                  >
                    + Adicionar Cartão
                  </button>
                )}
              </div>
            )}
          </div>

          {/* MÓDULO: GASTOS DA SEMANA REAL */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm tracking-tight text-slate-950">Gastos dos Últimos 7 Dias</h3>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Calculado a partir de lançamentos reais</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-2xl font-black font-mono text-slate-950 tracking-tight">
                <PrivacyText value={totalWeeklySpent} isPrivacyMode={isPrivacyMode} />
              </span>
            </div>

            {/* Visual Bar Chart dos 7 dias */}
            <div className="h-32 flex items-end justify-between px-2 pt-4 border-b border-slate-100">
              {last7Days.map(item => {
                const heightPct = item.amount > 0 ? Math.max(12, Math.round((item.amount / maxWeeklyDay) * 100)) : 6;
                return (
                  <div key={item.date} className="flex flex-col items-center space-y-1.5 flex-1 group">
                    <div
                      className={`w-5 rounded-t-md transition-all ${item.amount > 0 ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-slate-100'}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${item.day} (${item.date}): R$ ${item.amount.toFixed(2)}`}
                    />
                    <span className="text-[10px] font-bold text-slate-400">{item.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 font-medium">
              <span>Total da semana: <PrivacyText value={totalWeeklySpent} isPrivacyMode={isPrivacyMode} /></span>
              <span>Média: <PrivacyText value={avgDailySpent} isPrivacyMode={isPrivacyMode} />/dia</span>
            </div>
          </div>

        </div>

        {/* Coluna Direita (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* MÓDULO: PROGRESSO DAS METAS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight text-slate-950 flex items-center space-x-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Metas Financeiras Ativas</span>
              </h3>
              <button
                onClick={() => onNavigateTab && onNavigateTab('goals')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {goals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.slice(0, 4).map(g => (
                  <GoalCard
                    key={g.id}
                    title={g.title}
                    current={g.currentAmount}
                    target={g.targetAmount}
                    daysLeft={Math.max(1, Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                    isPrivacyMode={isPrivacyMode}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <Target className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">Nenhuma meta cadastrada ainda</p>
                <p className="text-[11px] text-slate-500">Crie objetivos para acompanhar seu progresso de economia.</p>
                {onAddGoal && (
                  <button
                    onClick={onAddGoal}
                    className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                  >
                    + Criar Primeira Meta
                  </button>
                )}
              </div>
            )}
          </div>

          {/* MÓDULO: ATIVIDADES RECENTES */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight text-slate-950">Movimentações Recentes</h3>
              <button
                onClick={() => onNavigateTab && onNavigateTab('transactions')}
                className="text-xs text-indigo-600 font-bold hover:underline flex items-center"
              >
                <span>Ver todas</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {pfTxs.length > 0 ? (
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
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-700">Nenhuma movimentação registrada</p>
                <p className="text-[11px] text-slate-500">Clique no botão abaixo para adicionar sua primeira receita ou despesa.</p>
                <button
                  onClick={onAddTransaction}
                  className="mt-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                >
                  + Nova Movimentação
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
