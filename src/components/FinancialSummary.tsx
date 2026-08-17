import { ContextMode, Transaction, Asset } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Plus, Pencil, Trash2, Shield, Car, Home, CircleDollarSign } from 'lucide-react';

interface Props {
  mode: ContextMode;
  transactions: Transaction[];
  assets?: Asset[];
  onAdd: () => void;
  onAddAsset?: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export function FinancialSummary({ mode, transactions, assets = [], onAdd, onAddAsset, onEdit, onDelete }: Props) {
  const isPJ = mode === 'PJ';
  const filteredTxs = transactions.filter(t => t.context === mode);
  
  const currentBalance = filteredTxs.reduce((acc, t) => {
    return acc + (t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : 0);
  }, 0);

  const projectedIncome = filteredTxs
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const baseIncoming = projectedIncome;
  
  const totalAssets = assets.reduce((acc, asset) => acc + asset.value, 0);

  const getAssetIcon = (category: string) => {
    switch (category) {
      case 'imovel': return <Home className="w-5 h-5 text-indigo-600" />;
      case 'veiculo': return <Car className="w-5 h-5 text-sky-600" />;
      case 'renda_fixa': return <Shield className="w-5 h-5 text-emerald-600" />;
      case 'acoes': return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default: return <CircleDollarSign className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-bold ${isPJ ? 'text-white' : 'text-slate-900'}`}>
            {isPJ ? 'Dashboard Gerencial de Caixa' : 'Seu Momento Financeiro'}
          </h2>
          <p className={`text-sm mt-0.5 ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
            {isPJ ? 'Acompanhe o caixa operacional e conciliações.' : 'Disponibilidade diária e movimentos recentes.'}
          </p>
        </div>
        <button 
          onClick={onAdd} 
          className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 ${
            isPJ 
              ? 'bg-slate-100 hover:bg-white text-slate-900' 
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isPJ ? 'Novo Lançamento PJ' : 'Novo Registro PF'}</span>
        </button>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-2 gap-5">
        <div className={`p-6 rounded-2xl border transition-colors ${
          isPJ ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-sm'
        }`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-xl ${
              isPJ ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}>
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
            {isPJ ? 'Caixa Operacional Líquido' : 'Disponível Hoje'}
          </p>
          <h3 className={`text-3xl font-extrabold tracking-tight ${isPJ ? 'font-mono tabular-nums text-white' : 'text-slate-900'}`}>
            R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className={`p-6 rounded-2xl border transition-colors ${
          isPJ ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-sm'
        }`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-xl ${
              isPJ ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}>
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
            {isPJ ? 'Receita Projetada (Mês)' : 'Próximos Boletos'}
          </p>
          <h3 className={`text-3xl font-extrabold tracking-tight ${isPJ ? 'font-mono tabular-nums text-white' : 'text-slate-900'}`}>
            R$ {baseIncoming.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      {/* Transaction List Box */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        isPJ ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-6 ${isPJ ? 'text-slate-400' : 'text-slate-400'}`}>
          {isPJ ? 'Extrato de Conciliação Corporativa' : 'Últimos Movimentos Pessoais'}
        </h3>
        
        {filteredTxs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-10">
            <p className="text-sm">Nenhuma movimentação registrada.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTxs.map(tx => (
              <div key={tx.id} className={`flex items-center justify-between group p-3 -mx-3 rounded-xl transition-colors ${
                isPJ ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                    isPJ ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className={`font-bold text-sm ${isPJ ? 'text-white' : 'text-slate-900'}`}>{tx.title}</p>
                      {tx.isPersonalExpenseInPJ && (
                        <span className="px-1.5 py-0.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded text-[10px] font-bold uppercase tracking-wider">Uso Pessoal</span>
                      )}
                      {tx.isPaidByPF && (
                        <span className="px-1.5 py-0.5 bg-indigo-950/60 border border-indigo-800 text-indigo-300 rounded text-[10px] font-bold uppercase tracking-wider">Pago PF</span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>{tx.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`font-bold text-sm ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : isPJ ? 'text-slate-200 font-mono' : 'text-slate-900'
                  }`}>
                    {tx.type === 'income' ? '+ ' : '- '}R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>

                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(tx)} className={`p-1.5 rounded-lg border transition-colors ${
                      isPJ ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'
                    }`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(tx.id)} className={`p-1.5 rounded-lg border transition-colors ${
                      isPJ ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400' : 'bg-white text-slate-500 border-slate-200 hover:text-rose-600'
                    }`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
