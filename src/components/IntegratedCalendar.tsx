import { ContextMode, CalendarEvent } from '../types';
import { Clock, CheckCircle2, Lock, Banknote, Calendar as CalendarIcon, ArrowRight, Plus, Pencil, Trash2 } from 'lucide-react';

interface Props {
  mode: ContextMode;
  events: CalendarEvent[];
  onActionClick: (e: CalendarEvent) => void;
  onAdd: () => void;
  onEdit: (e: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export function IntegratedCalendar({ mode, events, onActionClick, onAdd, onEdit, onDelete }: Props) {
  const isPJ = mode === 'PJ';

  // Processar eventos com Bloqueio Cego de Privacidade
  const processedEvents = events.map(e => {
    const isCrossContext = (isPJ && e.type === 'PF') || (!isPJ && e.type === 'PJ');
    if (isCrossContext) {
      return {
        ...e,
        title: isPJ ? 'Ocupado (Agenda Pessoal)' : 'Ocupado (Operação PJ)',
        client: undefined,
        value: undefined,
        isBlindBlock: true
      };
    }
    return { ...e, isBlindBlock: false };
  });

  return (
    <div className={`rounded-2xl border p-8 flex flex-col h-[700px] transition-colors ${
      isPJ 
        ? 'bg-slate-900 border-slate-800 text-white' 
        : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${isPJ ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${isPJ ? 'text-white' : 'text-slate-900'}`}>
              {isPJ ? 'Agenda de Operações PJ' : 'Seu Tempo Pessoal'}
            </h2>
            <p className={`text-xs mt-0.5 ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>Sincronização de Privacidade Ativa</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={onAdd} 
            className={`flex items-center space-x-1.5 px-4 py-2 font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 ${
              isPJ
                ? 'bg-slate-100 hover:bg-white text-slate-900'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 relative overflow-y-auto pr-2 scrollbar-none">
        {/* Timeline vertical line */}
        <div className={`absolute left-[3.25rem] top-4 bottom-4 w-px ${isPJ ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

        {processedEvents.map((event) => {
          const isBlocked = event.type === 'BLOCKED' || event.isBlindBlock;
          const isActionable = event.status === 'action_required' && !event.isBlindBlock;

          return (
            <div key={event.id} className="relative z-10 flex items-start group">
              <div className="w-20 pt-3 flex-shrink-0">
                <span className={`text-xs font-bold ${isPJ ? 'text-slate-400 font-mono' : 'text-slate-500'}`}>{event.time}</span>
              </div>

              <div className={`flex-1 rounded-2xl p-5 border transition-all relative ${
                isBlocked
                  ? isPJ ? 'bg-slate-950/60 border-slate-800 opacity-60' : 'bg-slate-50 border-slate-200 opacity-70'
                  : isPJ ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}>
                
                {!isBlocked && (
                  <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={() => onEdit(event)} className={`p-1.5 rounded-lg border transition-colors ${
                      isPJ ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'
                    }`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(event.id)} className={`p-1.5 rounded-lg border transition-colors ${
                      isPJ ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400' : 'bg-white text-slate-500 border-slate-200 hover:text-rose-600'
                    }`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="pr-12">
                    <div className="flex items-center space-x-2 mb-1.5">
                      {isBlocked && <Lock className="w-4 h-4 text-slate-400" />}
                      <h4 className={`text-base font-bold tracking-tight ${isBlocked ? 'text-slate-400' : isPJ ? 'text-white' : 'text-slate-900'}`}>
                        {event.title}
                      </h4>
                      {event.isBlindBlock && (
                        <span className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider rounded border ${
                          isPJ ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          Sincronia Privada
                        </span>
                      )}
                    </div>
                    {event.client && (
                      <p className={`text-xs mb-2 ${isPJ ? 'text-slate-400' : 'text-slate-600'}`}>{event.client}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {event.duration}
                      </span>
                      {event.value && (
                        <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          <Banknote className="w-3.5 h-3.5 mr-1" />
                          R$ {event.value.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {isActionable && isPJ && (
                    <button
                      onClick={() => onActionClick(event)}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-white text-slate-900 text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      <span>Faturar Agora</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
