import { 
  Plus, 
  ArrowRightLeft, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { ContextMode, Transaction, Asset, Defaulter } from '../types';
import { PrivacyText } from './ui/PrivacyText';
import { HelpTooltip } from './ui/HelpTooltip';

interface RightRailProps {
  mode: ContextMode;
  transactions: Transaction[];
  assets: Asset[];
  defaulters: Defaulter[];
  pendingReimbursementAmount: number;
  onOpenTransactionModal: () => void;
  onOpenBillingModal: () => void;
  onReimburseSocio: () => void;
}

export function RightRail({
  mode,
  transactions,
  assets,
  defaulters,
  pendingReimbursementAmount,
  onOpenTransactionModal,
  onOpenBillingModal,
  onReimburseSocio,
}: RightRailProps) {
  const isPJ = mode === 'PJ';
  const filteredTxs = transactions.filter(t => t.context === mode).slice(0, 4);

  return (
    <aside className="w-80 h-screen sticky top-0 flex flex-col border-l border-slate-200/80 bg-white text-slate-900 z-10 transition-all duration-300 overflow-y-auto scrollbar-none p-5 space-y-6">
      
      {/* Top Header Panel */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-700" />
          <h3 className="font-extrabold text-sm text-slate-900">
            {isPJ ? 'Painel Operacional PJ' : 'Painel Financeiro PF'}
          </h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
          isPJ ? 'bg-slate-900 text-white border-slate-800' : 'bg-indigo-50 text-indigo-900 border-indigo-200'
        }`}>
          {isPJ ? 'Corporativo' : 'Pessoal'}
        </span>
      </div>

      {/* Cross Reimbursement Card (Motor PF <-> PJ) */}
      {pendingReimbursementAmount > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-amber-800" />
            <h4 className="font-bold text-amber-900 text-xs">Aporte de Sócio Pendente</h4>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Você possui despesas da empresa pagas com dinheiro pessoal aguardando ressarcimento.
          </p>
          <div className="flex items-center justify-between font-mono pt-1">
            <span className="text-[11px] font-bold text-amber-900 font-sans">Valor Pendente:</span>
            <span className="text-sm font-black text-amber-900">
              R$ {pendingReimbursementAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={onReimburseSocio}
            className="w-full py-2.5 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
          >
            Reembolsar Sócio em 1-Clique
          </button>
        </div>
      )}

      {/* Quick Action Button */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Ação Rápida</span>
        {!isPJ ? (
          <button
            onClick={onOpenTransactionModal}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento Pessoal</span>
          </button>
        ) : (
          <button
            onClick={onOpenBillingModal}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-sm"
          >
            <Receipt className="w-4 h-4" />
            <span>Emitir Fatura / Pix PJ</span>
          </button>
        )}
      </div>

      {/* Recent Contextual Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
            Últimas Movimentações ({mode})
          </span>
        </div>

        <div className="space-y-2.5">
          {filteredTxs.map(t => (
            <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="truncate mr-2">
                <p className="font-bold text-slate-900 truncate">{t.title}</p>
                <p className="text-[10px] text-slate-500">{t.date}</p>
              </div>
              <span className={`font-mono font-bold shrink-0 ${t.type === 'income' ? 'text-emerald-700' : 'text-slate-900'}`}>
                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}

          {filteredTxs.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">Nenhum lançamento no modo {mode}.</p>
          )}
        </div>
      </div>

      {/* Security Footer Card */}
      <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span className="font-bold text-slate-900 text-xs">Segurança Patrimonial</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          O AuraFin separa juridicamente suas contas PF e PJ mantendo o motor de conciliação 100% local.
        </p>
      </div>

    </aside>
  );
}
