import { useState } from 'react';
import { Transaction, Account, Asset, Debt, TransactionAnalytics, TransactionQueryFilters } from '../types';
import { MetricCard } from './aura/AuraCards';
import { BarChart3, Download, TrendingUp, TrendingDown, ArrowUpRight, FileSpreadsheet } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions?: Transaction[];
  accounts?: Account[];
  assets?: Asset[];
  debts?: Debt[];
  isPrivacyMode?: boolean;
  onNavigateTab?: (tab: string) => void;
  analytics?: TransactionAnalytics;
  onExportCsv?: (filters: Pick<TransactionQueryFilters, 'startDate' | 'endDateExclusive'>) => Promise<string>;
}

export function PfReportsView({
  transactions = [],
  accounts = [],
  assets = [],
  debts = [],
  isPrivacyMode = false,
  onNavigateTab,
  analytics,
  onExportCsv,
}: Props) {
  const [period, setPeriod] = useState<'este_mes' | 'mes_anterior' | '3m' | '6m' | 'ano_atual'>('este_mes');

  const pfTxs = transactions.filter(t => t.context === 'PF');

  // Filter transactions according to selected period
  const now = new Date();
  const currentYearMonth = now.toISOString().slice(0, 7);

  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevYearMonth = prevDate.toISOString().slice(0, 7);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsStr = threeMonthsAgo.toISOString().split('T')[0];

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsStr = sixMonthsAgo.toISOString().split('T')[0];

  const currentYearStr = now.getFullYear().toString();

  const filteredTxs = pfTxs.filter(t => {
    if (period === 'este_mes') return t.date.startsWith(currentYearMonth);
    if (period === 'mes_anterior') return t.date.startsWith(prevYearMonth);
    if (period === '3m') return t.date >= threeMonthsStr;
    if (period === '6m') return t.date >= sixMonthsStr;
    if (period === 'ano_atual') return t.date.startsWith(currentYearStr);
    return true;
  });

  const totalIncome = analytics ? Number(analytics.total_receipts_cents || 0) / 100 : filteredTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = analytics ? Number(analytics.total_expenses_cents || 0) / 100 : filteredTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRatePct = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0.0';

  // Category breakdown calculation
  const categoryTotals: Record<string, number> = {};
  if (analytics) {
    analytics.by_category.forEach(item => { categoryTotals[item.category] = Number(item.expenses_cents || 0) / 100; });
  } else {
    filteredTxs.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
  }

  const sortedCategories = Object.entries(categoryTotals)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      pct: totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.amount - a.amount);

  // Real Net Worth calculations
  const totalAssetsVal = assets.reduce((acc, a) => acc + a.value, 0) + accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalDebtsVal = debts.reduce((acc, d) => acc + d.totalBalance, 0);
  const netWorthVal = totalAssetsVal - totalDebtsVal;
  const hasData = Boolean(analytics && analytics.transaction_count > 0) || filteredTxs.length > 0 || assets.length > 0 || debts.length > 0;

  // Real CSV Export
  const handleExportCSV = async () => {
    if (onExportCsv) {
      const startDate = period === 'este_mes' ? `${currentYearMonth}-01` : period === 'mes_anterior' ? `${prevYearMonth}-01` : period === '3m' ? threeMonthsStr : period === '6m' ? sixMonthsStr : `${currentYearStr}-01-01`;
      const end = period === 'mes_anterior' ? new Date(`${currentYearMonth}-01T00:00:00`) : new Date(`${Number(currentYearStr) + 1}-01-01T00:00:00`);
      const csvContent = await onExportCsv({ startDate, endDateExclusive: end.toISOString().slice(0, 10) });
      if (!csvContent || csvContent.split('\n').length <= 1) { alert('Nenhum dado encontrado para o período selecionado.'); return; }
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AuraFin_Relatorio_PF_${period}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (filteredTxs.length === 0) {
      alert('Nenhum dado encontrado para o período selecionado.');
      return;
    }

    const headers = ['Data', 'Tipo', 'Descricao', 'Categoria', 'Valor (R$)'];
    const rows = filteredTxs.map(t => [
      t.date,
      t.type,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.amount.toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AuraFin_Relatorio_PF_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasData) {
    return <div className="space-y-8"><div><h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Relatórios PF</h1><p className="text-slate-500 mt-1">Nenhum dado disponível para o período selecionado.</p></div><div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">Nenhum dado disponível</div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
            Relatórios Financeiros & Inteligência
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            Analise receitas, despesas, taxa de economia e evolução patrimonial calculadas em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
          >
            <option value="este_mes">Este Mês</option>
            <option value="mes_anterior">Mês Anterior</option>
            <option value="3m">Últimos 3 Meses</option>
            <option value="6m">Últimos 6 Meses</option>
            <option value="ano_atual">Ano Atual</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard title="Entradas do Período" value={totalIncome} isPrivacyMode={isPrivacyMode} subtitle="Receitas registradas" />
        <MetricCard title="Saídas do Período" value={totalExpenses} isPrivacyMode={isPrivacyMode} subtitle="Despesas e pagamentos" />
        <MetricCard title="Resultado Líquido" value={netSavings} isPrivacyMode={isPrivacyMode} subtitle="Superávit do período" />
        <MetricCard title="Taxa de Poupança" value={Number(savingsRatePct)} prefix="" subtitle={`${savingsRatePct}% da renda poupada`} />
      </div>

      {/* Grid of Report Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: Relatório de Despesas por Categoria */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('planning')}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer shadow-xs space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-950">Despesas por Categoria</h3>
            <span className="text-xs font-bold text-indigo-600 flex items-center">Ver Orçamento <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></span>
          </div>

          {sortedCategories.length > 0 ? (
            <div className="space-y-2 text-xs font-mono">
              {sortedCategories.slice(0, 5).map(item => (
                <div key={item.category} className="flex justify-between">
                  <span className="font-sans text-slate-600 capitalize">{item.category}</span>
                  <span className="font-bold text-slate-900">
                    R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">Nenhuma despesa registrada no período selecionado.</p>
          )}
        </div>

        {/* Module 2: Relatório de Evolução Patrimonial */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('wealth')}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer shadow-xs space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-950">Balanço Patrimonial</h3>
            <span className="text-xs font-bold text-indigo-600 flex items-center">Ver Patrimônio <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="font-sans text-slate-600">Ativos & Disponibilidades</span>
              <span className="font-bold text-emerald-600">
                R$ {totalAssetsVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-slate-600">Passivos & Dívidas</span>
              <span className="font-bold text-rose-600">
                R$ {totalDebtsVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="font-sans font-bold text-slate-900">Patrimônio Líquido</span>
              <span className="font-black text-slate-950 text-sm">
                R$ {netWorthVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
