import { useState } from 'react';
import { User, Building2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onFinish: (selectedMode: 'PF' | 'PJ') => void;
}

export function OnboardingModal({ isOpen, onFinish }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedContext, setSelectedContext] = useState<'PF' | 'PJ' | 'BOTH'>('BOTH');
  const [accountName, setAccountName] = useState('Conta Principal Nubank/Inter');
  const [monthlyCost, setMonthlyCost] = useState('5000');

  if (!isOpen) return null;

  const handleComplete = () => {
    onFinish(selectedContext === 'PJ' ? 'PJ' : 'PF');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-xl w-full text-white shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Progress Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
              {step}/4
            </div>
            <span className="font-extrabold text-sm tracking-wide text-white">Bem-vindo ao AuraFin</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Configuração Inicial Rápidas</span>
        </div>

        {/* STEP 1: QUEM VOCÊ QUER ORGANIZAR */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Quem você deseja organizar hoje?</h2>
              <p className="text-slate-400 text-xs mt-1">
                O AuraFin separa juridicamente suas finanças pessoais da empresa sem criar atrito.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setSelectedContext('PF')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedContext === 'PF' ? 'bg-slate-800 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <User className="w-6 h-6 text-indigo-400 mb-2" />
                <h3 className="font-bold text-sm text-white">Minha Vida (PF)</h3>
                <p className="text-[11px] text-slate-400 mt-1">Orçamento, metas e IRPF</p>
              </div>

              <div
                onClick={() => setSelectedContext('PJ')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedContext === 'PJ' ? 'bg-slate-800 border-sky-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building2 className="w-6 h-6 text-sky-400 mb-2" />
                <h3 className="font-bold text-sm text-white">Minha Empresa (PJ)</h3>
                <p className="text-[11px] text-slate-400 mt-1">DRE, faturamento e caixa</p>
              </div>

              <div
                onClick={() => setSelectedContext('BOTH')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedContext === 'BOTH' ? 'bg-slate-800 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                <h3 className="font-bold text-sm text-white">Ambos (PF + PJ)</h3>
                <p className="text-[11px] text-slate-400 mt-1">Conciliação com 1-clique</p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>Próximo Passo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: PRIMEIRA CONTA BANCÁRIA */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Cadastre sua primeira conta bancária</h2>
              <p className="text-slate-400 text-xs mt-1">
                Defina o nome da instituição financeira onde seu caixa fica movimentado.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">Nome da Conta / Banco:</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-bold text-sm text-white outline-none focus:border-slate-600"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3.5 bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Próximo Passo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CUSTO MENSAL APROXIMADO */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Qual seu custo mensal estimado?</h2>
              <p className="text-slate-400 text-xs mt-1">
                Utilizado para calibrar o Ponto de Equilíbrio e a Reserva de Emergência de segurança.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">Custo Estimado (R$ / Mês):</label>
              <input
                type="number"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono font-bold text-sm text-white outline-none focus:border-slate-600"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-2/3 py-3.5 bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Próximo Passo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DASHBOARD PRONTO */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Tudo pronto para começar!</h2>
              <p className="text-slate-400 text-xs mt-1">
                Sua sessão foi inicializada em ambiente 100% Local-First e seguro.
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-4 bg-slate-100 hover:bg-white text-slate-950 font-black text-sm rounded-xl transition-all shadow-md"
            >
              Entrar no Dashboard do AuraFin
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
