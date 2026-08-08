import { useState } from 'react';
import { Transaction } from '../types';
import { Target, BarChart3 } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export function PjDreCashflow({ transactions }: Props) {
  const [customFixedCost, setCustomFixedCost] = useState(15000);

  const pjTxs = transactions.filter(t => t.context === 'PJ');
  const grossRevenue = pjTxs
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0) || 18500;

  const totalExpenses = pjTxs
    .filter(t => t.type === 'expense' && !t.isPersonalExpenseInPJ)
    .reduce((acc, t) => acc + t.amount, 0) || 4500;

  const estimatedTaxes = Math.round(grossRevenue * 0.06); // Simples Nacional ~6%
  const netContributionMargin = grossRevenue - estimatedTaxes - totalExpenses;
  const netProfitMarginPct = grossRevenue > 0 ? Math.round((netContributionMargin / grossRevenue) * 100) : 0;

  // Ponto de equilíbrio
  const breakevenGoal = customFixedCost;
  const breakevenPct = Math.min(100, Math.round((grossRevenue / (breakevenGoal || 1)) * 100));

  // Runway em dias
  const currentCash = 35000 + (grossRevenue - totalExpenses);
  const dailyBurnRate = Math.max(100, Math.round(totalExpenses / 30));
  const runwayDays = Math.round(currentCash / dailyBurnRate);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          DRE Gerencial & Ponto de Equilíbrio
        </h1>
        <p className="text-slate-400 mt-1 text-base">
          Demonstração do Resultado do Exercício em tempo real e simulação de cobertura de custos fixos.
        </p>
      </div>

      {/* Top Indicators Row - Matte Slate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono tabular-nums">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Receita Bruta Acumulada</p>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-emerald-400 font-semibold mt-2 font-sans">Dedução tributária estimada: ~6% (Simples)</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Resultado Líquido Operacional</p>
          <h3 className={`text-3xl font-extrabold mt-2 ${netContributionMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            R$ {netContributionMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-2 font-sans">
            Margem Líquida do Negócio: <span className="text-sky-400 font-bold">{netProfitMarginPct}%</span>
          </p>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Runway de Caixa Estimado</p>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {runwayDays} Dias
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-sans">
            Com base na queima diária atual de R$ {dailyBurnRate}/dia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* DRE Table Component */}
        <div className="lg:col-span-7 bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              <span>DRE Gerencial Simplificado</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">Visão Mensal</span>
          </div>

          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between p-3.5 bg-slate-950 rounded-xl font-bold text-slate-100">
              <span className="font-sans font-semibold text-slate-300">(+) Receita Operacional Bruta</span>
              <span className="text-emerald-400">R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-slate-950/60 rounded-xl text-slate-400 pl-6">
              <span className="font-sans text-slate-400">(-) Impostos sobre Faturamento (~6%)</span>
              <span className="text-rose-400">- R$ {estimatedTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-slate-950 rounded-xl font-bold text-slate-100">
              <span className="font-sans font-semibold text-slate-300">(=) Receita Operacional Líquida</span>
              <span>R$ {(grossRevenue - estimatedTaxes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-slate-950/60 rounded-xl text-slate-400 pl-6">
              <span className="font-sans text-slate-400">(-) Custos Operacionais & Softwares</span>
              <span className="text-rose-400">- R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl font-extrabold text-base text-white">
              <span className="font-sans font-bold text-slate-200">(=) Lucro Líquido do Período</span>
              <span className={netContributionMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                R$ {netContributionMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Ponto de Equilíbrio Simulator */}
        <div className="lg:col-span-5 bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-4 border border-slate-700 text-sky-400">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Análise do Ponto de Equilíbrio</h2>
            <p className="text-sm text-slate-400 mt-1">
              Faturamento necessário para zerar todos os custos fixos corporativos.
            </p>

            <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase">Ajustar Custo Fixo de Referência (R$):</label>
              <input
                type="number"
                value={customFixedCost}
                onChange={(e) => setCustomFixedCost(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white font-mono outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2.5 font-mono">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                R$ {grossRevenue.toLocaleString('pt-BR')}
              </span>
              <span className="text-sm font-bold text-slate-400">
                / R$ {breakevenGoal.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  breakevenPct < 50 ? 'bg-rose-600' : breakevenPct < 100 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${breakevenPct}%` }}
              />
            </div>
            <p className="text-xs font-bold text-slate-300 mt-3">{breakevenPct}% do Ponto de Equilíbrio Atingido</p>
          </div>
        </div>
      </div>
    </div>
  );
}
