import { useState } from 'react';
import { Transaction, BudgetItem } from '../types';
import { PieChart, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  budgetItems: BudgetItem[];
  onAddTransaction: () => void;
}

export function PfBudget({ transactions, budgetItems, onAddTransaction }: Props) {
  const pfTxs = transactions.filter(t => t.context === 'PF' && t.type === 'expense');
  
  const totalAllocated = budgetItems.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = pfTxs.reduce((acc, t) => acc + t.amount, 0);
  const remainingBudget = totalAllocated - totalSpent;
  const overallPercentage = Math.min(100, Math.round((totalSpent / (totalAllocated || 1)) * 100));

  if (budgetItems.length === 0 && pfTxs.length === 0) return <div className="space-y-8 animate-in fade-in duration-300"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Orçamento &amp; Controle de Teto</h1><p className="text-slate-500 mt-1 text-base">Dados reais do usuário autenticado.</p></div><button onClick={onAddTransaction} className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm"><Plus className="w-4 h-4" />Registrar despesa</button></div><div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300"><PieChart className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-slate-500">Nenhum dado disponível</p></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Orçamento & Controle de Teto
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            Monitore seus limites mensais por categoria para garantir sobra de caixa e aportar no futuro.
          </p>
        </div>
        <button
          onClick={onAddTransaction}
          className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Despesa</span>
        </button>
      </div>

      {/* Top Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Planejado (Mês)</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
            R$ {totalAllocated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-2">Soma dos limites por categoria</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Realizado / Executado</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
            R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center space-x-2 mt-2">
            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercentage > 90 ? 'bg-rose-600' : overallPercentage > 75 ? 'bg-amber-500' : 'bg-indigo-700'
                }`}
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{overallPercentage}%</span>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-sm ${
          remainingBudget >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
        }`}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Saldo Livre de Orçamento</p>
          <h3 className={`text-3xl font-extrabold mt-2 ${remainingBudget >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
            R$ {remainingBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className={`text-xs mt-2 font-semibold ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {remainingBudget >= 0 ? 'Dentro do plano esperado para este mês.' : 'Atenção: Limite mensal excedido.'}
          </p>
        </div>
      </div>

      {/* Category Budget Breakdown Cards */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-indigo-700" />
            <span>Detalhamento por Categoria</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Valores calculados em tempo real</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetItems.map((item) => {
            const pct = Math.min(100, Math.round((item.spent / (item.allocated || 1)) * 100));
            const isOver = item.spent > item.allocated;

            return (
              <div key={item.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 hover:bg-slate-100/60 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{item.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gasto: R$ {item.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {item.allocated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {isOver ? (
                    <span className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Excedido</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>No Limite</span>
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 100 ? 'bg-rose-600' : pct > 80 ? 'bg-amber-500' : 'bg-indigo-700'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium pt-1">
                    <span>{pct}% utilizado</span>
                    <span>Restante: R$ {Math.max(0, item.allocated - item.spent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
