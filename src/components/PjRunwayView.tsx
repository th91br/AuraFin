import { useState } from 'react';
import { MetricCard } from './aura/AuraCards';
import { HelpCircle, ShieldCheck, AlertTriangle, Sliders, Clock, Flame } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  isPrivacyMode?: boolean;
}

export function PjRunwayView({ isPrivacyMode = false }: Props) {
  const [scenario, setScenario] = useState<'normal' | 'zero_revenue' | 'minus_25'>('normal');

  const currentCash = 53330;
  const baseBurnRate = 9190; // Despesas fixas + pró-labore

  const effectiveBurn = scenario === 'zero_revenue' ? baseBurnRate : scenario === 'minus_25' ? baseBurnRate * 1.1 : baseBurnRate;
  const monthsRunway = (currentCash / (effectiveBurn || 1)).toFixed(1);
  const daysRunway = Math.round(Number(monthsRunway) * 30);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Disponibilidade & Sobrevivência
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1 flex items-center space-x-2">
            <span>Runway de Caixa</span>
            <div className="group relative cursor-pointer">
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 border border-white/10 text-[11px] text-slate-300 rounded-xl shadow-xl z-50 font-normal">
                Runway representa o tempo em meses e dias que a empresa consegue manter suas portas abertas pagando todas as contas fixas em um cenário hipotético sem novas entradas.
              </div>
            </div>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Veja por quanto tempo o caixa da empresa sustenta a operação sem novas entradas.
          </p>
        </div>

        {/* Cenários Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-white/10">
          <button onClick={() => setScenario('normal')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${scenario === 'normal' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Cenário Normal</button>
          <button onClick={() => setScenario('minus_25')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${scenario === 'minus_25' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}>Simulação: Receita -25%</button>
          <button onClick={() => setScenario('zero_revenue')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${scenario === 'zero_revenue' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}>Simulação: Receita Zero</button>
        </div>
      </div>

      {/* Top 4 KPIs Runway */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Caixa Disponível Real" value={currentCash} isPrivacyMode={isPrivacyMode} subtitle="Soma das contas PJ" />
        <MetricCard title="Burn Mensal de Referência" value={effectiveBurn} isPrivacyMode={isPrivacyMode} subtitle="Queima de caixa por mês" trend="down" trendValue="-2.4%" />
        <MetricCard title="Runway em Meses" value={Number(monthsRunway)} isPrivacyMode={isPrivacyMode} prefix="" subtitle="Cobertura estimada" trend="up" trendValue="5.8m" />
        <MetricCard title="Runway em Dias" value={daysRunway} isPrivacyMode={isPrivacyMode} prefix="" subtitle="Dias de operação sem novas receitas" />
      </div>

      {/* Card Principal Didático de Runway */}
      <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 space-y-6 shadow-xs">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-white">Cobertura do Caixa Empresarial</h3>
            <p className="text-xs text-slate-400">Seu caixa de R$ {currentCash.toLocaleString('pt-BR')} cobre <strong>{monthsRunway} meses ({daysRunway} dias)</strong> de despesas operacionais.</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Cobertura Confortável (5.8 Meses)
          </span>
        </div>

        {/* Timeline Visual de Autonomia */}
        <div className="p-4 bg-slate-900 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex justify-between text-slate-400 font-sans">
            <span>Hoje (Caixa: R$ {currentCash.toLocaleString('pt-BR')})</span>
            <span className="text-cyan-400 font-bold">Autonomia Total: {daysRunway} Dias</span>
          </div>

          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '100%' }} />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-sans pt-1">
            <span>Mês 1 (R$ 44.140)</span>
            <span>Mês 3 (R$ 25.760)</span>
            <span>Mês 5.8 (R$ 0,00)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
