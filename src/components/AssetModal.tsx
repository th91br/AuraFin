import { useState, useEffect } from 'react';
import { Asset } from '../types';
import { X } from 'lucide-react';

interface Props {
  isOpen?: boolean;
  onClose: () => void;
  onSave: (asset: { name: string; category: Asset['category']; value: number; notes: string }) => void;
}

export function AssetModal({ isOpen = true, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Asset['category']>('outros');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (isOpen === false) return null;

  const parsedValue = parseFloat(value.replace(',', '.'));
  const isValidValue = !isNaN(parsedValue) && parsedValue >= 0;

  const handleSubmit = () => {
    if (name.trim() && isValidValue) {
      onSave({ name: name.trim(), category, value: parsedValue, notes: notes.trim() });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">Cadastrar Patrimônio / Ativo</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase">Nome do Ativo / Bem</label>
            <input 
              autoFocus
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-bold outline-none"
              placeholder="Ex: Apartamento, Tesouro Direto" 
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase">Categoria</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value as Asset['category'])}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-bold outline-none"
            >
              <option value="imovel">Imóvel</option>
              <option value="veiculo">Veículo (FIPE)</option>
              <option value="renda_fixa">Renda Fixa</option>
              <option value="acoes">Ações / Fundos</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase">Valor Atual (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0"
              value={value} 
              onChange={e => setValue(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono font-bold outline-none"
              placeholder="0,00" 
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase">Observações / Escritura:</label>
            <input 
              type="text" 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-bold outline-none"
              placeholder="Ex: Matrícula 12345 no Cartório..." 
            />
          </div>
          
          <button 
            onClick={handleSubmit} 
            className="w-full mt-2 py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
            disabled={!name.trim() || !isValidValue}
          >
            Adicionar ao Patrimônio
          </button>
        </div>
      </div>
    </div>
  );
}
