import React, { useState } from 'react';
import { Transaction, ContextMode, TransactionType } from '../types';
import { MoneyInput } from './ui/MoneyInput';
import { X, User, Building2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>) => void;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, onSave, editingTransaction }: Props) {
  const [context, setContext] = useState<ContextMode>(editingTransaction?.context || 'PF');
  const [type, setType] = useState<TransactionType>(editingTransaction?.type || 'expense');
  const [title, setTitle] = useState(editingTransaction?.title || '');
  const [amount, setAmount] = useState<number>(editingTransaction?.amount || 0);
  const [date, setDate] = useState(editingTransaction?.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(editingTransaction?.category || 'outros');
  
  // Advanced options state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPaidByPF, setIsPaidByPF] = useState(editingTransaction?.isPaidByPF || false);
  const [isPersonalExpenseInPJ, setIsPersonalExpenseInPJ] = useState(editingTransaction?.isPersonalExpenseInPJ || false);
  const [isTaxDeductiblePF, setIsTaxDeductiblePF] = useState(editingTransaction?.isTaxDeductiblePF || false);
  const [recurrence, setRecurrence] = useState<'unica' | 'mensal' | 'semanal' | 'anual'>(editingTransaction?.recurrence || 'unica');

  if (!isOpen) return null;

  // Sugestão automática de categoria baseada na palavra-chave
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    const lower = newTitle.toLowerCase();
    if (context === 'PF') {
      if (lower.includes('mercado') || lower.includes('pão') || lower.includes('ifood')) setCategory('alimentacao');
      else if (lower.includes('unimed') || lower.includes('médico') || lower.includes('farmácia')) setCategory('saude');
      else if (lower.includes('curso') || lower.includes('faculdade') || lower.includes('livro')) setCategory('educacao');
      else if (lower.includes('aluguel') || lower.includes('luz') || lower.includes('internet')) setCategory('moradia');
    } else {
      if (lower.includes('aws') || lower.includes('vercel') || lower.includes('figma')) setCategory('software_infra');
      else if (lower.includes('das') || lower.includes('imposto') || lower.includes('simples')) setCategory('impostos');
      else if (lower.includes('facebook') || lower.includes('google ads')) setCategory('marketing');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) {
      alert('Por favor, informe a descrição e um valor maior que zero.');
      return;
    }

    onSave({
      id: editingTransaction?.id,
      context,
      type,
      title,
      amount,
      amountCents: Math.round(amount * 100),
      date,
      category,
      isPaidByPF,
      isPersonalExpenseInPJ,
      isTaxDeductiblePF,
      recurrence,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-3xl p-8 max-w-lg w-full border border-slate-800 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">
              {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Registre de forma simples e rápida.</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* STEP 1: CONTEXTO (PF vs PJ) */}
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-300 text-xs">1. Esta movimentação pertence a quem?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setContext('PF'); setCategory('outros'); }}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold border transition-all ${
                  context === 'PF'
                    ? 'bg-indigo-900/60 border-indigo-400 text-white'
                    : 'bg-slate-900 border-slate-700 text-white/70 hover:border-slate-500 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 text-indigo-300" />
                <span>Pessoa Física (PF)</span>
              </button>

              <button
                type="button"
                onClick={() => { setContext('PJ'); setCategory('outros'); }}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold border transition-all ${
                  context === 'PJ'
                    ? 'bg-cyan-900/60 border-cyan-400 text-white'
                    : 'bg-slate-900 border-slate-700 text-white/70 hover:border-slate-500 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-cyan-300" />
                <span>Pessoa Jurídica (PJ)</span>
              </button>
            </div>
          </div>

          {/* STEP 2: TIPO (ENTRADA vs SAÍDA) */}
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-300 text-xs">2. Qual o tipo do fluxo?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2.5 rounded-xl font-bold border transition-all ${
                  type === 'income'
                    ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200'
                    : 'bg-slate-900 border-slate-700 text-white/70 hover:border-slate-500 hover:text-white'
                }`}
              >
                + Entrada (Receita)
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2.5 rounded-xl font-bold border transition-all ${
                  type === 'expense'
                    ? 'bg-rose-900/60 border-rose-400 text-rose-200'
                    : 'bg-slate-900 border-slate-700 text-white/70 hover:border-slate-500 hover:text-white'
                }`}
              >
                - Saída (Despesa)
              </button>
            </div>
          </div>

          {/* DESCRIÇÃO E VALOR */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-400 uppercase mb-1">Descrição / Título:</label>
              <input
                type="text"
                placeholder="Ex: Supermercado, AWS Cloud, Pró-labore..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white outline-none focus:border-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Valor (R$):</label>
                <MoneyInput value={amount} onChange={setAmount} />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Data:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold font-mono text-white outline-none focus:border-slate-600"
                />
              </div>
            </div>
          </div>

          {/* ADVANCED OPTIONS TOGGLE */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-xs text-slate-400 font-bold hover:text-white py-1"
            >
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mais Opções Avançadas (Recorrência, IRPF, Conciliação)</span>
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
                {context === 'PJ' && type === 'expense' && (
                  <label className="flex items-center space-x-2.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isPaidByPF}
                      onChange={(e) => setIsPaidByPF(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                    />
                    <span className="font-semibold">Esta despesa foi paga com dinheiro pessoal do sócio (Cartão/Conta PF)</span>
                  </label>
                )}

                {context === 'PJ' && type === 'expense' && (
                  <label className="flex items-center space-x-2.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isPersonalExpenseInPJ}
                      onChange={(e) => setIsPersonalExpenseInPJ(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-0"
                    />
                    <span className="font-semibold">Esta é uma despesa pessoal do sócio paga na conta PJ (Ajustar como Pró-labore)</span>
                  </label>
                )}

                {context === 'PF' && type === 'expense' && (
                  <label className="flex items-center space-x-2.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isTaxDeductiblePF}
                      onChange={(e) => setIsTaxDeductiblePF(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-0"
                    />
                    <span className="font-semibold">Marcar como potencialmente dedutível para o IRPF (Saúde / Educação)</span>
                  </label>
                )}

                <div className="pt-2">
                  <label className="block text-slate-400 font-bold mb-1 uppercase text-[10px]">Frequência de Recorrência:</label>
                  <select
                    value={recurrence}
                    onChange={(e: any) => setRecurrence(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white outline-none"
                  >
                    <option value="unica">Única / Pontual</option>
                    <option value="mensal">Mensal Recorrente</option>
                    <option value="semanal">Semanal Recorrente</option>
                    <option value="anual">Anual Recorrente</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            {editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
          </button>
        </form>
      </div>
    </div>
  );
}
