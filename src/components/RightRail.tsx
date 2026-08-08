import { useState } from 'react';
import { ContextMode, Transaction, Asset, Defaulter } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ArrowRightLeft, 
  ShieldCheck, 
  Plus, 
  FileText, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';

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

  // PF Checklist State
  const [checklist, setChecklist] = useState([
    { id: '1', label: 'Conferir recibo do Plano de Saúde para IRPF', done: true },
    { id: '2', label: 'Separar aporte mensal no Tesouro Selic', done: false },
    { id: '3', label: 'Revisar orçamento do mês em Alimentação', done: true },
    { id: '4', label: 'Verificar cotação FIPE do veículo', done: false },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const totalAssetsValue = assets.reduce((acc, a) => acc + a.value, 0);

  return (
    <aside className={`w-80 h-screen sticky top-0 flex flex-col border-l transition-colors duration-300 overflow-y-auto scrollbar-none select-none z-20 ${
      isPJ 
        ? 'bg-slate-900 text-slate-100 border-slate-800' 
        : 'bg-white text-slate-900 border-slate-200 shadow-sm'
    }`}>
      <div className="p-6 space-y-6">
        
        {/* Header Widget Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className={`w-4 h-4 ${isPJ ? 'text-sky-400' : 'text-indigo-600'}`} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {isPJ ? 'Painel de Operações PJ' : 'Painel de Insights PF'}
            </h3>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            isPJ ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            Sessão Ativa
          </span>
        </div>

        {/* MODO PF CONTENT */}
        {!isPJ ? (
          <>
            {/* Net Worth Summary Box (Matte Card) */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-300 font-medium">
                <span>Patrimônio Líquido Estimado</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-2xl font-extrabold tracking-tight">
                R$ {(7052.45 + totalAssetsValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h4>
              <p className="text-[11px] text-slate-400">
                {assets.length} bens imobilizados e financeiros rastreados.
              </p>
            </div>

            {/* Checklist Pessoal (Matte Box) */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Checklist Pessoal</h4>
                <span className="text-xs text-indigo-700 font-bold">
                  {checklist.filter(c => c.done).length}/{checklist.length}
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-start space-x-2.5 cursor-pointer group text-xs transition-colors"
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0 mt-0.5 transition-colors" />
                    )}
                    <span className={`leading-snug ${item.done ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-semibold'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={onOpenTransactionModal}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Movimentação PF</span>
            </button>
          </>
        ) : (
          /* MODO PJ CONTENT */
          <>
            {/* Socio Reimbursement Widget */}
            {pendingReimbursementAmount > 0 ? (
              <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Aporte do Sócio Pendente</span>
                </div>
                <h4 className="text-2xl font-extrabold text-white tracking-tight">
                  R$ {pendingReimbursementAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h4>
                <p className="text-[11px] text-slate-300">
                  Despesas corporativas pagas via conta pessoal aguardando acerto.
                </p>
                <button
                  onClick={onReimburseSocio}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Reembolsar Sócio em 1 Clique
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Contas PF & PJ Equilibradas</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Nenhum reembolso pendente. Todos os aportes foram regularizados.
                </p>
              </div>
            )}

            {/* Delinquency Warning Badge */}
            {defaulters.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    Inadimplência Ativa
                  </span>
                  <span className="text-xs font-bold text-slate-300">{defaulters.length} Clientes</span>
                </div>
                <div className="text-xl font-bold text-white">
                  R$ {defaulters.reduce((acc, d) => acc + d.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-slate-400">
                  Acesse o Radar de Inadimplência para copiar a régua de cobrança.
                </p>
              </div>
            )}

            {/* Quick Action Button PJ */}
            <button
              onClick={onOpenBillingModal}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-100 hover:bg-white text-slate-900 font-extrabold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Emitir Fatura / Boleto Pix</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
