import { useState } from 'react';
import { MetricCard } from './aura/AuraCards';
import { Account, Transaction } from '../types';
import { ShieldCheck, Plus, Sparkles, CheckCircle2, Clock, Edit2, Loader2 } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  accounts?: Account[];
  transactions?: Transaction[];
  reserveAmount?: number;
  monthlyExpenseSetting?: number;
  targetMonthsSetting?: number;
  isPrivacyMode?: boolean;
  onSaveSettings?: (targetMonths: number, monthlyExpense: number, currentAmount: number) => Promise<void>;
  onAddDeposit?: () => void;
}

export function PfEmergencyReserveView({
  accounts = [],
  transactions = [],
  reserveAmount,
  monthlyExpenseSetting,
  targetMonthsSetting = 6,
  isPrivacyMode = false,
  onSaveSettings,
  onAddDeposit,
}: Props) {
  const [monthsTarget, setMonthsTarget] = useState<number>(targetMonthsSetting);
  const [isEditingBasis, setIsEditingBasis] = useState(false);

  // Real liquid balance from accounts of type 'poupanca' / 'investimento' / 'corrente'
  const pfAccounts = accounts.filter(a => a.context === 'PF');
  const liquidAccountsBalance = pfAccounts
    .filter(a => a.type === 'poupanca' || a.type === 'investimento' || a.type === 'corrente')
    .reduce((acc, a) => acc + a.balance, 0);

  const currentReserve = reserveAmount !== undefined && reserveAmount > 0 ? reserveAmount : liquidAccountsBalance;

  // Real average monthly expenses from transactions
  const pfExpenseTxs = transactions.filter(t => t.context === 'PF' && t.type === 'expense');
  const totalSpentAll = pfExpenseTxs.reduce((acc, t) => acc + t.amount, 0);
  const calculatedMonthlyExpense = totalSpentAll > 0 ? Math.round(totalSpentAll / Math.max(1, 1)) : 0;

  const effectiveMonthlyLivingCost = monthlyExpenseSetting !== undefined && monthlyExpenseSetting > 0
    ? monthlyExpenseSetting
    : calculatedMonthlyExpense > 0 ? calculatedMonthlyExpense : 3500;

  const [inputMonthlyCost, setInputMonthlyCost] = useState(effectiveMonthlyLivingCost.toString());
  const [isSaving, setIsSaving] = useState(false);

  const idealReserve = effectiveMonthlyLivingCost * monthsTarget;
  const remaining = Math.max(0, idealReserve - currentReserve);
  const monthsCovered = effectiveMonthlyLivingCost > 0 ? (currentReserve / effectiveMonthlyLivingCost).toFixed(1) : '0.0';
  const pct = idealReserve > 0 ? Math.min(100, Math.round((currentReserve / idealReserve) * 100)) : 0;

  const handleSaveLivingCost = async () => {
    const val = parseFloat(inputMonthlyCost);
    if (!val || val <= 0) return;
    setIsSaving(true);
    try {
      if (onSaveSettings) {
        await onSaveSettings(monthsTarget, val, currentReserve);
      }
      setIsEditingBasis(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectMonths = async (m: number) => {
    setMonthsTarget(m);
    if (onSaveSettings) {
      await onSaveSettings(m, effectiveMonthlyLivingCost, currentReserve);
    }
  };

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
            Saiba por quanto tempo sua reserva cobre seu custo de vida em caso de imprevistos.
          </p>
        </div>

        {onAddDeposit && (
          <button
            onClick={onAddDeposit}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Aporte na Reserva</span>
          </button>
        )}
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Reserva Guardada Real" value={currentReserve} isPrivacyMode={isPrivacyMode} subtitle="Contas de alta liquidez" trend="up" trendValue="+100%" />
        <MetricCard title="Meta de Cobertura" value={idealReserve} isPrivacyMode={isPrivacyMode} subtitle={`Meta para ${monthsTarget} Meses`} />
        <MetricCard title="Meses Cobertos" value={Number(monthsCovered)} prefix="" subtitle="Tranquilidade financeira" />
        <MetricCard title="Falta Guardar" value={remaining} isPrivacyMode={isPrivacyMode} subtitle="Para 100% da proteção" />
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

            <div className="text-xs text-slate-600 leading-relaxed space-y-1">
              <p>
                Custo de vida mensal base: <strong className="font-mono font-bold text-slate-900">R$ {effectiveMonthlyLivingCost.toLocaleString('pt-BR')}</strong>
                {!isEditingBasis && (
                  <button
                    onClick={() => setIsEditingBasis(true)}
                    className="ml-2 text-indigo-600 font-bold hover:underline inline-flex items-center space-x-0.5"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Ajustar custo base</span>
                  </button>
                )}
              </p>

              {isEditingBasis && (
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="number"
                    value={inputMonthlyCost}
                    onChange={(e) => setInputMonthlyCost(e.target.value)}
                    className="w-32 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900"
                  />
                  <button
                    onClick={handleSaveLivingCost}
                    disabled={isSaving}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => setIsEditingBasis(false)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* Target Months Selector */}
            <div className="flex items-center space-x-2 pt-2">
              <span className="text-xs font-bold text-slate-500">Meta Desejada:</span>
              {[3, 6, 9, 12, 18].map(m => (
                <button
                  key={m}
                  onClick={() => handleSelectMonths(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    monthsTarget === m ? 'bg-slate-950 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m} Meses
                </button>
              ))}
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

      {/* Cenários Comparativos Calculados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-5 rounded-2xl border space-y-2 transition-all ${monthsTarget === 6 ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200/80'}`}>
          <span className="text-xs font-bold text-slate-500 uppercase">Cenário 6 Meses (Padrão)</span>
          <p className="text-2xl font-black font-mono text-slate-950">R$ {(effectiveMonthlyLivingCost * 6).toLocaleString('pt-BR')}</p>
          <span className="text-[11px] text-emerald-800 font-semibold block">Segurança recomendada básica</span>
        </div>

        <div className={`p-5 rounded-2xl border space-y-2 transition-all ${monthsTarget === 9 ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200/80'}`}>
          <span className="text-xs font-bold text-slate-500 uppercase">Cenário 9 Meses (Protegido)</span>
          <p className="text-2xl font-black font-mono text-slate-950">R$ {(effectiveMonthlyLivingCost * 9).toLocaleString('pt-BR')}</p>
          <span className="text-[11px] text-slate-500 font-semibold block">Proteção estendida para autônomos</span>
        </div>

        <div className={`p-5 rounded-2xl border space-y-2 transition-all ${monthsTarget === 12 ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200/80'}`}>
          <span className="text-xs font-bold text-slate-500 uppercase">Cenário 12 Meses (Blindagem)</span>
          <p className="text-2xl font-black font-mono text-slate-950">R$ {(effectiveMonthlyLivingCost * 12).toLocaleString('pt-BR')}</p>
          <span className="text-[11px] text-slate-500 font-semibold block">Blindagem financeira conservadora</span>
        </div>
      </div>

    </div>
  );
}
