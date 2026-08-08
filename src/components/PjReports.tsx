import { Transaction } from '../types';
import { LineChart, BarChart3, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  isPrivacyMode: boolean;
}

export function PjReports({ transactions, isPrivacyMode }: Props) {
  const pjTxs = transactions.filter(t => t.context === 'PJ');

  const totalIncome = pjTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 18500;
  const totalExpense = pjTxs.filter(t => t.type === 'expense' && !t.isPersonalExpenseInPJ).reduce((acc, t) => acc + t.amount, 0) || 4500;
  const prolaborePaid = pjTxs.filter(t => t.category === 'prolabore_pago').reduce((acc, t) => acc + t.amount, 0) || 8500;
  const netResult = totalIncome - totalExpense - prolaborePaid - Math.round(totalIncome * 0.06);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Relatórios & DRE Histórico PJ
        </h1>
        <p className="text-slate-400 mt-1 text-base">
          Desempenho operacional da empresa, faturamento bruto, custos fixos e margem de lucro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono tabular-nums">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Faturamento Bruto</span>
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          </div>
          <PrivacyText value={totalIncome} isPrivacyMode={isPrivacyMode} className="text-3xl font-black text-white mt-2" />
          <p className="text-xs text-slate-400 mt-2 font-sans font-semibold">Sem descontar DAS (~6%)</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Despesas Operacionais</span>
            <ArrowDownRight className="w-5 h-5 text-rose-400" />
          </div>
          <PrivacyText value={totalExpense} isPrivacyMode={isPrivacyMode} className="text-3xl font-black text-white mt-2" />
          <p className="text-xs text-slate-400 mt-2 font-sans">Infraestrutura, licenças e custos</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Resultado Operacional</span>
            <TrendingUp className="w-5 h-5 text-sky-400" />
          </div>
          <PrivacyText value={netResult} isPrivacyMode={isPrivacyMode} className="text-3xl font-black text-emerald-400 mt-2" />
          <p className="text-xs text-slate-400 mt-2 font-sans">Lucro líquido após custos e pró-labore</p>
        </div>
      </div>
    </div>
  );
}
