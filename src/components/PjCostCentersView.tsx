import { CostCenter } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, PieChart } from 'lucide-react';

interface PjCostCentersViewProps {
  costCenters?: CostCenter[];
  isPrivacyMode?: boolean;
}

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PjCostCentersView({ costCenters = [], isPrivacyMode = false }: PjCostCentersViewProps) {
  const budget = costCenters.reduce((sum, row) => sum + row.budgetAllocated, 0);

  if (costCenters.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white">Centros de Custo</h1>
            <p className="text-xs text-slate-300 mt-1">Gestão orçamentária por departamento ou unidade de negócio.</p>
          </div>
        </div>

        <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <PieChart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Nenhum centro de custo cadastrado</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">Defina centros de custo para alocar despesas e controlar limites orçamentários por área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Centros de Custo</h1>
          <p className="text-xs text-slate-300 mt-1">Orçamentos e alocações ativas da organização.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <MetricCard title="Centros ativos" value={costCenters.length} prefix="" subtitle="Áreas gerenciadas" />
        <MetricCard title="Orçamento Total" value={budget} isPrivacyMode={isPrivacyMode} subtitle="Limite consolidado" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {costCenters.map((row) => (
          <div key={row.id} className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
            <h3 className="font-bold text-white text-base">{row.name}</h3>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Orçamento alocado</span>
              <strong className="text-white font-mono">{money(row.budgetAllocated)}</strong>
            </div>
            <p className="text-xs text-slate-300">Controle contábil vinculado às transações da PJ.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
