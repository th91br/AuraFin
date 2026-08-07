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
  
  const baseBalance = isPJ ? 42500 : 14230;
  const baseIncoming = isPJ ? 12800 : 4500;
  
  const currentBalance = baseBalance + filteredTxs.filter(t => !t.date.includes('Ontem') && !t.date.includes('Hoje')).reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  
  const totalAssets = assets.reduce((acc, asset) => acc + asset.value, 0);

  const getAssetIcon = (category: string) => {
    switch (category) {
      case 'imovel': return <Home className="w-5 h-5 text-indigo-500" />;
      case 'veiculo': return <Car className="w-5 h-5 text-sky-500" />;
      case 'renda_fixa': return <Shield className="w-5 h-5 text-emerald-500" />;
      case 'acoes': return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default: return <CircleDollarSign className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {isPJ ? 'Dashboard Gerencial' : 'Seu Momento'}
          </h2>
          <p className="text-slate-500 mt-1">
            {isPJ ? 'Acompanhe a saúde financeira e o fluxo de caixa.' : 'Como está o seu dinheiro para aproveitar o mês.'}
          </p>
        </div>
        <button 
          onClick={onAdd} 
          className={`flex items-center space-x-1.5 px-4 py-2 font-semibold rounded-xl transition-colors shadow-sm ring-1 transform hover:scale-[1.02] active:scale-95 ${
            isPJ 
              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-indigo-700/5' 
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 ring-blue-700/5'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">{isPJ ? 'Novo Lançamento' : 'Novo Registro'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className={`p-6 rounded-3xl border transition-colors duration-500 ${
          isPJ ? 'border-indigo-100 bg-indigo-50/60' : 'border-blue-100 bg-blue-50/60'
        }`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${
              isPJ ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">
            {isPJ ? 'Caixa Operacional' : 'Disponível hoje'}
          </p>
          <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">
            R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-1">
            {isPJ ? 'Fluxo de Caixa Projetado' : 'Próximos boletos'}
          </p>
          <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">
            R$ {baseIncoming.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative min-h-[300px]">
        <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">
          {isPJ ? 'Extrato de Conciliação' : 'Últimos Movimentos'}
        </h3>
        
        {filteredTxs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-10">
            <p className="text-sm">Nenhuma movimentação encontrada.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTxs.map(tx => (
              <div key={tx.id} className="flex items-center justify-between group p-3 -mx-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-white border border-slate-100 flex items-center justify-center transition-colors">
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-slate-900">{tx.title}</p>
                      {tx.isPersonalExpenseInPJ && (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold uppercase tracking-wider">Uso Pessoal</span>
                      )}
                      {tx.isPaidByPF && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider">Pago PF</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{tx.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.type === 'income' ? '+ ' : '- '}R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>

                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(tx)} className={`p-2 text-slate-400 bg-white rounded-lg shadow-sm border border-slate-100 transition-colors ${isPJ ? 'hover:text-indigo-600' : 'hover:text-blue-600'}`}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(tx.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-lg shadow-sm border border-slate-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isPJ && (
        <div className="mt-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patrimônio Líquido Estimado</h3>
              <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                R$ {(currentBalance + totalAssets).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <button 
              onClick={onAddAsset}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors shadow-sm ring-1 ring-slate-200 text-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Ativo</span>
            </button>
          </div>

          <div className="space-y-3">
            {assets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                    {getAssetIcon(asset.category)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{asset.name}</p>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">{asset.category.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="font-semibold text-slate-900 text-sm">
                  R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
            
            {assets.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-sm">
                Nenhum ativo cadastrado.
              </div>
            )}
          </div>
          
          <div className="mt-5 p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-start space-x-3">
            <div className="mt-0.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">A Tabela FIPE do seu Carro mudou.</p>
              <p className="text-sm text-slate-600 mt-0.5 mb-2">Quer atualizar o valor do seu patrimônio para refletir o mercado?</p>
              <button className="text-xs font-semibold px-3 py-1.5 bg-white text-sky-700 rounded-lg shadow-sm border border-sky-200 hover:bg-sky-100 transition-colors">
                Atualizar Valor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
