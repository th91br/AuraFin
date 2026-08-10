import { useState } from 'react';
import { MetricCard } from './aura/AuraCards';
import { HelpCircle, Sliders, RefreshCw, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  isPrivacyMode?: boolean;
}

export function PjBreakEvenView({ isPrivacyMode = false }: Props) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [costMultiplier, setCostMultiplier] = useState(1.0); // 1.0 ou 1.1 (+10%)
  const [revenueMultiplier, setRevenueMultiplier] = useState(1.0); // 1.0 ou 0.9 (-10%)

  const baseFixedCosts = 14170; // Despesas + Pró-labore + Impostos
  const baseRevenue = 37000;
  const contribMarginPct = 0.878;

  const currentFixedCosts = baseFixedCosts * costMultiplier;
  const currentRevenue = baseRevenue * revenueMultiplier;
  const breakEvenPoint = Math.round(currentFixedCosts / contribMarginPct);
  const safetyMargin = currentRevenue - breakEvenPoint;
  const pctAboveBreakEven = Math.round((safetyMargin / (breakEvenPoint || 1)) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Análise de Ponto de Equilíbrio
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1 flex items-center space-x-2">
            <span>Ponto de Equilíbrio</span>
            <span className="text-xs text-slate-400 font-mono font-medium">(Break-even)</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Descubra quanto sua empresa precisa faturar para cobrir sua estrutura de custos atual.
          </p>
        </div>

        {/* Action Toggle Simulation */}
        <div className="flex items-center space-x-3">
          {isSimulating && (
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Modo Simulação Ativo
            </span>
          )}
          <button
            onClick={() => {
              if (isSimulating) {
                setCostMultiplier(1.0);
                setRevenueMultiplier(1.0);
                setIsSimulating(false);
              } else {
                setIsSimulating(true);
              }
            }}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              isSimulating ? 'bg-amber-950/80 text-amber-300 border-amber-700' : 'bg-slate-900 text-slate-200 border-white/10 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>{isSimulating ? 'Restaurar Dados Reais' : 'Simular Cenários'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPIs Break-even */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Ponto de Equilíbrio" value={breakEvenPoint} isPrivacyMode={isPrivacyMode} subtitle="Faturamento mínimo necessário" />
        <MetricCard title="Faturamento Atual" value={currentRevenue} isPrivacyMode={isPrivacyMode} subtitle="Mês Atual" trend="up" trendValue="+18.4%" />
        <MetricCard title="Margem de Segurança" value={safetyMargin} isPrivacyMode={isPrivacyMode} subtitle="Folga operacional em Reais" trend="up" trendValue={`+${pctAboveBreakEven}%`} />
        <MetricCard title="Custos Estruturais" value={currentFixedCosts} isPrivacyMode={isPrivacyMode} subtitle="Fixos + Pró-labore" />
      </div>

      {/* Régua Didática de Break-even */}
      <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 space-y-6 shadow-xs">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-white">Posicionamento Operacional vs. Equilíbrio</h3>
            <p className="text-xs text-slate-400">Você está R$ {safetyMargin.toLocaleString('pt-BR')} acima do ponto de equilíbrio ({pctAboveBreakEven}% de folga).</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800 flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Operação Saudável
          </span>
        </div>

        {/* Visual Progress Track */}
        <div className="space-y-2 font-mono">
          <div className="flex justify-between text-xs text-slate-400 font-sans">
            <span>R$ 0,00</span>
            <span className="text-amber-400 font-bold">Ponto de Equilíbrio: R$ {breakEvenPoint.toLocaleString('pt-BR')}</span>
            <span className="text-emerald-400 font-bold">Faturamento: R$ {currentRevenue.toLocaleString('pt-BR')}</span>
          </div>

          <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden relative border border-white/10">
            {/* Range do Equilibrio */}
            <div className="h-full bg-amber-500/30 border-r border-amber-400 absolute left-0" style={{ width: '43.6%' }} />
            {/* Range do Faturamento Atual */}
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Controles de Simulação (Visíveis quando Simulação ativa) */}
      {isSimulating && (
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-amber-500/40 space-y-4">
          <h4 className="font-bold text-sm text-amber-300 flex items-center space-x-2">
            <Sliders className="w-4 h-4" />
            <span>Simulador de Estresse Operacional</span>
          </h4>
          <p className="text-xs text-slate-400">Ajuste os cenários hipotéticos sem alterar os dados reais da empresa.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Variação dos Custos Fixos:</label>
              <div className="flex space-x-2">
                <button onClick={() => setCostMultiplier(1.0)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${costMultiplier === 1.0 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Normal</button>
                <button onClick={() => setCostMultiplier(1.1)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${costMultiplier === 1.1 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}>+10% Custos</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Variação do Faturamento:</label>
              <div className="flex space-x-2">
                <button onClick={() => setRevenueMultiplier(1.0)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${revenueMultiplier === 1.0 ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Normal</button>
                <button onClick={() => setRevenueMultiplier(0.9)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${revenueMultiplier === 0.9 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}>-10% Receita</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
