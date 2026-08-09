import { useState } from 'react';
import { Debt } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, CreditCard, AlertTriangle, ShieldCheck, CheckCircle2, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  isPrivacyMode?: boolean;
  onAddDebt?: () => void;
  onPayInstallment?: (debtId: string, amount: number) => void;
}

export function PfDebtsView({ isPrivacyMode = false, onAddDebt, onPayInstallment }: Props) {
  const [debts, setDebts] = useState<Debt[]>([
    { id: 'd1', title: 'Financiamento Imobiliário Caixa', totalBalance: 185000, monthlyPayment: 1850, remainingInstallments: 140, interestRatePct: 8.5, dueDate: '2026-08-15' },
    { id: 'd2', title: 'Financiamento Veículo Jeep Compass', totalBalance: 42000, monthlyPayment: 1250, remainingInstallments: 36, interestRatePct: 1.2, dueDate: '2026-08-20' },
    { id: 'd3', title: 'Empréstimo Pessoal Consignado', totalBalance: 8500, monthlyPayment: 420, remainingInstallments: 22, interestRatePct: 1.1, dueDate: '2026-08-25' },
  ]);

  const totalDebtBalance = debts.reduce((acc, d) => acc + d.totalBalance, 0);
  const totalMonthlyPayments = debts.reduce((acc, d) => acc + d.monthlyPayment, 0);
  const recurringIncome = 8500; // Pró-labore/Renda
  const incomeCommitmentRatio = ((totalMonthlyPayments / recurringIncome) * 100).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-rose-50 text-rose-900 border border-rose-200 rounded">
            Gestão de Passivos & Compromissos
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Dívidas & Financiamentos
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Acompanhe o saldo devedor, parcelas mensais, juros e prazos de quitação.
          </p>
        </div>

        <button
          onClick={onAddDebt}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Dívida</span>
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Saldo Devedor Total" value={totalDebtBalance} isPrivacyMode={isPrivacyMode} subtitle="Compromisso total a quitar" trend="down" trendValue="-1.5%" />
        <MetricCard title="Parcelas Mensais Total" value={totalMonthlyPayments} isPrivacyMode={isPrivacyMode} subtitle="Impacto fixo mensal" />
        <MetricCard title="Comprometimento Renda" value={Number(incomeCommitmentRatio)} prefix="" subtitle={`${incomeCommitmentRatio}% da renda mensal`} />
        <MetricCard title="Contratos Ativos" value={debts.length} prefix="" subtitle="Financiamentos e parcelados" />
      </div>

      {/* Card de Índice de Comprometimento Financeiro em Linguagem Humana */}
      <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <h3 className="font-bold text-sm">Análise de Comprometimento de Renda</h3>
        </div>
        <p className="text-xs leading-relaxed">
          Atualmente, <strong className="font-mono font-bold">{incomeCommitmentRatio}% da sua renda mensal</strong> (R$ {totalMonthlyPayments.toLocaleString('pt-BR')} de R$ {recurringIncome.toLocaleString('pt-BR')}) está comprometida com o pagamento de dívidas e parcelas fixas.
        </p>
      </div>

      {/* Grid de DebtCards */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-950">Contratos de Dívidas & Financiamentos</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {debts.map(debt => (
            <div key={debt.id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {debt.interestRatePct}% a.a. juros
                  </span>
                  <h4 className="font-bold text-sm text-slate-950 mt-1.5">{debt.title}</h4>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Devedor Atual</span>
                <PrivacyText
                  value={debt.totalBalance}
                  isPrivacyMode={isPrivacyMode}
                  className="text-2xl font-black font-mono text-slate-950 tracking-tight block"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Parcela Mensal:</span>
                  <span className="font-bold text-slate-900">R$ {debt.monthlyPayment.toLocaleString('pt-BR')}/mês</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Parcelas Restantes:</span>
                  <span>{debt.remainingInstallments} parcelas</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Vencimento:</span>
                  <span>{debt.dueDate}</span>
                </div>
              </div>

              <button
                onClick={() => onPayInstallment && onPayInstallment(debt.id, debt.monthlyPayment)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Registrar Pagamento de Parcela
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
