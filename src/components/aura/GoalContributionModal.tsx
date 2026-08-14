import React, { useState } from 'react';
import { Goal } from '../../types';
import { Sparkles, X, Loader2, Plus, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onContribute: (goalId: string, amount: number, notes?: string) => Promise<void>;
}

export function GoalContributionModal({ isOpen, onClose, goal, onContribute }: Props) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onContribute(goal.id, val, notes.trim());
      setAmount('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao registrar aporte.');
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
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Registrar Aporte</h2>
            <p className="text-xs text-slate-400 truncate max-w-[220px]">{goal.title}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Progresso Atual:</span>
              <span className="font-mono font-bold text-slate-200">
                R$ {goal.currentAmount.toLocaleString('pt-BR')} de R$ {goal.targetAmount.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 block">Valor do Aporte (R$) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setError(null); setAmount(e.target.value); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 block">Observação (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Aporte mensal de poupança"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
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
              disabled={isSubmitting || !amount}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Confirmar Aporte</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
