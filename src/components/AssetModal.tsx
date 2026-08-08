import { useState, useEffect } from 'react';
import { Asset } from '../types';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (asset: Omit<Asset, 'id'>) => void;
}

export function AssetModal({ onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Asset['category']>('outros');
  const [value, setValue] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const parsedValue = parseFloat(value.replace(',', '.'));
  const isValidValue = !isNaN(parsedValue) && parsedValue >= 0;

  const handleSubmit = () => {
    if (name.trim() && isValidValue) {
      onSave({ name: name.trim(), category, value: parsedValue });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-semibold text-slate-900">Novo Patrimônio</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do Ativo / Bem</label>
            <input 
              autoFocus
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors text-slate-900"
              placeholder="Ex: Apartamento, Tesouro Direto" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoria</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value as Asset['category'])}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors text-slate-900"
            >
              <option value="imovel">Imóvel</option>
              <option value="veiculo">Veículo</option>
              <option value="renda_fixa">Renda Fixa</option>
              <option value="acoes">Ações / Fundos</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor Atual (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0"
              value={value} 
              onChange={e => setValue(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors text-slate-900"
              placeholder="0,00" 
            />
          </div>
          
          <button 
            onClick={handleSubmit} 
            className="w-full mt-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-transform transform hover:scale-[1.01] active:scale-95 text-lg shadow-sm disabled:opacity-50"
            disabled={!name.trim() || !isValidValue}
          >
            Adicionar ao Patrimônio
          </button>
        </div>
      </div>
    </div>
  );
}
