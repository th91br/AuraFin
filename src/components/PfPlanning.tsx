import { useState } from 'react';
import { Transaction, BudgetItem, Goal, Debt } from '../types';
import { PieChart, Target, Shield, AlertTriangle, CheckCircle2, Plus, Calculator } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';
import { HelpTooltip } from './ui/HelpTooltip';

interface Props {
  transactions: Transaction[];
  budgetItems: BudgetItem[];
  goals: Goal[];
  debts: Debt[];
  isPrivacyMode: boolean;
  onAddTransaction: () => void;
}

export function PfPlanning({
  transactions,
  budgetItems,
  goals,
  debts,
  isPrivacyMode,
  onAddTransaction,
}: Props) {
  const [subTab, setSubTab] = useState<'orcamento' | 'metas' | 'reserva' | 'dividas'>('orcamento');
  const [targetMonths, setTargetMonths] = useState(6);
  const monthlyCostEstimate = 5000;

  const totalAllocated = budgetItems.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = transactions.filter(t => t.context === 'PF' && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const remainingBudget = totalAllocated - totalSpent;
  const overallPercentage = Math.min(100, Math.round((totalSpent / (totalAllocated || 1)) * 100));

  const emergencyCurrent = 28500;
  const emergencyTarget = monthlyCostEstimate * targetMonths;
  const emergencyPercent = Math.min(100, Math.round((emergencyCurrent / (emergencyTarget || 1)) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Planejamento Financeiro Pessoal
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            Controle de orçamento por teto, metas de vida, reserva de emergência e passivos.
          </p>
        </div>

        <button
          onClick={onAddTransaction}
          className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('orcamento')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'orcamento' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Orçamento Mensal</span>
        </button>

        <button
          onClick={() => setSubTab('metas')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'metas' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Metas de Vida ({goals.length})</span>
        </button>

        <button
          onClick={() => setSubTab('reserva')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'reserva' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Reserva de Emergência</span>
        </button>

        <button
          onClick={() => setSubTab('dividas')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'dividas' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Dívidas ({debts.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: ORÇAMENTO */}
      {subTab === 'orcamento' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Planejado (Mês)</p>
              <PrivacyText value={totalAllocated} isPrivacyMode={isPrivacyMode} className="text-3xl font-black text-slate-900 mt-2" />
              <p className="text-xs text-slate-500 mt-2">Soma dos limites das categorias</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Realizado / Executado</p>
              <PrivacyText value={totalSpent} isPrivacyMode={isPrivacyMode} className="text-3xl font-black text-indigo-900 mt-2" />
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
              <PrivacyText value={remainingBudget} isPrivacyMode={isPrivacyMode} className={`text-3xl font-black mt-2 ${remainingBudget >= 0 ? 'text-emerald-800' : 'text-rose-800'}`} />
              <p className={`text-xs mt-2 font-semibold ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {remainingBudget >= 0 ? 'Dentro do plano esperado para este mês.' : 'Atenção: Limite mensal excedido.'}
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-indigo-700" />
              <span>Categorias & Tetos Orçamentários</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgetItems.map((item) => {
                const pct = Math.min(100, Math.round((item.spent / (item.allocated || 1)) * 100));
                const isOver = item.spent > item.allocated;

                return (
                  <div key={item.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{item.label}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Gasto: R$ {item.spent.toLocaleString('pt-BR')} de R$ {item.allocated.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      {isOver ? (
                        <span className="flex items-center space-x-1 text-xs font-bold px-2.5 py-1 bg-rose-100 text-rose-800 rounded border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Excedido</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>No Limite</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct > 100 ? 'bg-rose-600' : pct > 80 ? 'bg-amber-500' : 'bg-indigo-700'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-medium pt-1">
                        <span>{pct}% utilizado</span>
                        <span>Restante: R$ {Math.max(0, item.allocated - item.spent).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: METAS */}
      {subTab === 'metas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <div key={goal.id} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                      Meta {goal.category}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">{goal.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Alvo para: {goal.targetDate}</p>
                  </div>
                  <span className="text-2xl font-black text-indigo-900">{pct}%</span>
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-700 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Acumulado: R$ {goal.currentAmount.toLocaleString('pt-BR')}</span>
                    <span>Alvo: R$ {goal.targetAmount.toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                  Faltam <strong>R$ {remaining.toLocaleString('pt-BR')}</strong> para concluir esta meta.
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 3: RESERVA DE EMERGÊNCIA */}
      {subTab === 'reserva' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">Simulador de Reserva de Emergência</h2>
              <HelpTooltip term="Reserva de Emergência" explanation="Valor acumulado em renda fixa de liquidez diária para cobrir N meses do seu custo de vida sem depender de novos ganhos." />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Com base no custo mensal estimado de R$ {monthlyCostEstimate.toLocaleString('pt-BR')}/mês.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Meses de Cobertura Desejados:</span>
              <span className="text-indigo-900 bg-indigo-50 px-3 py-1 rounded border border-indigo-200">
                {targetMonths} Meses de Vida
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              value={targetMonths}
              onChange={(e) => setTargetMonths(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-700"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-slate-900">
              <span>Acumulado em Renda Fixa: R$ {emergencyCurrent.toLocaleString('pt-BR')}</span>
              <span>Meta: R$ {emergencyTarget.toLocaleString('pt-BR')}</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full transition-all duration-700" style={{ width: `${emergencyPercent}%` }} />
            </div>
            <p className="text-xs font-bold text-emerald-700 mt-1">{emergencyPercent}% da meta de segurança atingida.</p>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DÍVIDAS & FINANCIAMENTOS */}
      {subTab === 'dividas' && (
        <div className="space-y-6">
          {debts.map(debt => (
            <div key={debt.id} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                  Passivo Financeiro
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{debt.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Taxa de juros: {debt.interestRatePct}% a.a. • Restam {debt.remainingInstallments} parcelas
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Saldo Devedor Restante</p>
                <PrivacyText value={debt.totalBalance} isPrivacyMode={isPrivacyMode} className="text-2xl font-black text-slate-900" />
                <p className="text-xs text-slate-500 mt-1 font-semibold">Parcela mensal: R$ {debt.monthlyPayment.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
