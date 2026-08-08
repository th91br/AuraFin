import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  term: string;
  explanation: string;
}

export function HelpTooltip({ term, explanation }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center group">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
        title={`Explicação sobre ${term}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-slate-100 text-xs rounded-xl shadow-xl border border-slate-700 z-50 animate-in fade-in duration-150 pointer-events-none">
          <div className="font-bold text-white mb-1">{term}</div>
          <div className="text-slate-300 font-normal leading-relaxed">{explanation}</div>
        </div>
      )}
    </div>
  );
}
