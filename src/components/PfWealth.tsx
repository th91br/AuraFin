import { useState } from 'react';
import { Asset, Transaction } from '../types';
import { Landmark, Car, Home, TrendingUp, DollarSign, Plus, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { HelpTooltip } from './ui/HelpTooltip';

interface Props {
  assets: Asset[];
  transactions: Transaction[];
  onAddAsset: () => void;
}

export function PfWealth({ assets, transactions, onAddAsset }: Props) {
  const [filterCategory, setFilterCategory] = useState<string>('todas');

  const totalAssets = assets.reduce((acc, a) => acc + a.value, 0);
  const totalDebts = 320000; // Financiamento Imobiliário Caixa
  const netWorth = totalAssets - totalDebts;

  const filteredAssets = assets.filter(a => {
    if (filterCategory === 'todas') return true;
    return a.category === filterCategory;
  });

  const getCategoryBadge = (cat: Asset['category']) => {
    switch (cat) {
      case 'imovel':
        return { label: 'Imóvel', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'veiculo':
        return { label: 'Veículo (FIPE)', color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'renda_fixa':
        return { label: 'Renda Fixa', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'acoes':
        return { label: 'Ações / Fundos', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      default:
        return { label: 'Outros', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200/80 rounded">
              Bens & Investimentos Pessoais
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-1">
            Patrimônio Líquido & Ativos
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Acompanhe a evolução do seu patrimônio acumulado em imóveis, veículos, investimentos e dívidas imobiliárias.
          </p>
        </div>

        <button
          onClick={onAddAsset}
          className="flex items-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Ativo</span>
        </button>
      </div>

      {/* Net Worth Equation Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-md border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-white">Patrimônio Líquido Consolidado</h2>
            <HelpTooltip term="Patrimônio Líquido" explanation="Soma de todos os seus bens e investimentos (Ativos) subtraindo o saldo restante de dívidas e financiamentos (Passivos)." />
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
            Atualizado Hoje
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="text-xs font-bold text-slate-400 font-sans uppercase">Total de Ativos (Bens)</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">R$ {totalAssets.toLocaleString('pt-BR')}</p>
            <p className="text-[11px] text-slate-400 font-sans mt-2">3 Ativos cadastrados</p>
          </div>

          <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700">
            <p className="text-xs font-bold text-slate-400 font-sans uppercase">(-) Passivos (Financiamentos)</p>
            <p className="text-3xl font-black text-rose-400 mt-1">- R$ {totalDebts.toLocaleString('pt-BR')}</p>
            <p className="text-[11px] text-slate-400 font-sans mt-2">Saldo devedor imobiliário</p>
          </div>

          <div className="p-5 bg-indigo-950/80 rounded-xl border border-indigo-700">
            <p className="text-xs font-bold text-indigo-300 font-sans uppercase">(=) Patrimônio Líquido Real</p>
            <p className="text-3xl font-black text-white mt-1">R$ {netWorth.toLocaleString('pt-BR')}</p>
            <p className="text-[11px] text-indigo-300 font-sans mt-2">Liquidez imediata: R$ 28.500</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterCategory('todas')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterCategory === 'todas' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todos os Ativos ({assets.length})
        </button>
        <button
          onClick={() => setFilterCategory('imovel')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterCategory === 'imovel' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Imóveis
        </button>
        <button
          onClick={() => setFilterCategory('veiculo')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterCategory === 'veiculo' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Veículos (FIPE)
        </button>
        <button
          onClick={() => setFilterCategory('renda_fixa')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            filterCategory === 'renda_fixa' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Renda Fixa & Reserva
        </button>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredAssets.map(asset => {
          const badge = getCategoryBadge(asset.category);

          return (
            <div key={asset.id} className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${badge.color}`}>
                    {badge.label}
                  </span>
                  {asset.category === 'veiculo' && (
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center">
                      <RefreshCw className="w-3 h-3 mr-1" /> FIPE Atualizada
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{asset.name}</h3>
                {asset.notes && <p className="text-xs text-slate-500 mt-1">{asset.notes}</p>}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Valor Estimado</span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  R$ {asset.value.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
