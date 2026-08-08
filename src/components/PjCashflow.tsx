import { useState } from 'react';
import { Transaction } from '../types';
import { Target, BarChart3, TrendingUp, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';
import { HelpTooltip } from './ui/HelpTooltip';

interface Props {
  transactions: Transaction[];
  isPrivacyMode: boolean;
}

export function PjCashflow({ transactions, isPrivacyMode }: Props) {
  const [periodDays, setPeriodDays] = useState<7 | 30 | 60 | 90>(30);
  const [customFixedCost, setCustomFixedCost] = useState(15000);

  const pjTxs = transactions.filter(t => t.context === 'PJ');
  
  const grossRevenue = pjTxs
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0) || 18500;

  const totalExpenses = pjTxs
    .filter(t => t.type === 'expense' && !t.isPersonalExpenseInPJ)
    .reduce((acc, t) => acc + t.amount, 0) || 4500;

  const prolaborePaid = pjTxs
    .filter(t => t.category === 'prolabore_pago')
    .reduce((acc, t) => acc + t.amount, 0) || 8500;

  const estimatedTaxes = Math.round(grossRevenue * 0.06); // Simples Nacional ~6%
  const variableCosts = Math.round(grossRevenue * 0.10); // Costs diretos
  const grossMargin = grossRevenue - estimatedTaxes - variableCosts;
  
  const netContributionMargin = grossRevenue - estimatedTaxes - totalExpenses - prolaborePaid;
  const netProfitMarginPct = grossRevenue > 0 ? Math.round((netContributionMargin / grossRevenue) * 100) : 0;

  const breakevenGoal = customFixedCost;
  const breakevenPct = Math.min(100, Math.round((grossRevenue / (breakevenGoal || 1)) * 100));

  const currentCash = 35000 + (grossRevenue - totalExpenses);
  const dailyBurnRate = Math.max(100, Math.round((totalExpenses + prolaborePaid) / 30));
  const runwayDays = Math.round(currentCash / dailyBurnRate);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Period Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Caixa Operacional & DRE Gerencial
          </h1>
          <p className="text-slate-400 mt-1 text-base">
            Demonstração do Resultado do Exercício, fluxo de caixa projetado, Ponto de Equilíbrio e Runway.
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {[7, 30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriodDays(days as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                periodDays === days ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {days} Dias
            </button>
          ))}
        </div>
      </div>

      {/* Top Indicators Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono tabular-nums">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Caixa Atual</p>
          <PrivacyText value={currentCash} isPrivacyMode={isPrivacyMode} className="text-2xl font-black text-white mt-2" />
          <p className="text-xs text-slate-400 mt-2 font-sans">Saldo consolidado nas contas PJ</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Receita Bruta ({periodDays}d)</p>
          <PrivacyText value={grossRevenue} isPrivacyMode={isPrivacyMode} className="text-2xl font-black text-white mt-2" />
          <p className="text-xs text-emerald-400 mt-2 font-sans font-semibold">Tributação Simples ~6%</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Resultado Líquido</p>
          <PrivacyText value={netContributionMargin} isPrivacyMode={isPrivacyMode} className={`text-2xl font-black mt-2 ${netContributionMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
          <p className="text-xs text-slate-400 mt-2 font-sans">Margem Líquida: <span className="text-sky-400 font-bold">{netProfitMarginPct}%</span></p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Runway</p>
            <HelpTooltip term="Runway de Caixa" explanation="Por quanto tempo sua empresa consegue continuar operando com o caixa disponível atual mantendo a estrutura de custos." />
          </div>
          <h3 className="text-2xl font-black text-white mt-2 font-sans">{runwayDays} Dias</h3>
          <p className="text-xs text-slate-400 mt-2 font-sans">Queima: R$ {dailyBurnRate}/dia</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* DRE GERENCIAL ESTRUTURADO */}
        <div className="lg:col-span-7 bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-sky-400" />
                <span>DRE Gerencial Completo</span>
              </h2>
              <HelpTooltip term="DRE Gerencial" explanation="Demonstração do Resultado do Exercício. Mostra a evolução financeira desde a Receita Bruta até o Lucro Líquido Real após impostos, custos e pró-labore." />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">Visão Mensal</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3.5 bg-slate-950 rounded-xl font-bold text-slate-100">
              <span className="font-sans font-semibold text-slate-300">(+) Receita Bruta Operacional</span>
              <span className="text-emerald-400">R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-slate-950/60 rounded-xl text-slate-400 pl-6">
              <span className="font-sans text-slate-400">(-) Impostos sobre Faturamento (DAS ~6%)</span>
              <span className="text-rose-400">- R$ {estimatedTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-slate-950/60 rounded-xl text-slate-400 pl-6">
              <span className="font-sans text-slate-400">(-) Custos Variáveis & Alocações Diretas</span>
              <span className="text-rose-400">- R$ {variableCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-slate-950 rounded-xl font-bold text-slate-100">
              <span className="font-sans font-semibold text-slate-300">(=) Margem Bruta Operacional</span>
              <span>R$ {grossMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-slate-950/60 rounded-xl text-slate-400 pl-6">
              <span className="font-sans text-slate-400">(-) Despesas Operacionais (Softwares/Infra)</span>
              <span className="text-rose-400">- R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-3.5 bg-slate-950/60 rounded-xl text-slate-400 pl-6">
              <span className="font-sans text-slate-400">(-) Pró-labore Pago ao Sócio</span>
              <span className="text-amber-400">- R$ {prolaborePaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl font-extrabold text-sm text-white">
              <span className="font-sans font-bold text-slate-200">(=) Resultado Líquido Operacional</span>
              <span className={netContributionMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                R$ {netContributionMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* PONTO DE EQUILÍBRIO SIMULATOR */}
        <div className="lg:col-span-5 bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 text-sky-400">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Ponto de Equilíbrio</h2>
              <HelpTooltip term="Break-even" explanation="Faturamento bruto mínimo que sua empresa precisa atingir no mês para pagar 100% dos custos sem ter prejuízo." />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Faturamento necessário para zerar todos os custos fixos corporativos.
            </p>

            <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Custo Fixo de Referência (R$):</label>
              <input
                type="number"
                value={customFixedCost}
                onChange={(e) => setCustomFixedCost(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2.5 font-mono">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                R$ {grossRevenue.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs font-bold text-slate-400">
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
