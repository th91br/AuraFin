import { useState } from 'react';
import { Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { ArrowRightLeft, ShieldCheck, CheckCircle2, RotateCcw, FileText, AlertTriangle } from 'lucide-react';
import { HelpTooltip } from './ui/HelpTooltip';

interface Props {
  transactions: Transaction[];
  onReimburseSocio: () => void;
  isPrivacyMode?: boolean;
  isPJ?: boolean;
}

export function PfPjReconciliation({ transactions, onReimburseSocio, isPrivacyMode = false, isPJ = false }: Props) {
  const [selectedType, setSelectedType] = useState<string>('todos');

  // Transações pagas com dinheiro pessoal para a empresa
  const paidByPf = transactions.filter(t => t.context === 'PJ' && t.isPaidByPF);
  const paidByPfPending = paidByPf.filter(t => !t.reimbursed);
  const paidByPfPendingTotal = paidByPfPending.reduce((acc, t) => acc + t.amount, 0);

  // Transações de uso pessoal pagas na conta PJ
  const personalInPj = transactions.filter(t => t.context === 'PJ' && t.isPersonalExpenseInPJ);
  const personalInPjTotal = personalInPj.reduce((acc, t) => acc + t.amount, 0);

  // Pró-labore cruzado
  const prolaboreCross = transactions.filter(t => t.crossContextId && t.category === 'prolabore_pago');
  const prolaboreTotal = prolaboreCross.reduce((acc, t) => acc + t.amount, 0);

  const netCrossBalance = paidByPfPendingTotal - personalInPjTotal;

  const filteredItems = transactions.filter(t => {
    if (selectedType === 'todos') return t.isPaidByPF || t.isPersonalExpenseInPJ || t.crossContextId;
    if (selectedType === 'pj_paid_by_pf') return t.isPaidByPF;
    if (selectedType === 'pf_paid_by_pj') return t.isPersonalExpenseInPJ;
    if (selectedType === 'prolabore') return t.category === 'salario_prolabore' || t.category === 'prolabore_pago';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded ${
              isPJ ? 'bg-slate-800 text-white' : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
            }`}>
              Motor Híbrido PF ↔ PJ
            </span>
            <HelpTooltip term="Conciliação Cruzada" explanation="O motor de conciliação separa juridicamente PF e PJ, mas detecta automaticamente quando o sócio paga uma despesa da empresa ou usa a conta PJ para uso pessoal, permitindo o acerto em 1 clique." />
          </div>
          <h1 className={`text-2xl font-black tracking-tight mt-1.5 ${isPJ ? 'text-white' : 'text-slate-950'}`}>
            Central de Conciliações Cruzadas
          </h1>
          <p className={`text-xs mt-0.5 ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
            Gestão de reembolsos, acertos de aportes, pró-labore e distribuição de lucros sem confusão patrimonial.
          </p>
        </div>

        {paidByPfPendingTotal > 0 && (
          <button
            onClick={onReimburseSocio}
            className="flex items-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-xs"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Reembolsar R$ {paidByPfPendingTotal.toLocaleString('pt-BR')} em 1-Clique</span>
          </button>
        )}
      </div>

      {/* Top KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Pago pela PF para Empresa"
          value={paidByPfPendingTotal}
          isPrivacyMode={isPrivacyMode}
          subtitle={`${paidByPfPending.length} despesa(s) a ressarcir`}
          isPJ={isPJ}
        />

        <MetricCard
          title="Uso Pessoal Pago na PJ"
          value={personalInPjTotal}
          isPrivacyMode={isPrivacyMode}
          subtitle="Ajustado como Pró-labore"
          isPJ={isPJ}
        />

        <MetricCard
          title="Pró-labore Cruzado Mês"
          value={prolaboreTotal || 8500}
          isPrivacyMode={isPrivacyMode}
          subtitle="Vínculo PF ↔ PJ confirmado"
          isPJ={isPJ}
        />

        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          netCrossBalance >= 0 
            ? isPJ ? 'bg-[#172033] border-emerald-500/20 text-white' : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
            : isPJ ? 'bg-[#172033] border-rose-500/20 text-white' : 'bg-rose-50/60 border-rose-200 text-rose-950'
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">Saldo Cruzado a Ajustar</span>
          <p className="text-2xl font-black font-mono tracking-tight mt-1">
            R$ {netCrossBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] font-semibold mt-1">
            {netCrossBalance >= 0 ? 'Empresa deve ao Sócio' : 'Sócio deve à Empresa'}
          </span>
        </div>
      </div>

      {/* Main Content & Filter Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Center List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200/60 pb-2">
            <button
              onClick={() => setSelectedType('todos')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedType === 'todos' ? 'bg-slate-950 text-white' : isPJ ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os Cruzamentos
            </button>
            <button
              onClick={() => setSelectedType('pj_paid_by_pf')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedType === 'pj_paid_by_pf' ? 'bg-slate-950 text-white' : isPJ ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Despesa PJ Paga por PF ({paidByPfPending.length})
            </button>
            <button
              onClick={() => setSelectedType('pf_paid_by_pj')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedType === 'pf_paid_by_pj' ? 'bg-slate-950 text-white' : isPJ ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Despesa PF Paga por PJ ({personalInPj.length})
            </button>
          </div>

          <div className="space-y-3">
            {filteredItems.map(item => (
              <div key={item.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                isPJ ? 'bg-[#172033] border-white/5 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    {item.isPaidByPF && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded">
                        {item.reimbursed ? 'Reembolsado' : 'Aporte do Sócio Pendente'}
                      </span>
                    )}
                    {item.isPersonalExpenseInPJ && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded">
                        Gasto Pessoal na PJ
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>{item.date} • Categoria: {item.category}</p>
                </div>

                <div className="text-right font-mono">
                  <span className="text-base font-bold">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Rail Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-6 rounded-2xl border space-y-4 ${
            isPJ ? 'bg-[#172033] border-white/5 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
          }`}>
            <h3 className="font-bold text-sm tracking-tight flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Proteção Contra Confusão Patrimonial</span>
            </h3>

            <p className={`text-xs leading-relaxed ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
              O AuraFin registra o histórico de aportes e liquidações cruzadas com data e valor exatos para fins de auditoria contábil.
            </p>

            {paidByPfPendingTotal > 0 && (
              <button
                onClick={onReimburseSocio}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Liquidar Reembolso em 1-Clique
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
