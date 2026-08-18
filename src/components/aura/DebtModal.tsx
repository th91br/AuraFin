import React, { useState } from 'react';
import { Debt } from '../../types';
import { ShieldAlert, X, Loader2, Plus, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debt: Partial<Debt>) => Promise<void>;
}

export function DebtModal({ isOpen, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [totalBalance, setTotalBalance] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [remainingInstallments, setRemainingInstallments] = useState('12');
  const [interestRatePct, setInterestRatePct] = useState('0');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !totalBalance) {
      setError('Descrição e saldo devedor são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        totalBalance: parseFloat(totalBalance) || 0,
        monthlyPayment: parseFloat(monthlyPayment) || 0,
        remainingInstallments: parseInt(remainingInstallments, 10) || 1,
        interestRatePct: parseFloat(interestRatePct) || 0,
        dueDate
      });
      setTitle('');
      setTotalBalance('');
      setMonthlyPayment('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao cadastrar dívida.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Nova Dívida / Financiamento</h2>
            <p className="text-xs text-slate-400">Cadastre contratos, empréstimos ou financiamentos.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 block">Título do Contrato / Dívida *</label>
            <input
              type="text"
              required
              placeholder="Ex: Financiamento Imobiliário, Jeep Compass, Empréstimo"
              value={title}
              onChange={(e) => { setError(null); setTitle(e.target.value); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Saldo Devedor Total (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={totalBalance}
                onChange={(e) => setTotalBalance(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Valor da Parcela (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Parcelas Rest.</label>
              <input
                type="number"
                value={remainingInstallments}
                onChange={(e) => setRemainingInstallments(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Juros % a.a.</label>
              <input
                type="number"
                step="0.1"
                value={interestRatePct}
                onChange={(e) => setInterestRatePct(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Vencimento</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !totalBalance}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Dívida</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
