import { useState } from 'react';
import { Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { BarChart3, Download, TrendingUp, TrendingDown, ArrowUpRight, Filter, FileSpreadsheet } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions?: Transaction[];
  isPrivacyMode?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export function PfReportsView({ transactions = [], isPrivacyMode = false, onNavigateTab }: Props) {
  const [period, setPeriod] = useState('este_mes');

  const totalIncome = 18500;
  const totalExpenses = 9850;
  const netSavings = totalIncome - totalExpenses;
  const savingsRatePct = ((netSavings / totalIncome) * 100).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Central Analítica PF
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Relatórios Financeiros & Inteligência
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Entenda como seu dinheiro, patrimônio e planejamento evoluem ao longo do tempo.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
          >
            <option value="este_mes">Este Mês</option>
            <option value="mes_anterior">Mês Anterior</option>
            <option value="3m">Últimos 3 Meses</option>
            <option value="6m">Últimos 6 Meses</option>
            <option value="12m">Últimos 12 Meses</option>
            <option value="ano_atual">Ano Atual (2026)</option>
          </select>

          <button
            onClick={() => alert('Relatório analítico exportado!')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Entradas Totais" value={totalIncome} isPrivacyMode={isPrivacyMode} subtitle="Receitas e Pró-labore" trend="up" trendValue="+8%" />
        <MetricCard title="Saídas Totais" value={totalExpenses} isPrivacyMode={isPrivacyMode} subtitle="Despesas e faturas" trend="down" trendValue="-4%" />
        <MetricCard title="Resultado do Período" value={netSavings} isPrivacyMode={isPrivacyMode} subtitle="Superávit financeiro" trend="up" trendValue="+15%" />
        <MetricCard title="Taxa de Economia %" value={Number(savingsRatePct)} prefix="" subtitle={`${savingsRatePct}% da renda poupada`} trend="up" trendValue="+2.5%" />
      </div>

      {/* Grid of Report Modules (Drill-down Clickable) */}
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

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="font-sans text-slate-600">Moradia & Contas</span>
              <span className="font-bold text-slate-900">R$ 2.150,00 (21.8%)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-slate-600">Alimentação & Mercado</span>
              <span className="font-bold text-slate-900">R$ 1.420,50 (14.4%)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-slate-600">Saúde & Farmácia</span>
              <span className="font-bold text-slate-900">R$ 1.250,00 (12.6%)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="font-sans">Outras Categorias (3)</span>
              <span>R$ 5.029,50 (51.2%)</span>
            </div>
          </div>
        </div>

        {/* Module 2: Relatório de Evolução Patrimonial */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('wealth')}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer shadow-xs space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-950">Evolução do Patrimônio Líquido</h3>
            <span className="text-xs font-bold text-indigo-600 flex items-center">Ver Patrimônio <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="font-sans text-slate-600">Ativos Totais</span>
              <span className="font-bold text-emerald-600">R$ 515.000,00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-slate-600">Passivos Totais</span>
              <span className="font-bold text-rose-600">R$ 165.000,00</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="font-sans font-bold text-slate-900">Patrimônio Líquido Real</span>
              <span className="font-black text-slate-950 text-sm">R$ 350.000,00</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
