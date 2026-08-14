import React, { useState } from 'react';
import { RecurrenceItem } from '../../types';
import { RefreshCw, X, Loader2, Plus, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rec: Partial<RecurrenceItem>) => Promise<void>;
}

export function RecurrenceModal({ isOpen, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'mensal' | 'semanal' | 'anual'>('mensal');
  const [category, setCategory] = useState('moradia');
  const [nextDueDate, setNextDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      setError('Descrição e valor são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        amount: parseFloat(amount) || 0,
        frequency,
        category,
        nextDueDate,
        context: 'PF'
      });
      setTitle('');
      setAmount('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar recorrência.');
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
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Nova Recorrência</h2>
            <p className="text-xs text-slate-400">Cadastre despesas fixas ou assinaturas automáticas.</p>
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
            <label className="font-semibold text-slate-300 block">Título / Serviço *</label>
            <input
              type="text"
              required
              placeholder="Ex: Aluguel, Netflix, Internet, Academia"
              value={title}
              onChange={(e) => { setError(null); setTitle(e.target.value); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Frequência</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="mensal">Mensal</option>
                <option value="semanal">Semanal</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="moradia">Moradia</option>
                <option value="alimentacao">Alimentação</option>
                <option value="saude">Saúde</option>
                <option value="transporte">Transporte</option>
                <option value="educacao">Educação</option>
                <option value="lazer">Lazer</option>
                <option value="salario_prolabore">Receita / Pró-labore</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Próximo Vencimento</label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
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
              disabled={isSubmitting || !title.trim() || !amount}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Salvar Regra</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
