import { useState, useEffect } from 'react';
import { CalendarEvent, ContextMode } from '../types';
import { X } from 'lucide-react';

interface Props {
  isOpen?: boolean;
  mode?: ContextMode;
  event?: CalendarEvent | null;
  editingEvent?: CalendarEvent | null;
  onClose: () => void;
  onSave: (e: { title: string; time: string; duration: string; client?: string; value?: number }) => void;
}

export function EventModal({ isOpen = true, mode = 'PF', event, editingEvent, onClose, onSave }: Props) {
  const activeEvent = event || editingEvent;
  const [title, setTitle] = useState(activeEvent?.title || '');
  const [time, setTime] = useState(activeEvent?.time || '09:00');
  const [duration, setDuration] = useState(activeEvent?.duration || '1h');
  const [client, setClient] = useState(activeEvent?.client || '');
  const [value, setValue] = useState(activeEvent?.value?.toString() || '');
  
  const isPJ = mode === 'PJ';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (isOpen === false) return null;

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
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h3 className="text-xl font-bold text-white">
            {activeEvent ? 'Editar Compromisso' : 'Novo Compromisso na Agenda'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-400 mb-1 uppercase">Título do Compromisso</label>
            <input 
              autoFocus 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-bold outline-none"
              placeholder="Ex: Consulta Médica / Alinhamento de Contrato" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block font-bold text-slate-400 mb-1 uppercase font-sans">Horário</label>
              <input 
                type="text" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-bold outline-none"
                placeholder="Ex: 14:30" 
              />
            </div>
            <div>
              <label className="block font-bold text-slate-400 mb-1 uppercase font-sans">Duração</label>
              <input 
                type="text" 
                value={duration} 
                onChange={e => setDuration(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-bold outline-none"
                placeholder="Ex: 1h 30m" 
              />
            </div>
          </div>
          
          {isPJ && (
            <div className="grid grid-cols-2 gap-4 font-mono">
              <div>
                <label className="block font-bold text-slate-400 mb-1 uppercase font-sans">Cliente</label>
                <input 
                  type="text" 
                  value={client} 
                  onChange={e => setClient(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-bold outline-none font-sans"
                  placeholder="Nome do cliente" 
                />
              </div>
              <div>
                <label className="block font-bold text-slate-400 mb-1 uppercase font-sans">Valor (R$)</label>
                <input 
                  type="number" 
                  value={value} 
                  onChange={e => setValue(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-bold outline-none"
                  placeholder="0,00" 
                />
              </div>
            </div>
          )}
          
          <button 
            onClick={handleSubmit} 
            className="w-full mt-2 py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
            disabled={!title.trim() || !time.trim() || !duration.trim() || !isValidValue}
          >
            Salvar Compromisso
          </button>
        </div>
      </div>
    </div>
  );
}
