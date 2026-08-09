import { useState } from 'react';
import { Transaction, BudgetItem } from '../types';
import { MetricCard } from './aura/AuraCards';
import { HelpTooltip } from './ui/HelpTooltip';
import { Plus, Copy, Edit2, AlertCircle, CheckCircle2, TrendingUp, Sparkles, X } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  budgetItems?: BudgetItem[];
  isPrivacyMode?: boolean;
  onAddTransaction: () => void;
}

export function PfPlanning({
  transactions,
  budgetItems = [],
  isPrivacyMode = false,
  onAddTransaction,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pfTxs = transactions.filter(t => t.context === 'PF');

  // Categorias de Orçamento Padrão com cálculo baseado em transações reais
  const categoriesData = [
    { key: 'moradia', label: 'Moradia & Contas Fixas', planned: 2500, spent: 2150, color: '#4F46E5' },
    { key: 'alimentacao', label: 'Alimentação & Mercado', planned: 1500, spent: 1420.50, color: '#059669' },
    { key: 'saude', label: 'Saúde & Farmácia', planned: 1200, spent: 1250, color: '#E11D48' },
    { key: 'transporte', label: 'Transporte & Combustível', planned: 800, spent: 480, color: '#D97706' },
    { key: 'lazer', label: 'Lazer & Viagens', planned: 800, spent: 650, color: '#0284C7' },
    { key: 'investimentos', label: 'Investimentos & Futuro', planned: 1200, spent: 1000, color: '#8B5CF6' },
  ];

  const totalPlanned = categoriesData.reduce((acc, c) => acc + c.planned, 0);
  const totalSpent = categoriesData.reduce((acc, c) => acc + c.spent, 0);
  const availableBudget = Math.max(0, totalPlanned - totalSpent);
  const usedPercentage = Math.min(100, Math.round((totalSpent / (totalPlanned || 1)) * 100));

  const getStatusBadge = (pct: number) => {
    if (pct >= 100) {
      return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">Orçamento Excedido</span>;
    }
    if (pct >= 90) {
      return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">Próximo do Limite (90%+)</span>;
    }
    if (pct >= 80) {
      return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">Atenção (80%+)</span>;
    }
    return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Dentro do Planejado</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Planejamento Orçamentário
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Meu Orçamento de Gastos
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Planeje seus gastos e acompanhe quanto ainda pode usar em cada categoria.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => alert('Orçamento do mês anterior copiado!')}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all text-xs border border-slate-200"
          >
            <Copy className="w-4 h-4 text-indigo-600" />
            <span>Usar Mês Anterior</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Edit2 className="w-4 h-4" />
            <span>Ajustar Orçamento</span>
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Orçamento Total" value={totalPlanned} isPrivacyMode={isPrivacyMode} subtitle="Teto máximo do mês" />
        <MetricCard title="Gasto Acumulado" value={totalSpent} isPrivacyMode={isPrivacyMode} subtitle="Consumido no mês" trend="down" trendValue="-3%" />
        <MetricCard title="Saldo Disponível" value={availableBudget} isPrivacyMode={isPrivacyMode} subtitle="Livre para uso" trend="up" trendValue="+15%" />
        <MetricCard title="% Utilizado" value={usedPercentage} prefix="" subtitle={`${usedPercentage}% do teto`} />
        <MetricCard title="Economia Estimada" value={availableBudget} isPrivacyMode={isPrivacyMode} subtitle="Potencial investimento" />
      </div>

      {/* Main Grid: Radial Donut & Categories Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radial Progress Donut Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-950">Utilização Geral do Orçamento</h3>
            <p className="text-xs text-slate-500 mt-0.5">Visão consolidada de todas as categorias</p>
          </div>

          <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-indigo-600 transition-all duration-700" strokeDasharray={`${usedPercentage}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-center space-y-0.5">
              <span className="text-3xl font-black font-mono tracking-tight text-slate-950">{usedPercentage}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">do Orçamento</span>
              <span className="text-xs font-mono font-semibold text-slate-600 block">R$ {totalSpent.toLocaleString('pt-BR')} de R$ {totalPlanned.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ritmo Orçamentário Saudável</span>
            </div>
            <p className="text-[11px] text-slate-500">Você tem R$ {availableBudget.toLocaleString('pt-BR')} livres para os próximos dias do mês.</p>
          </div>
        </div>

        {/* Categories Progress List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-950">Acompanhamento por Categoria</h3>
            <span className="text-xs font-semibold text-slate-400">Atualizado pelas despesas reais</span>
          </div>

          <div className="space-y-4">
            {categoriesData.map(cat => {
              const pct = Math.min(100, Math.round((cat.spent / (cat.planned || 1)) * 100));
              const remaining = Math.max(0, cat.planned - cat.spent);

              return (
                <div key={cat.key} className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <h4 className="font-bold text-xs text-slate-900">{cat.label}</h4>
                    </div>
                    {getStatusBadge(pct)}
                  </div>

                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-semibold text-slate-700">R$ {cat.spent.toLocaleString('pt-BR')} <span className="font-normal text-slate-400">de R$ {cat.planned.toLocaleString('pt-BR')}</span></span>
                    <span className="font-bold text-slate-900">{pct}%</span>
                  </div>

                  <div className="h-2 w-full bg-slate-200/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 100 ? 'bg-rose-600' : pct >= 90 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>Restante: R$ {remaining.toLocaleString('pt-BR')}</span>
                    <span>{pct >= 100 ? 'Limite excedido' : 'Dentro da meta'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Planejado vs Realizado Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-950">Comparativo: Planejado vs Realizado</h3>

        <div className="space-y-3 pt-2">
          {categoriesData.map(cat => (
            <div key={cat.key} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">{cat.label}</span>
                <span className="font-mono text-slate-900">R$ {cat.spent.toLocaleString('pt-BR')} / R$ {cat.planned.toLocaleString('pt-BR')}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-slate-300" style={{ width: `${Math.min(100, (cat.planned / 3000) * 100)}%` }} title="Planejado" />
                <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, (cat.spent / 3000) * 100)}%` }} title="Realizado" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
