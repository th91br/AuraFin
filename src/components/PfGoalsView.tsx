import React, { useState } from 'react';
import { Goal } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Target, CheckCircle2, Sparkles, Trash2 } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';
import { GoalContributionModal } from './aura/GoalContributionModal';

interface Props {
  goals?: Goal[];
  isPrivacyMode?: boolean;
  onAddGoal: () => void;
  onContributeGoal?: (goalId: string, amount: number, notes?: string) => Promise<void>;
  onDeleteGoal?: (id: string) => void;
}

export function PfGoalsView({
  goals = [],
  isPrivacyMode = false,
  onAddGoal,
  onContributeGoal,
  onDeleteGoal,
}: Props) {
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<Goal | null>(null);

  const totalAccumulated = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const totalTarget = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const remainingTotal = Math.max(0, totalTarget - totalAccumulated);

  if (goals.length === 0) return <div className="space-y-8 animate-in fade-in duration-200"><div className="flex items-center justify-between border-b border-slate-200/60 pb-4"><div><h1 className="text-2xl font-black tracking-tight text-slate-950">Metas Financeiras</h1><p className="text-xs text-slate-500 mt-1">Objetivos reais do usuário autenticado.</p></div><button onClick={onAddGoal} className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs"><Plus className="w-4 h-4" />Nova meta</button></div><div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300"><Target className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-slate-500">Nenhum dado disponível</p></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
            Metas Financeiras
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            Defina objetivos, acompanhe seus aportes e saiba quanto poupar por mês.
          </p>
        </div>

        <button
          onClick={onAddGoal}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard title="Metas Ativas" value={goals.length} prefix="" subtitle="Objetivos em andamento" />
        <MetricCard title="Total Acumulado" value={totalAccumulated} isPrivacyMode={isPrivacyMode} subtitle="Guardado para metas" />
        <MetricCard title="Total Alvo Necessário" value={totalTarget} isPrivacyMode={isPrivacyMode} subtitle="Soma de todos os objetivos" />
        <MetricCard title="Falta Conquistar" value={remainingTotal} isPrivacyMode={isPrivacyMode} subtitle="Para atingir 100% dos planos" />
      </div>

      {/* Goal Cards Grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const pct = goal.targetAmount > 0 ? Math.min(100, Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100)) : 0;
            const remaining = Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0));
            const daysRemaining = Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
            const monthlySuggested = Math.round(remaining / monthsRemaining);

            return (
              <div
                key={goal.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {goal.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-950 mt-1">{goal.title}</h3>
                    <p className="text-[11px] text-slate-500">Alvo: {goal.targetDate} ({daysRemaining} dias restantes)</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-emerald-500" strokeDasharray={`${pct}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="absolute text-xs font-black font-mono">{pct}%</span>
                    </div>

                    {onDeleteGoal && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir a meta "${goal.title}"?`)) {
                            onDeleteGoal(goal.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                        title="Excluir Meta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <PrivacyText
                    value={goal.currentAmount || 0}
                    isPrivacyMode={isPrivacyMode}
                    className="text-2xl font-black font-mono text-slate-950 tracking-tight block"
                  />
                  <p className="text-xs text-slate-500 font-medium">
                    De R$ {goal.targetAmount.toLocaleString('pt-BR')} • Faltam R$ {remaining.toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Poupança sugerida:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    R$ {monthlySuggested.toLocaleString('pt-BR')}/mês
                  </span>
                </div>

                <button
                  onClick={() => setSelectedGoalForContribution(goal)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar Aporte nesta Meta</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950">Nenhuma meta cadastrada</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Transforme seus sonhos em planos. Crie metas com prazos e valores para acompanhar sua evolução.
            </p>
          </div>
          <button
            onClick={onAddGoal}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Meta</span>
          </button>
        </div>
      )}

      {/* Modal de Aporte na Meta */}
      <GoalContributionModal
        isOpen={!!selectedGoalForContribution}
        onClose={() => setSelectedGoalForContribution(null)}
        goal={selectedGoalForContribution}
        onContribute={async (goalId, amount, notes) => {
          if (onContributeGoal) {
            await onContributeGoal(goalId, amount, notes);
          }
        }}
      />

    </div>
  );
}
