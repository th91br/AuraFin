import React, { useState } from 'react';
import { BudgetItem } from '../../types';
import { PieChart, X, Loader2, Check, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budgets: { category: string; planned: number }[]) => Promise<void>;
  currentBudgets: { category: string; label: string; planned: number }[];
  periodMonth: string;
}

export function BudgetModal({ isOpen, onClose, onSave, currentBudgets, periodMonth }: Props) {
  const [budgets, setBudgets] = useState(currentBudgets);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (category: string, value: string) => {
    const num = parseFloat(value) || 0;
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, planned: num } : b));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(budgets.map(b => ({ category: b.category, planned: b.planned })));
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar planejamento orçamentário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Tetos Orçamentários</h2>
            <p className="text-xs text-slate-400">Defina o limite de gastos para {periodMonth}.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
            {budgets.map(b => (
              <div key={b.category} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-slate-200">{b.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-mono text-xs">R$</span>
                  <input
                    type="number"
                    step="50"
                    value={b.planned || ''}
                    onChange={(e) => handleChange(b.category, e.target.value)}
                    placeholder="0.00"
                    className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-right text-slate-100 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>
              </div>
            ))}
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
              disabled={isSubmitting}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Orçamento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
