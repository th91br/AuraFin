import { Shield, Umbrella, HeartPulse, GraduationCap, CreditCard, Activity, Lock } from 'lucide-react';
import { Asset, Transaction } from '../types';

interface Props {
  assets: Asset[];
  transactions: Transaction[];
}

export function PfPlanning({ assets, transactions }: Props) {
  // Cálculos simplificados baseados na entrada manual do MVP
  const emergencyCurrent = assets.filter(a => a.category === 'renda_fixa').reduce((acc, a) => acc + a.value, 0);
  const emergencyTarget = 30000; // Simulação de 6 meses de uma média de gasto de 5k
  const emergencyPercent = Math.min(100, Math.round((emergencyCurrent / emergencyTarget) * 100));

  return (
    <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inteligência e Futuro</h2>
          <p className="text-slate-500 mt-1 text-base">Seu planejamento de longo prazo, automatizado silenciosamente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Reserva de Emergência */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 border border-emerald-100">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Reserva de Segurança</h3>
            <p className="text-sm text-slate-500 mt-1.5 mb-8 leading-relaxed">Com base na sua média de vida atual (R$ 5k/mês), o ideal são 6 meses guardados.</p>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2.5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                R$ {emergencyCurrent.toLocaleString('pt-BR')}
              </span>
              <span className="text-sm font-medium text-slate-400 mb-1">
                / R$ {emergencyTarget.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  emergencyPercent < 30 ? 'bg-rose-500' : emergencyPercent < 70 ? 'bg-amber-400' : 'bg-emerald-500'
                }`} 
                style={{ width: `${emergencyPercent}%` }} 
              />
            </div>
            <p className={`text-xs font-semibold mt-3 ${
              emergencyPercent < 30 ? 'text-rose-600' : emergencyPercent < 70 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {emergencyPercent}% da meta atingida
            </p>
          </div>
        </div>

        {/* Painel IRPF Automático */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 border border-blue-100">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Pré-IRPF Automático</h3>
            <p className="text-sm text-slate-500 mt-1.5 mb-8 leading-relaxed">Despesas dedutíveis que você lançou, categorizadas para a Receita.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-semibold text-slate-700">Saúde</span>
              </div>
              <span className="text-sm font-bold text-slate-900">R$ 4.250,00</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">Educação</span>
              </div>
              <span className="text-sm font-bold text-slate-900">R$ 8.900,00</span>
            </div>
            <div className="pt-3 flex justify-between items-center px-1">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Total Dedutível</span>
              <span className="text-sm font-bold text-blue-600">R$ 13.150,00</span>
            </div>
          </div>
        </div>

        {/* Passivos e Proteção */}
        <div className="bg-slate-900 p-7 rounded-[2rem] shadow-lg flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
            <Umbrella className="w-40 h-40 text-white transform rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5 border border-white/10 backdrop-blur-md">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">Proteção & Passivos</h3>
            <p className="text-sm text-slate-400 mt-1.5 mb-8 leading-relaxed">Gestão centralizada de parcelamentos e apólices vigentes.</p>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-4 h-4 text-slate-300" />
                <span className="text-sm font-medium text-slate-200">MacBook Pro (7/10)</span>
              </div>
              <span className="text-sm font-bold text-white">- R$ 1.400,00</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Umbrella className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-200">Seguro de Vida</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg">Ativo</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
