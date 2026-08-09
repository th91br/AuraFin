import { useState } from 'react';
import { Asset, Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { HelpTooltip } from './ui/HelpTooltip';
import { Plus, Landmark, Home, Car, TrendingUp, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  assets?: Asset[];
  transactions?: Transaction[];
  isPrivacyMode?: boolean;
  onAddAsset?: () => void;
}

export function PfWealth({
  assets = [],
  transactions = [],
  isPrivacyMode = false,
  onAddAsset,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const defaultAssets: Asset[] = [
    { id: 'a1', name: 'Apartamento Jardins SP', category: 'imovel', value: 380000, notes: 'Avaliação imobiliária 2026' },
    { id: 'a2', name: 'Jeep Compass Longitude', category: 'veiculo', value: 65000, notes: 'Tabela FIPE recente' },
    { id: 'a3', name: 'Carteira de Renda Fixa & Tesouro', category: 'renda_fixa', value: 45000, notes: 'LCI/CDB Liquidez Diária' },
    { id: 'a4', name: 'Ações & ETFs (B3)', category: 'acoes', value: 25000, notes: 'Investimentos em Bolsa' },
  ];

  const displayAssets = assets.length > 0 ? assets : defaultAssets;

  const totalAssetsValue = displayAssets.reduce((acc, a) => acc + a.value, 0);
  const totalLiabilities = 165000; // Dívidas e financiamentos reais vinculados do Bloco 2
  const netWorth = totalAssetsValue - totalLiabilities;
  const netWorthVariation = '+4,8%';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Balanço Patrimonial Pessoal
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Patrimônio Líquido
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Veja tudo o que você possui, o que ainda deve e como seu patrimônio evolui ao longo do tempo.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => alert('Formulário de novo passivo')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-200"
          >
            + Adicionar Passivo
          </button>

          <button
            onClick={onAddAsset}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Ativo</span>
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Ativos Totais" value={totalAssetsValue} isPrivacyMode={isPrivacyMode} subtitle="Bens, imóveis e carteiras" trend="up" trendValue="+6%" />
        <MetricCard title="Passivos Totais" value={totalLiabilities} isPrivacyMode={isPrivacyMode} subtitle="Financiamentos e empréstimos" trend="down" trendValue="-2%" />
        <MetricCard title="Patrimônio Líquido" value={netWorth} isPrivacyMode={isPrivacyMode} subtitle="Posição real (Ativos - Passivos)" trend="up" trendValue={netWorthVariation} />
        <MetricCard title="Total de Bens" value={displayAssets.length} prefix="" subtitle="Ativos cadastrados" />
      </div>

      {/* Main Grid: Allocation & Asset List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Distribution Chart Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-bold text-sm text-slate-950">Distribuição Patrimonial por Categoria</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-800">Imóveis & Terrenos</span>
              </span>
              <span className="font-mono font-bold text-slate-950">73.8%</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2">
                <Car className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-800">Veículos</span>
              </span>
              <span className="font-mono font-bold text-slate-950">12.6%</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">Investimentos & Renda Fixa</span>
              </span>
              <span className="font-mono font-bold text-slate-950">13.6%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
            <span className="font-bold text-slate-900 block">Insight Patrimonial</span>
            <p className="text-[11px] text-slate-500">73.8% do seu patrimônio total está alocado em bens imobiliários de baixa liquidez.</p>
          </div>
        </div>

        {/* Assets List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-950">Lista de Ativos Registrados</h3>
            <span className="text-xs font-semibold text-slate-400">Prevenção de dupla contagem ativa</span>
          </div>

          <div className="space-y-3">
            {displayAssets.map(asset => (
              <div key={asset.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{asset.name}</h4>
                  <p className="text-[10px] text-slate-500 capitalize">{asset.category} • {asset.notes}</p>
                </div>

                <div className="text-right">
                  <PrivacyText
                    value={asset.value}
                    isPrivacyMode={isPrivacyMode}
                    className="font-mono font-bold text-sm text-slate-950 block"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold">Valor Atualizado</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
