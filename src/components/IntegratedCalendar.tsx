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
  const filteredEvents = events.filter(e => mode === 'PJ' ? e.type !== 'PF' : e.type !== 'PJ');
  
  const isPJ = mode === 'PJ';
  const themeColor = isPJ 
    ? 'text-indigo-600 bg-indigo-50/50 border-indigo-200' 
    : 'text-blue-600 bg-blue-50/50 border-blue-200';

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col h-[700px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-2xl ${isPJ ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
              {isPJ ? 'Agenda de Operações' : 'Seu Tempo'}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">Hoje, 7 de Agosto</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onAdd} 
            className={`flex items-center space-x-1.5 px-4 py-2.5 font-semibold rounded-xl transition-colors shadow-sm ring-1 transform hover:scale-[1.02] active:scale-95 ${
              isPJ
                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-indigo-700/5'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 ring-blue-700/5'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Novo</span>
          </button>
          <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center px-2 py-2">
            Ver Semana <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4 relative overflow-y-auto pr-4 scrollbar-hide">
        {/* Timeline line */}
        <div className="absolute left-[3.25rem] top-4 bottom-4 w-px bg-slate-100 z-0"></div>

        {filteredEvents.map((event) => {
          const isBlocked = event.type === 'BLOCKED';
          const isActionable = event.status === 'action_required';

          return (
            <div key={event.id} className="relative z-10 flex items-start group">
              <div className="w-20 pt-4 flex-shrink-0">
                <span className="text-sm font-semibold text-slate-500">{event.time}</span>
              </div>

              <div className={`flex-1 rounded-3xl p-5 border transition-all duration-300 relative ${
                isBlocked
                  ? 'bg-slate-50/50 border-slate-200 border-dashed opacity-80'
                  : isActionable
                    ? `${themeColor} shadow-sm ring-4 ring-white`
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}>
                
                {!isBlocked && (
                  <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={() => onEdit(event)} className={`p-2 text-slate-400 bg-white rounded-lg shadow-sm border border-slate-100 transition-colors ${isPJ ? 'hover:text-indigo-600' : 'hover:text-blue-600'}`}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(event.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-lg shadow-sm border border-slate-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="pr-16">
                    <div className="flex items-center space-x-2 mb-1.5">
                      {isBlocked && <Lock className="w-4 h-4 text-slate-400" />}
                      <h4 className={`text-lg font-semibold tracking-tight ${isBlocked ? 'text-slate-500' : 'text-slate-900'}`}>
                        {event.title}
                      </h4>
                    </div>
                    {event.client && (
                      <p className="text-sm text-slate-600 mb-3">{event.client}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm font-medium text-slate-500">
                      <span className="flex items-center bg-white/60 px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {event.duration}
                      </span>
                      {event.value && (
                        <span className="flex items-center text-emerald-700 bg-white/60 px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                          <Banknote className="w-4 h-4 mr-1.5" />
                          R$ {event.value.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {isActionable && isPJ && (
                    <button
                      onClick={() => onActionClick(event)}
                      className="flex items-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                      <span>Faturar Agora</span>
                      <CheckCircle2 className="w-4 h-4" />
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
