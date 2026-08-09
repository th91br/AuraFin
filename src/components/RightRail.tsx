import React from 'react';
import { Transaction, Asset, Defaulter } from '../types';
import { VisualPaymentCard, ActivityRow } from './aura/AuraCards';
import { Plus, CreditCard, ArrowRightLeft, ShieldAlert, Bell, Sparkles } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface RightRailProps {
  mode: 'PF' | 'PJ';
  transactions: Transaction[];
  assets: Asset[];
  defaulters: Defaulter[];
  pendingReimbursementAmount: number;
  onOpenTransactionModal: () => void;
  onOpenBillingModal: () => void;
  onReimburseSocio: () => void;
  isPrivacyMode?: boolean;
}

export function RightRail({
  mode,
  transactions,
  defaulters,
  pendingReimbursementAmount,
  onOpenTransactionModal,
  onOpenBillingModal,
  onReimburseSocio,
}: RightRailProps) {
  const isPJ = mode === 'PJ';
  const modeTxs = transactions.filter(t => t.context === mode);

  return (
    <div className="space-y-6">
      
      {/* 1. Visual Payment Card Section ("Your cards") */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
            {isPJ ? 'Cartões Corporativos' : 'Meus Cartões'}
          </h3>
          <button 
            onClick={isPJ ? onOpenBillingModal : onOpenTransactionModal}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              isPJ ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700' : 'bg-slate-100 text-indigo-600 hover:bg-slate-200'
            }`}
            title="Novo Cartão"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <VisualPaymentCard
          cardName={isPJ ? 'AuraFin Business Black' : 'AuraFin Platinum'}
          cardNumberMasked="9123 3443 2132 4554"
          balance={isPJ ? 24500 : 2453}
          dueDate="09/28"
          isPJ={isPJ}
        />
      </div>

      {/* 2. Urgent Actions / Reembolsos Pendentes */}
      {pendingReimbursementAmount > 0 && (
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isPJ ? 'bg-amber-950/40 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <h4 className="font-bold text-xs">Aporte de Sócio a Reembolsar</h4>
          </div>
          <p className="text-[11px] font-mono font-bold">
            R$ {pendingReimbursementAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <button
            onClick={onReimburseSocio}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
          >
            Reembolsar em 1-Clique
          </button>
        </div>
      )}

      {/* 3. Atividades & Próximos Vencimentos List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
            Atividades Recentes
          </h3>
          <span className={`text-[10px] ${isPJ ? 'text-slate-500' : 'text-slate-400'}`}>Hoje</span>
        </div>

        <div className="space-y-2">
          {modeTxs.slice(0, 4).map(tx => (
            <ActivityRow
              key={tx.id}
              title={tx.title}
              subtitle={`${tx.date} • ${tx.category}`}
              amount={tx.amount}
              isIncome={tx.type === 'income'}
              isPJ={isPJ}
            />
          ))}
        </div>
      </div>

      {/* 4. Quick Insights Widget */}
      <div className={`p-4 rounded-2xl border space-y-2 ${
        isPJ ? 'bg-[#1E293B] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-700'
      }`}>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="font-bold text-xs">Insight AuraFin</h4>
        </div>
        <p className="text-[11px] leading-relaxed">
          {isPJ 
            ? 'Seu Runway atual cobre 180 dias de operação sem necessidade de aportes externos.'
            : 'Você já atingiu 74% da sua meta de Reserva de Emergência para este semestre.'}
        </p>
      </div>

    </div>
  );
}
