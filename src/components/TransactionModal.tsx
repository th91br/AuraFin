import { useState } from 'react';
import { Transaction, ContextMode } from '../types';
import { X } from 'lucide-react';

interface Props {
  mode: ContextMode;
  transaction?: Transaction | null;
  onClose: () => void;
  onSave: (t: Omit<Transaction, 'id' | 'context' | 'date'>) => void;
}

export function TransactionModal({ mode, transaction, onClose, onSave }: Props) {
  const [title, setTitle] = useState(transaction?.title || '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  
  const [isPersonal, setIsPersonal] = useState(transaction?.isPersonalExpenseInPJ || false);
  const [isPaidByPF, setIsPaidByPF] = useState(transaction?.isPaidByPF || false);

  const isPJ = mode === 'PJ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
            {transaction ? 'Editar Movimentação' : 'Nova Movimentação'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
            <input 
              autoFocus 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-colors text-slate-900 ${isPJ ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}`}
              placeholder="Ex: Supermercado" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-colors text-slate-900 ${isPJ ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}`}
              placeholder="0,00" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button 
              onClick={() => setType('income')} 
              className={`py-3.5 rounded-xl font-semibold border-2 transition-colors ${
                type === 'income' 
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50' 
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              Entrada
            </button>
            <button 
              onClick={() => setType('expense')} 
              className={`py-3.5 rounded-xl font-semibold border-2 transition-colors ${
                type === 'expense' 
                  ? 'border-red-500 text-red-700 bg-red-50' 
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              Saída
            </button>
          </div>
          
          {isPJ && type === 'expense' && (
            <div className="space-y-4 pt-4 mt-2 border-t border-slate-100">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isPersonal} 
                  onChange={(e) => { setIsPersonal(e.target.checked); if (e.target.checked) setIsPaidByPF(false); }} 
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <div>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Despesa de uso pessoal</p>
                  <p className="text-xs text-slate-500">Classificar como Pró-labore e enviar p/ PF</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isPaidByPF} 
                  onChange={(e) => { setIsPaidByPF(e.target.checked); if (e.target.checked) setIsPersonal(false); }} 
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <div>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Pago com dinheiro pessoal</p>
                  <p className="text-xs text-slate-500">Gerar dívida com o sócio (reembolsável)</p>
                </div>
              </label>
            </div>
          )}
          
          <button 
            onClick={() => {
              if (title && amount) {
                onSave({ 
                  title, 
                  amount: parseFloat(amount), 
                  type,
                  isPersonalExpenseInPJ: isPersonal,
                  isPaidByPF: isPaidByPF
                });
              }
            }} 
            className={`w-full mt-2 py-4 text-white font-semibold rounded-2xl transition-transform transform hover:scale-[1.01] active:scale-95 text-lg shadow-sm disabled:opacity-50 ${isPJ ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={!title || !amount}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
