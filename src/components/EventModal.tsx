import { useState, useEffect } from 'react';
import { CalendarEvent, ContextMode } from '../types';
import { X } from 'lucide-react';

interface Props {
  mode: ContextMode;
  event?: CalendarEvent | null;
  onClose: () => void;
  onSave: (e: Omit<CalendarEvent, 'id' | 'type' | 'status'>) => void;
}

export function EventModal({ mode, event, onClose, onSave }: Props) {
  const [title, setTitle] = useState(event?.title || '');
  const [time, setTime] = useState(event?.time || '');
  const [duration, setDuration] = useState(event?.duration || '');
  const [client, setClient] = useState(event?.client || '');
  const [value, setValue] = useState(event?.value?.toString() || '');
  
  const isPJ = mode === 'PJ';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const parsedValue = value ? parseFloat(value.replace(',', '.')) : undefined;
  const isValidValue = parsedValue === undefined || !isNaN(parsedValue);

  const handleSubmit = () => {
    if (title.trim() && time.trim() && duration.trim() && isValidValue) {
      onSave({ 
        title: title.trim(), 
        time: time.trim(), 
        duration: duration.trim(), 
        client: isPJ && client.trim() ? client.trim() : undefined, 
        value: isPJ && parsedValue !== undefined ? parsedValue : undefined 
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
            {event ? 'Editar Compromisso' : 'Novo Compromisso'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Título</label>
            <input 
              autoFocus 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-colors text-slate-900 ${isPJ ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}`}
              placeholder="Ex: Terapia / Academia" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Horário</label>
              <input 
                type="text" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-colors text-slate-900 ${isPJ ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}`}
                placeholder="Ex: 18:30" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duração</label>
              <input 
                type="text" 
                value={duration} 
                onChange={e => setDuration(e.target.value)} 
                className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-colors text-slate-900 ${isPJ ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}`}
                placeholder="Ex: 1h 30m" 
              />
            </div>
          </div>
          
          {isPJ && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label>
                <input 
                  type="text" 
                  value={client} 
                  onChange={e => setClient(e.target.value)} 
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-colors text-slate-900 focus:ring-indigo-500`}
                  placeholder="Nome do cliente" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor (R$)</label>
                <input 
                  type="number" 
                  value={value} 
                  onChange={e => setValue(e.target.value)} 
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-colors text-slate-900 focus:ring-indigo-500`}
                  placeholder="0,00" 
                />
              </div>
            </div>
          )}
          
          <button 
            onClick={handleSubmit} 
            className={`w-full mt-2 py-4 text-white font-semibold rounded-2xl transition-transform transform hover:scale-[1.01] active:scale-95 text-lg shadow-sm disabled:opacity-50 ${isPJ ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={!title.trim() || !time.trim() || !duration.trim() || !isValidValue}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
