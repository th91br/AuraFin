import { useState } from 'react';
import { Project } from '../types';
import { X } from 'lucide-react';

interface Props {
  isOpen?: boolean;
  onClose: () => void;
  onSave: (p: { name: string; client: string; revenue: number; cost: number; deadline: string }) => void;
}

export function ProjectModal({ isOpen = true, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [revenue, setRevenue] = useState('');
  const [cost, setCost] = useState('');
  const [deadline, setDeadline] = useState('');

  if (isOpen === false) return null;

  const parsedRevenue = parseFloat(revenue.replace(',', '.'));
  const parsedCost = parseFloat(cost.replace(',', '.'));

  const handleSubmit = () => {
    if (name.trim() && client.trim() && !isNaN(parsedRevenue)) {
      onSave({
        name: name.trim(),
        client: client.trim(),
        revenue: parsedRevenue,
        cost: isNaN(parsedCost) ? 0 : parsedCost,
        deadline: deadline.trim() || '2026-12-31',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h3 className="text-xl font-bold text-white">Novo Projeto / Contrato</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase">Nome do Projeto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Consultoria API Mobile"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase">Nome do Cliente</label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Ex: TechCorp Ltda"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white outline-none focus:border-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase font-sans">Receita (R$)</label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="15000"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase font-sans">Custo Direto (R$)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="3000"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase">Prazo / Entrega</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !client.trim() || isNaN(parsedRevenue)}
            className="w-full mt-4 py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl transition-all shadow-md active:scale-95 text-xs disabled:opacity-50"
          >
            Cadastrar Projeto
          </button>
        </div>
      </div>
    </div>
  );
}
