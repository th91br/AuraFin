import { useState } from 'react';
import { Debt, Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, AlertTriangle, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  debts?: Debt[];
  transactions?: Transaction[];
  isPrivacyMode?: boolean;
  onAddDebt?: () => void;
  onPayInstallment?: (debtId: string, amount: number) => Promise<void> | void;
  onDeleteDebt?: (id: string) => void;
}

export function PfDebtsView({
  debts = [],
  transactions = [],
  isPrivacyMode = false,
  onAddDebt,
  onPayInstallment,
  onDeleteDebt,
}: Props) {
  const [payingId, setPayingId] = useState<string | null>(null);

  const totalDebtBalance = debts.reduce((acc, d) => acc + (d.totalBalance || 0), 0);
  const totalMonthlyPayments = debts.reduce((acc, d) => acc + (d.monthlyPayment || 0), 0);

  // Real recurring income from transactions
  const pfIncome = transactions
    .filter(t => t.context === 'PF' && t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const recurringIncome = pfIncome > 0 ? pfIncome : 1;
  const incomeCommitmentRatio = ((totalMonthlyPayments / recurringIncome) * 100).toFixed(1);

  if (debts.length === 0) return <div className="space-y-8 animate-in fade-in duration-200"><div className="flex items-center justify-between border-b border-slate-200/60 pb-4"><div><h1 className="text-2xl font-black tracking-tight text-slate-950">Dívidas &amp; Financiamentos</h1><p className="text-xs text-slate-500 mt-1">Passivos reais do usuário autenticado.</p></div>{onAddDebt && <button onClick={onAddDebt} className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs"><Plus className="w-4 h-4" />Adicionar dívida</button>}</div><div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300"><AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-slate-500">Nenhum dado disponível</p></div></div>;

  const handlePay = async (debt: Debt) => {
    if (!onPayInstallment) return;
    setPayingId(debt.id);
    try {
      await onPayInstallment(debt.id, debt.monthlyPayment);
    } finally {
      setPayingId(null);
    }
  };

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
            Acompanhe saldos devedores, parcelas mensais, taxas de juros e planos de quitação.
          </p>
        </div>

        {onAddDebt && (
          <button
            onClick={onAddDebt}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Dívida</span>
          </button>
        )}
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Saldo Devedor Total" value={totalDebtBalance} isPrivacyMode={isPrivacyMode} subtitle="Compromisso total a quitar" />
        <MetricCard title="Parcelas Mensais" value={totalMonthlyPayments} isPrivacyMode={isPrivacyMode} subtitle="Impacto fixo por mês" />
        <MetricCard title="Comprometimento Renda" value={pfIncome > 0 ? Number(incomeCommitmentRatio) : 0} prefix="" subtitle={pfIncome > 0 ? `${incomeCommitmentRatio}% da renda mensal` : 'Sem receitas registradas'} />
        <MetricCard title="Contratos Ativos" value={debts.length} prefix="" subtitle="Financiamentos e empréstimos" />
      </div>

      {debts.length > 0 && pfIncome > 0 && (
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="font-bold text-sm">Análise de Comprometimento de Renda</h3>
          </div>
          <p className="text-xs leading-relaxed">
            Atualmente, <strong className="font-mono font-bold">{incomeCommitmentRatio}% da sua renda mensal</strong> (R$ {totalMonthlyPayments.toLocaleString('pt-BR')} de R$ {pfIncome.toLocaleString('pt-BR')}) está alocada para pagamento de parcelas fixas.
          </p>
        </div>
      )}

      {/* Grid de Contratos */}
      {debts.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-950">Contratos de Dívidas & Financiamentos</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {debts.map(debt => (
              <div key={debt.id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {debt.interestRatePct > 0 ? `${debt.interestRatePct}% a.a. juros` : 'Sem juros'}
                    </span>
                    <h4 className="font-bold text-sm text-slate-950 mt-1.5">{debt.title}</h4>
                  </div>

                  {onDeleteDebt && (
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir a dívida "${debt.title}"?`)) {
                          onDeleteDebt(debt.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                      title="Excluir Dívida"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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

                {onPayInstallment && (
                  <button
                    onClick={() => handlePay(debt)}
                    disabled={payingId === debt.id}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    {payingId === debt.id ? 'Registrando Pagamento...' : 'Registrar Pagamento de Parcela'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950">Nenhuma dívida ou financiamento</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Excelente! Você não possui dívidas registradas no momento. Cadastre contratos se houver financiamentos imobiliários ou veiculares.
            </p>
          </div>
          {onAddDebt && (
            <button
              onClick={onAddDebt}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Financiamento / Dívida</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}
