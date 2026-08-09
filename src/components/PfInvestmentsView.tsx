import { useState } from 'react';
import { MetricCard } from './aura/AuraCards';
import { Plus, TrendingUp, PieChart, Landmark, ShieldCheck, ArrowUpRight, DollarSign } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  isPrivacyMode?: boolean;
  onAddInvestment?: () => void;
}

export function PfInvestmentsView({ isPrivacyMode = false, onAddInvestment }: Props) {
  const [selectedClass, setSelectedClass] = useState<string>('todas');

  const investments = [
    { id: 'i1', name: 'Tesouro Selic 2029', classType: 'Renda Fixa', institution: 'NuInvest', invested: 25000, currentValue: 27850, yieldPct: '+11.4%' },
    { id: 'i2', name: 'CDB 110% CDI Liquidez', classType: 'Renda Fixa', institution: 'Banco Sofisa', invested: 15000, currentValue: 16420, yieldPct: '+9.47%' },
    { id: 'i3', name: 'IVVB11 (S&P 500 ETF)', classType: 'ETFs', institution: 'BTG Pactual', invested: 18000, currentValue: 21500, yieldPct: '+19.4%' },
    { id: 'i4', name: 'Carteira Ações Dividendos', classType: 'Ações', institution: 'XP Investimentos', invested: 12000, currentValue: 13800, yieldPct: '+15.0%' },
  ];

  const totalInvested = investments.reduce((acc, i) => acc + i.invested, 0);
  const totalCurrent = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalProfit = totalCurrent - totalInvested;
  const yieldPctOverall = `+${((totalProfit / (totalInvested || 1)) * 100).toFixed(2)}%`;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Carteira & Performance
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Investimentos
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Acompanhe seus investimentos e veja como seu patrimônio está alocado.
          </p>
        </div>

        <button
          onClick={onAddInvestment}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Investimento</span>
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Aplicado" value={totalInvested} isPrivacyMode={isPrivacyMode} subtitle="Custo histórico acumulado" />
        <MetricCard title="Valor Atual da Carteira" value={totalCurrent} isPrivacyMode={isPrivacyMode} subtitle="Posição consolidada hoje" trend="up" trendValue="+8.2%" />
        <MetricCard title="Resultado Absoluto" value={totalProfit} isPrivacyMode={isPrivacyMode} subtitle="Lucro acumulado líquido" trend="up" trendValue={yieldPctOverall} />
        <MetricCard title="Rentabilidade Global" value={Number(yieldPctOverall.replace('+', '').replace('%', ''))} prefix="" subtitle="Retorno ponderado total" trend="up" trendValue={yieldPctOverall} />
      </div>

      {/* Main Table of Assets */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-950">Ativos & Posições</h3>
          <span className="text-xs text-slate-500 font-medium">Visão gerencial sem home broker</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ativo</th>
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-4">Instituição</th>
                <th className="py-3 px-4 text-right">Aplicado</th>
                <th className="py-3 px-4 text-right">Valor Atual</th>
                <th className="py-3 px-4 text-right">Retorno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {investments.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{inv.name}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-500">{inv.classType}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-500">{inv.institution}</td>
                  <td className="py-3.5 px-4 text-right text-slate-700">R$ {inv.invested.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-950">R$ {inv.currentValue.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">{inv.yieldPct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
