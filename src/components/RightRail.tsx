import { Transaction, Asset, Defaulter, CreditCard } from '../types';
import { VisualPaymentCard, ActivityRow } from './aura/AuraCards';
import { Plus, ShieldAlert } from 'lucide-react';

interface RightRailProps {
  mode: 'PF' | 'PJ';
  transactions: Transaction[];
  assets: Asset[];
  defaulters: Defaulter[];
  creditCards?: CreditCard[];
  pendingReimbursementAmount: number;
  onOpenTransactionModal: () => void;
  onOpenBillingModal: () => void;
  onReimburseSocio: () => void;
  isPrivacyMode?: boolean;
}

export function RightRail({
  mode,
  transactions,
  creditCards = [],
  pendingReimbursementAmount,
  onOpenTransactionModal,
  onOpenBillingModal,
  onReimburseSocio,
  isPrivacyMode = false,
}: RightRailProps) {
  const isPJ = mode === 'PJ';
  const modeTxs = transactions.filter((transaction) => transaction.context === mode);
  const card = creditCards.find((item) => item.context === mode);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isPJ ? 'text-slate-300' : 'text-slate-700'}`}>
            {isPJ ? 'Cartões Corporativos' : 'Meus Cartões'}
          </h3>
          <button
            onClick={isPJ ? onOpenBillingModal : onOpenTransactionModal}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              isPJ
                ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                : 'bg-slate-100 text-indigo-700 hover:bg-slate-200'
            }`}
            title="Cadastrar cartão"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {card ? (
          <VisualPaymentCard
            cardName={card.name}
            cardNumberMasked={`•••• •••• •••• ${card.lastFourDigits || '—'}`}
            balance={card.currentInvoice}
            dueDate={card.dueDay ? String(card.dueDay) : '—'}
            brand={card.brand}
            isPJ={isPJ}
          />
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 text-center text-xs text-slate-400">
            Nenhum cartão cadastrado
          </div>
        )}
      </div>

      {pendingReimbursementAmount > 0 && (
        <div
          className={`p-4 rounded-2xl border space-y-3 ${
            isPJ
              ? 'bg-amber-950/60 border-amber-500/30 text-amber-100'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <h4 className="font-bold text-xs">Aporte de sócio a reembolsar</h4>
          </div>
          <p className="text-xs font-mono font-bold">
            {isPrivacyMode
              ? '••••••'
              : pendingReimbursementAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <button
            onClick={onReimburseSocio}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            Reembolsar Sócio
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isPJ ? 'text-slate-300' : 'text-slate-700'}`}>
            Atividades recentes
          </h3>
        </div>
        {modeTxs.length ? (
          <div className="space-y-2">
            {modeTxs.slice(0, 4).map((tx) => (
              <ActivityRow
                key={tx.id}
                title={tx.title}
                subtitle={`${tx.date} • ${tx.category}`}
                amount={tx.amount}
                isIncome={tx.type === 'income'}
                isPJ={isPJ}
                isPrivacyMode={isPrivacyMode}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Nenhuma movimentação recente</p>
        )}
      </div>
    </div>
  );
}
