import { Asset, Transaction } from '../types';
import { Home, Car, Shield, TrendingUp, CircleDollarSign, Plus, RefreshCw, Layers } from 'lucide-react';

interface Props {
  assets: Asset[];
  transactions: Transaction[];
  onAddAsset: () => void;
}

export function PfWealth({ assets, transactions, onAddAsset }: Props) {
  const pfTxs = transactions.filter(t => t.context === 'PF');
  const liquidBalance = pfTxs.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 7052.45);
  const totalAssetsValue = assets.reduce((acc, a) => acc + a.value, 0);
  const totalNetWorth = liquidBalance + totalAssetsValue;

  const getAssetIcon = (category: string) => {
    switch (category) {
      case 'imovel': return <Home className="w-5 h-5 text-indigo-700" />;
      case 'veiculo': return <Car className="w-5 h-5 text-sky-700" />;
      case 'renda_fixa': return <Shield className="w-5 h-5 text-emerald-700" />;
      case 'acoes': return <TrendingUp className="w-5 h-5 text-purple-700" />;
      default: return <CircleDollarSign className="w-5 h-5 text-slate-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'imovel': return 'Imóvel Residencial/Comercial';
      case 'veiculo': return 'Veículo (Tabela FIPE)';
      case 'renda_fixa': return 'Renda Fixa & Liquidez';
      case 'acoes': return 'Ações, ETFs & Cripto';
      default: return 'Outros Ativos';
    }
  };

  const handleUpdateFipe = () => {
    alert('Simulação FIPE: Os valores dos veículos foram atualizados com base no índice oficial do mês corrente!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Patrimônio Líquido & Ativos
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            Visão consolidada do seu patrimônio físico, financeiro e liquidez pessoal.
          </p>
        </div>
        <button
          onClick={onAddAsset}
          className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Ativo</span>
        </button>
      </div>

      {/* Net Worth Hero Display (Matte Slate Card) */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Patrimônio Líquido Total Estimado</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mt-2">
              R$ {totalNetWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Inclui saldo líquido disponível (R$ {liquidBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) + {assets.length} ativos cadastrados.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Ativos Imobilizados:</span>
              <span className="font-bold text-white">
                R$ {assets.filter(a => a.category === 'imovel' || a.category === 'veiculo').reduce((acc, a) => acc + a.value, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Ativos Financeiros:</span>
              <span className="font-bold text-emerald-400">
                R$ {assets.filter(a => a.category === 'renda_fixa' || a.category === 'acoes').reduce((acc, a) => acc + a.value, 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between text-xs font-semibold text-slate-300">
              <span>Status da Liquidez:</span>
              <span className="text-emerald-400 font-bold">Saudável</span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset List Grid */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Seus Ativos Cadastrados</h2>
            <p className="text-sm text-slate-500 mt-0.5">Acompanhe a valorização dos seus bens.</p>
          </div>

          <button
            onClick={handleUpdateFipe}
            className="flex items-center space-x-2 text-xs font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Cotação FIPE</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="p-6 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between hover:border-slate-300 transition-all">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                  {getAssetIcon(asset.category)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{asset.name}</h3>
                  <p className="text-xs font-bold text-indigo-700 mt-0.5">{getCategoryLabel(asset.category)}</p>
                  {asset.notes && <p className="text-xs text-slate-500 mt-2">{asset.notes}</p>}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Valor Atual</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
