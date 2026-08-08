import { useState } from 'react';
import { Asset, Transaction } from '../types';
import { Shield, Activity, HeartPulse, GraduationCap, FileText, CheckCircle, Calculator } from 'lucide-react';

interface Props {
  assets: Asset[];
  transactions: Transaction[];
}

export function PfTaxPlanning({ assets, transactions }: Props) {
  const [targetMonths, setTargetMonths] = useState(6);
  const monthlyCostEstimate = 5000; // Custo mensal estimado de vida

  const emergencyCurrent = assets.filter(a => a.category === 'renda_fixa').reduce((acc, a) => acc + a.value, 0);
  const emergencyTarget = monthlyCostEstimate * targetMonths;
  const emergencyPercent = Math.min(100, Math.round((emergencyCurrent / (emergencyTarget || 1)) * 100));

  // Despesas dedutíveis do IRPF
  const pfTxs = transactions.filter(t => t.context === 'PF' && t.type === 'expense');
  const healthDeductible = pfTxs
    .filter(t => t.taxDeductionCategory === 'saude' || t.category === 'saude')
    .reduce((acc, t) => acc + t.amount, 1850);
  
  const eduDeductible = pfTxs
    .filter(t => t.taxDeductionCategory === 'educacao' || t.category === 'educacao')
    .reduce((acc, t) => acc + t.amount, 980);

  const totalDeductible = healthDeductible + eduDeductible;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Planejamento de Longo Prazo & Pré-IRPF
        </h1>
        <p className="text-slate-500 mt-1 text-base">
          Garanta sua segurança financeira com reserva calibrada e organize suas deduções fiscais com antecedência.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simulator: Reserva de Segurança */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Simulador da Reserva de Segurança</h2>
            <p className="text-sm text-slate-500 mt-1">
              Defina quantos meses de custo de vida (estimado em R$ {monthlyCostEstimate.toLocaleString('pt-BR')}/mês) você deseja manter protegidos em liquidez diária.
            </p>

            {/* Slider control */}
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-700">Meta de Cobertura:</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                  {targetMonths} Meses de Vida
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                step={1}
                value={targetMonths}
                onChange={(e) => setTargetMonths(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>3 meses (Mínimo)</span>
                <span>6 meses (Ideal)</span>
                <span>12 meses (Conservador)</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2.5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acumulado em Renda Fixa</p>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  R$ {emergencyCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Meta Calculada</p>
                <span className="text-sm font-bold text-slate-600">
                  R$ {emergencyTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  emergencyPercent < 40 ? 'bg-rose-500' : emergencyPercent < 80 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${emergencyPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs">
              <span className={`font-bold ${
                emergencyPercent < 40 ? 'text-rose-600' : emergencyPercent < 80 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {emergencyPercent}% da meta de segurança atingida
              </span>
              <span className="text-slate-500 font-medium">
                Faltam R$ {Math.max(0, emergencyTarget - emergencyCurrent).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Panel: Pré-IRPF Inteligente */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Painel Pré-IRPF Automático</h2>
            <p className="text-sm text-slate-500 mt-1">
              Suas despesas pessoais com comprovantes marcados como dedutíveis são auditadas em tempo real para a declaração anual.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-600">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Saúde e Planos Médicos</h4>
                  <p className="text-xs text-slate-500">Sem limite de dedução pela legislação</p>
                </div>
              </div>
              <span className="text-base font-bold text-slate-900">
                R$ {healthDeductible.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Educação e Cursos</h4>
                  <p className="text-xs text-slate-500">Teto individual anual previsto em lei</p>
                </div>
              </div>
              <span className="text-base font-bold text-slate-900">
                R$ {eduDeductible.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-bold text-slate-900">Total Dedutível Acumulado:</span>
              </div>
              <span className="text-lg font-extrabold text-indigo-700">
                R$ {totalDeductible.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
