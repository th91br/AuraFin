import { useState } from 'react';
import { CostCenter } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, PieChart, Layers, ArrowUpRight, Filter } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  costCenters?: CostCenter[];
  isPrivacyMode?: boolean;
}

export function PjCostCentersView({ costCenters = [], isPrivacyMode = false }: Props) {
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);

  const centers = [
    { id: 'cc1', name: 'Tecnologia & Infraestrutura', budgetAllocated: 6000, totalSpent: 4500, pct: 32, color: '#0891B2' },
    { id: 'cc2', name: 'Pró-labore & Sócios', budgetAllocated: 8500, totalSpent: 8500, pct: 60, color: '#4338CA' },
    { id: 'cc3', name: 'Marketing & Vendas', budgetAllocated: 3000, totalSpent: 2260, pct: 16, color: '#10B981' },
    { id: 'cc4', name: 'Administrativo & Jurídico', budgetAllocated: 2000, totalSpent: 1450, pct: 10, color: '#F43F5E' },
  ];

  const totalSpentAll = centers.reduce((acc, c) => acc + c.totalSpent, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Classificação & Alocação de Custos
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Centros de Custo
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Entenda quais áreas da empresa consomem mais recursos operacionais.
          </p>
        </div>

        <button
          onClick={() => alert('Formulário de novo centro de custo')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Centro de Custo</span>
        </button>
      </div>

      {/* Top 4 KPIs Centros de Custo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Despesa Total Operacional" value={totalSpentAll} isPrivacyMode={isPrivacyMode} subtitle="Alocado nos centros" />
        <MetricCard title="Maior Centro de Custo" value={8500} isPrivacyMode={isPrivacyMode} subtitle="Pró-labore & Sócios" />
        <MetricCard title="Variação Mensal" value={2.1} isPrivacyMode={isPrivacyMode} prefix="-" subtitle="Economia de despesas" trend="down" trendValue="-2.1%" />
        <MetricCard title="Centros de Custo Ativos" value={centers.length} isPrivacyMode={isPrivacyMode} subtitle="Áreas mapeadas" />
      </div>

      {/* Grid de Centros de Custo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {centers.map(c => {
          const pctAllocated = Math.min(100, Math.round((c.totalSpent / (c.budgetAllocated || 1)) * 100));

          return (
            <div key={c.id} className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <h3 className="font-bold text-base text-white">{c.name}</h3>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {pctAllocated}% do orçado
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Gasto Atual:</span>
                  <span className="font-bold text-white">R$ {c.totalSpent.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Orçamento Alocado:</span>
                  <span>R$ {c.budgetAllocated.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pctAllocated}%`, backgroundColor: c.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
