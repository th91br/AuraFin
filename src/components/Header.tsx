import { Building2, User } from 'lucide-react';
import { ContextMode } from '../types';

export function Header({ mode, setMode }: { mode: ContextMode; setMode: (m: ContextMode) => void }) {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <span className="font-semibold text-slate-900 text-lg tracking-tight">AURAFIN</span>
      </div>

      <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl shadow-inner border border-slate-200/60">
        <button
          onClick={() => setMode('PF')}
          className={`relative flex items-center px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            mode === 'PF' 
              ? 'bg-white shadow-sm text-blue-600 ring-1 ring-slate-900/5' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          {mode === 'PJ' && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-100" />
          )}
          <User className="w-4 h-4 mr-2" />
          Vida (PF)
        </button>
        <button
          onClick={() => setMode('PJ')}
          className={`relative flex items-center px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            mode === 'PJ' 
              ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-slate-900/5' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Negócios (PJ)
        </button>
      </div>
      
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 cursor-pointer">
        <User className="w-5 h-5 text-slate-600" />
      </div>
    </header>
  );
}
