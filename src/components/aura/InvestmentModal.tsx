import React, { useState } from 'react';
import { InvestmentItem } from '../../types';
import { TrendingUp, X, Loader2, Plus, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inv: Partial<InvestmentItem>) => Promise<void>;
}

export function InvestmentModal({ isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState('Renda Fixa');
  const [institution, setInstitution] = useState('');
  const [investedValue, setInvestedValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !institution.trim()) {
      setError('Nome do ativo e instituição são obrigatórios.');
      return;
    }

    const current = parseFloat(currentValue) || 0;
    const invested = parseFloat(investedValue) || current;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        assetType,
        institution: institution.trim(),
        totalValue: current,
        investedValue: invested,
        quantity: 1,
        averagePrice: invested,
        currentPrice: current
      });
      setName('');
      setInstitution('');
      setInvestedValue('');
      setCurrentValue('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao cadastrar investimento.');
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
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Novo Investimento</h2>
            <p className="text-xs text-slate-400">Cadastre ativo, renda fixa, ações, FIIs ou fundos.</p>
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
            <label className="font-semibold text-slate-300 block">Nome do Ativo / Código *</label>
            <input
              type="text"
              required
              placeholder="Ex: Tesouro Selic 2029, CDB 110% CDI, IVVB11, PETR4"
              value={name}
              onChange={(e) => { setError(null); setName(e.target.value); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Classe do Ativo</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Renda Fixa">Renda Fixa / CDB / Tesouro</option>
                <option value="Ações">Ações (B3 / Exterior)</option>
                <option value="FIIs">Fundos Imobiliários (FIIs)</option>
                <option value="ETFs">ETFs / Fundos de Índice</option>
                <option value="Cripto">Criptomoedas / Ativos Digitais</option>
                <option value="Outros">Outros Ativos</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Instituição / Corretora *</label>
              <input
                type="text"
                required
                placeholder="Ex: BTG, XP, NuInvest, Inter"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Valor Aplicado (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={investedValue}
                onChange={(e) => setInvestedValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Valor Atual Posição (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono font-bold"
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
              disabled={isSubmitting || !name.trim() || !institution.trim() || !currentValue}
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
                  <span>Salvar Investimento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
