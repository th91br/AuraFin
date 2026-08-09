import { useState } from 'react';
import { MetricCard } from './aura/AuraCards';
import { HelpTooltip } from './ui/HelpTooltip';
import { ShieldCheck, Plus, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  isPrivacyMode?: boolean;
  onAddDeposit?: () => void;
}

export function PfEmergencyReserveView({ isPrivacyMode = false, onAddDeposit }: Props) {
  const [monthsTarget, setMonthsTarget] = useState<6 | 9 | 12>(6);
  const [monthlyLivingCost, setMonthlyLivingCost] = useState(4500);
  const [currentReserve, setCurrentReserve] = useState(28500);

  const idealReserve = monthlyLivingCost * monthsTarget;
  const remaining = Math.max(0, idealReserve - currentReserve);
  const monthsCovered = (currentReserve / (monthlyLivingCost || 1)).toFixed(1);
  const pct = Math.min(100, Math.round((currentReserve / (idealReserve || 1)) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded">
            Proteção Patrimonial & Segurança
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Reserva de Emergência
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Saiba por quanto tempo sua reserva consegue manter seu custo de vida em caso de imprevistos.
          </p>
        </div>

        <button
          onClick={onAddDeposit}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Aporte na Reserva</span>
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Reserva Atual Guardada" value={currentReserve} isPrivacyMode={isPrivacyMode} subtitle="Renda Fixa de Alta Liquidez" trend="up" trendValue="+5%" />
        <MetricCard title="Meta de Cobertura" value={idealReserve} isPrivacyMode={isPrivacyMode} subtitle={`Meta para ${monthsTarget} Meses`} />
        <MetricCard title="Meses Cobertos Real" value={Number(monthsCovered)} prefix="" subtitle="Custo de vida garantido" />
        <MetricCard title="Falta Guardar" value={remaining} isPrivacyMode={isPrivacyMode} subtitle="Para atingir 100% da meta" />
      </div>

      {/* Main Radial Progress Coverage Card */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-4 md:w-6/12">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-950">Cobertura de Segurança Financeira</h3>
            </div>

            <p className="text-3xl font-black tracking-tight text-slate-950 font-mono">
              {monthsCovered} Meses <span className="text-sm font-sans font-normal text-slate-500">de tranquilidade garantida</span>
            </p>

            <p className="text-xs text-slate-600 leading-relaxed">
              Com base no seu custo de vida mensal estimado em <strong className="font-mono">R$ {monthlyLivingCost.toLocaleString('pt-BR')}</strong>, sua reserva atual cobre completamente <strong className="font-mono">{monthsCovered} meses</strong> de despesas sem necessidade de novas receitas.
            </p>

            {/* Target Months Selector */}
            <div className="flex items-center space-x-2 pt-2">
              <span className="text-xs font-bold text-slate-500">Selecione o Alvo:</span>
              <button onClick={() => setMonthsTarget(6)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${monthsTarget === 6 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>6 Meses</button>
              <button onClick={() => setMonthsTarget(9)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${monthsTarget === 9 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>9 Meses</button>
              <button onClick={() => setMonthsTarget(12)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${monthsTarget === 12 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>12 Meses</button>
            </div>
          </div>

          {/* Radial Progress Visual */}
          <div className="relative w-48 h-48 mx-auto md:mx-0 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500 transition-all duration-700" strokeDasharray={`${pct}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-center space-y-0.5">
              <span className="text-4xl font-black font-mono tracking-tight text-slate-950">{pct}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">da Meta Ativa</span>
            </div>
          </div>

        </div>
      </div>

      {/* Cenários Comparativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-5 rounded-2xl border space-y-2 ${monthsTarget === 6 ? 'bg-emerald-50/60 border-emerald-300' : 'bg-white border-slate-200/80'}`}>
          <span className="text-xs font-bold text-slate-500 uppercase">Cenário 6 Meses</span>
          <p className="text-2xl font-black font-mono text-slate-950">R$ {(monthlyLivingCost * 6).toLocaleString('pt-BR')}</p>
          <span className="text-[11px] text-emerald-800 font-semibold block">Segurança recomendada padrão</span>
        </div>

        <div className={`p-5 rounded-2xl border space-y-2 ${monthsTarget === 9 ? 'bg-emerald-50/60 border-emerald-300' : 'bg-white border-slate-200/80'}`}>
          <span className="text-xs font-bold text-slate-500 uppercase">Cenário 9 Meses</span>
          <p className="text-2xl font-black font-mono text-slate-950">R$ {(monthlyLivingCost * 9).toLocaleString('pt-BR')}</p>
          <span className="text-[11px] text-slate-500 font-semibold block">Proteção estendida</span>
        </div>

        <div className={`p-5 rounded-2xl border space-y-2 ${monthsTarget === 12 ? 'bg-emerald-50/60 border-emerald-300' : 'bg-white border-slate-200/80'}`}>
          <span className="text-xs font-bold text-slate-500 uppercase">Cenário 12 Meses</span>
          <p className="text-2xl font-black font-mono text-slate-950">R$ {(monthlyLivingCost * 12).toLocaleString('pt-BR')}</p>
          <span className="text-[11px] text-slate-500 font-semibold block">Blindagem financeira total</span>
        </div>
      </div>

    </div>
  );
}
