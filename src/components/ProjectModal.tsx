import { useState } from 'react';
import { Project } from '../types';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (p: Omit<Project, 'id'>) => void;
}

export function ProjectModal({ onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [revenue, setRevenue] = useState('');
  const [cost, setCost] = useState('');
  const [deadline, setDeadline] = useState('');

  const parsedRevenue = parseFloat(revenue.replace(',', '.'));
  const parsedCost = parseFloat(cost.replace(',', '.'));

  const handleSubmit = () => {
    if (name.trim() && client.trim() && !isNaN(parsedRevenue)) {
      onSave({
        name: name.trim(),
        client: client.trim(),
        revenue: parsedRevenue,
        cost: isNaN(parsedCost) ? 0 : parsedCost,
        status: 'em_andamento',
        deadline: deadline.trim() || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Novo Projeto / Contrato</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Projeto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Consultoria API"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Cliente</label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Ex: TechCorp Ltda"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Receita Prevista (R$)</label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="15000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Custo Direto (R$)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="3000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Prazo / Entrega</label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Ex: 15/09/2026"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !client.trim() || isNaN(parsedRevenue)}
            className="w-full mt-4 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl transition-all shadow-md shadow-cyan-500/20 active:scale-95 text-sm disabled:opacity-50"
          >
            Cadastrar Projeto
          </button>
        </div>
      </div>
    </div>
  );
}
