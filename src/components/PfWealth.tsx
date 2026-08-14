import { useState } from 'react';
import { Asset, Transaction, Account, Debt, CreditCard } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Landmark, Home, Car, TrendingUp, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  assets?: Asset[];
  accounts?: Account[];
  debts?: Debt[];
  creditCards?: CreditCard[];
  transactions?: Transaction[];
  isPrivacyMode?: boolean;
  onAddAsset?: () => void;
  onDeleteAsset?: (id: string) => void;
}

export function PfWealth({
  assets = [],
  accounts = [],
  debts = [],
  creditCards = [],
  transactions = [],
  isPrivacyMode = false,
  onAddAsset,
  onDeleteAsset,
}: Props) {
  const pfAccounts = accounts.filter(a => a.context === 'PF');
  const pfCards = creditCards.filter(c => c.context === 'PF');

  const assetsPhysicalValue = assets.reduce((acc, a) => acc + (a.value || 0), 0);
  const liquidAccountsValue = pfAccounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  const totalAssetsValue = assetsPhysicalValue + liquidAccountsValue;

  const totalDebtsValue = debts.reduce((acc, d) => acc + (d.totalBalance || 0), 0);
  const totalCardsInvoices = pfCards.reduce((acc, c) => acc + (c.limitUsed || 0), 0);
  const totalLiabilities = totalDebtsValue + totalCardsInvoices;

  const netWorth = totalAssetsValue - totalLiabilities;

  // Real Allocation Breakdown
  const imoveisTotal = assets.filter(a => a.category === 'imovel').reduce((acc, a) => acc + a.value, 0);
  const veiculosTotal = assets.filter(a => a.category === 'veiculo').reduce((acc, a) => acc + a.value, 0);
  const investimentosTotal = assets.filter(a => a.category === 'renda_fixa' || a.category === 'acoes').reduce((acc, a) => acc + a.value, 0) + liquidAccountsValue;
  const outrosTotal = assets.filter(a => a.category === 'outros').reduce((acc, a) => acc + a.value, 0);

  const denom = totalAssetsValue > 0 ? totalAssetsValue : 1;
  const imoveisPct = ((imoveisTotal / denom) * 100).toFixed(1);
  const veiculosPct = ((veiculosTotal / denom) * 100).toFixed(1);
  const investPct = ((investimentosTotal / denom) * 100).toFixed(1);
  const outrosPct = ((outrosTotal / denom) * 100).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Balanço Patrimonial Pessoal
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Patrimônio Líquido Real
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Balanço consolidado: seus bens e disponibilidades descontados os passivos totais.
          </p>
        </div>

        {onAddAsset && (
          <button
            onClick={onAddAsset}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Ativo / Bem</span>
          </button>
        )}
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Ativos Totais" value={totalAssetsValue} isPrivacyMode={isPrivacyMode} subtitle="Bens, imóveis e saldos" trend="up" trendValue="+100%" />
        <MetricCard title="Passivos Totais" value={totalLiabilities} isPrivacyMode={isPrivacyMode} subtitle="Dívidas e faturas" trend="down" trendValue="-100%" />
        <MetricCard title="Patrimônio Líquido" value={netWorth} isPrivacyMode={isPrivacyMode} subtitle="Posição líquida real" />
        <MetricCard title="Total de Bens" value={assets.length + pfAccounts.length} prefix="" subtitle="Ativos e contas ativas" />
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
              <span className="font-mono font-bold text-slate-950">{imoveisPct}% (R$ {imoveisTotal.toLocaleString('pt-BR')})</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2">
                <Car className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-800">Veículos</span>
              </span>
              <span className="font-mono font-bold text-slate-950">{veiculosPct}% (R$ {veiculosTotal.toLocaleString('pt-BR')})</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">Investimentos & Disponibilidades</span>
              </span>
              <span className="font-mono font-bold text-slate-950">{investPct}% (R$ {investimentosTotal.toLocaleString('pt-BR')})</span>
            </div>

            {outrosTotal > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center space-x-2">
                  <Landmark className="w-4 h-4 text-slate-600" />
                  <span className="font-bold text-slate-800">Outros Bens</span>
                </span>
                <span className="font-mono font-bold text-slate-950">{outrosPct}% (R$ {outrosTotal.toLocaleString('pt-BR')})</span>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
            <span className="font-bold text-slate-900 block">Composição Patrimonial</span>
            <p className="text-[11px] text-slate-500">
              {totalAssetsValue > 0
                ? `${investPct}% do seu patrimônio está em investimentos/liquidez e ${imoveisPct}% em imóveis.`
                : 'Cadastre seus ativos para visualizar a composição percentual.'}
            </p>
          </div>
        </div>

        {/* Assets List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-950">Bens & Ativos Cadastrados</h3>
            <span className="text-xs font-semibold text-slate-400">Isolamento RLS ativo</span>
          </div>

          {assets.length > 0 ? (
            <div className="space-y-3">
              {assets.map(asset => (
                <div key={asset.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{asset.name}</h4>
                    <p className="text-[10px] text-slate-500 capitalize">{asset.category} {asset.notes ? `• ${asset.notes}` : ''}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <PrivacyText
                        value={asset.value}
                        isPrivacyMode={isPrivacyMode}
                        className="font-mono font-bold text-sm text-slate-950 block"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold">Valor Registrado</span>
                    </div>

                    {onDeleteAsset && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover o bem "${asset.name}"?`)) {
                            onDeleteAsset(asset.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                        title="Excluir Ativo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-700">Nenhum bem físico cadastrado</p>
              <p className="text-[11px] text-slate-500">Cadastre seus imóveis, terrenos ou veículos para compor seu balanço patrimonial.</p>
              {onAddAsset && (
                <button
                  onClick={onAddAsset}
                  className="mt-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                >
                  + Cadastrar Bem / Ativo
                </button>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
