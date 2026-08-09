import React, { useState } from 'react';
import { Goal } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Target, CheckCircle2, Calendar, Sparkles, ArrowRight, X } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  goals?: Goal[];
  isPrivacyMode?: boolean;
  onAddGoal: () => void;
}

export function PfGoalsView({ goals = [], isPrivacyMode = false, onAddGoal }: Props) {
  const [filter, setFilter] = useState<'todas' | 'ativas' | 'concluidas'>('ativas');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const defaultGoals: Goal[] = [
    { id: 'g1', title: 'Viagem de Férias Europa', targetAmount: 25000, currentAmount: 18500, targetDate: '2026-12-15', category: 'viagem' },
    { id: 'g2', title: 'Reserva de Emergência 6M', targetAmount: 30000, currentAmount: 28500, targetDate: '2026-10-01', category: 'investimento' },
    { id: 'g3', title: 'Entrada de Imóvel Próprio', targetAmount: 120000, currentAmount: 45000, targetDate: '2027-06-30', category: 'casa' },
    { id: 'g4', title: 'Troca de Veículo', targetAmount: 80000, currentAmount: 32000, targetDate: '2027-01-15', category: 'veiculo' },
  ];

  const displayGoals = goals.length > 0 ? goals : defaultGoals;

  const totalAccumulated = displayGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = displayGoals.reduce((acc, g) => acc + g.targetAmount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Objetivos de Vida
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Metas Financeiras
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Transforme seus objetivos em planos claros e acompanhe cada avanço.
          </p>
        </div>

        <button
          onClick={onAddGoal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Metas Ativas" value={displayGoals.length} prefix="" subtitle="Objetivos em andamento" />
        <MetricCard title="Total Acumulado" value={totalAccumulated} isPrivacyMode={isPrivacyMode} subtitle="Guardado para metas" trend="up" trendValue="+14%" />
        <MetricCard title="Total Alvo Necessário" value={totalTarget} isPrivacyMode={isPrivacyMode} subtitle="Soma de todos os objetivos" />
        <MetricCard title="Contribuição Sugerida" value={2150} isPrivacyMode={isPrivacyMode} subtitle="Recomendado por mês" />
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayGoals.map(goal => {
          const pct = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const monthlySuggested = Math.round(remaining / 8);

          return (
            <div
              key={goal.id}
              onClick={() => setSelectedGoal(goal)}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all cursor-pointer space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {goal.category}
                  </span>
                  <h3 className="font-bold text-base text-slate-950 mt-1">{goal.title}</h3>
                </div>

                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-500" strokeDasharray={`${pct}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-xs font-black font-mono">{pct}%</span>
                </div>
              </div>

              <div>
                <PrivacyText
                  value={goal.currentAmount}
                  isPrivacyMode={isPrivacyMode}
                  className="text-2xl font-black font-mono text-slate-950 tracking-tight block"
                />
                <p className="text-xs text-slate-500 font-medium">De R$ {goal.targetAmount.toLocaleString('pt-BR')} • Faltam R$ {remaining.toLocaleString('pt-BR')}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center text-xs">
                <span className="text-slate-500">Contribuição sugerida:</span>
                <span className="font-mono font-bold text-emerald-700">R$ {monthlySuggested.toLocaleString('pt-BR')}/mês</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
