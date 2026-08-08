import { Transaction, Asset } from '../types';
import { LineChart, BarChart3, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  assets: Asset[];
  isPrivacyMode: boolean;
}

export function PfReports({ transactions, assets, isPrivacyMode }: Props) {
  const pfTxs = transactions.filter(t => t.context === 'PF');

  const totalIncome = pfTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) + 8500;
  const totalExpense = pfTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRatePct = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const totalAssetsValue = assets.reduce((acc, a) => acc + a.value, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Relatórios & Desempenho Pessoal
        </h1>
        <p className="text-slate-500 mt-1 text-base">
          Análise histórica de receitas, despesas, taxa de poupança e evolução patrimonial.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Recebido (Mês)</span>
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
          </div>
          <PrivacyText value={totalIncome} isPrivacyMode={isPrivacyMode} className="text-3xl font-black text-slate-900 mt-2" />
          <p className="text-xs text-emerald-700 font-semibold mt-2">Inclui Pró-labore e Aportes</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Gastos (Mês)</span>
            <ArrowDownRight className="w-5 h-5 text-rose-600" />
          </div>
          <PrivacyText value={totalExpense} isPrivacyMode={isPrivacyMode} className="text-3xl font-black text-slate-900 mt-2" />
          <p className="text-xs text-slate-500 mt-2">Despesas e faturas de cartão</p>
        </div>

        <div className="bg-indigo-900 text-white p-6 rounded-2xl border border-indigo-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Taxa de Poupança</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-black text-white mt-2">{savingsRatePct}%</h3>
          <p className="text-xs text-indigo-300 mt-2">Porcentagem guardada da sua renda</p>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-indigo-700" />
          <span>Resumo por Categoria de Despesa</span>
        </h2>

        <div className="space-y-3 font-sans text-xs">
          <div className="flex justify-between p-3.5 bg-slate-50 rounded-xl font-bold text-slate-900">
            <span>Alimentação & Mercado</span>
            <span>R$ 1.420,50</span>
          </div>

          <div className="flex justify-between p-3.5 bg-slate-50 rounded-xl font-bold text-slate-900">
            <span>Saúde & Farmácia</span>
            <span>R$ 1.250,00</span>
          </div>

          <div className="flex justify-between p-3.5 bg-slate-50 rounded-xl font-bold text-slate-900">
            <span>Educação & Cursos</span>
            <span>R$ 980,00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
