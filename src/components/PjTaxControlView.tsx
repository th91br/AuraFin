import { HelpCircle, Plus } from 'lucide-react';

interface Props {
  isPrivacyMode?: boolean;
  onAddTaxRecord?: () => void;
}

export function PjTaxControlView({ onAddTaxRecord }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Controle Gerencial de Impostos</h1>
          <p className="text-xs text-slate-300 mt-1">Previsão e acompanhamento de guias tributárias (DAS, ISS, IRPJ, CSLL).</p>
        </div>
        {onAddTaxRecord && (
          <button
            onClick={onAddTaxRecord}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar imposto</span>
          </button>
        )}
      </div>

      <div className="min-h-[260px] p-8 rounded-2xl bg-slate-900/80 border border-dashed border-white/10 text-center text-sm text-slate-300 flex flex-col items-center justify-center gap-3">
        <HelpCircle className="w-8 h-8 text-cyan-400" />
        <h3 className="font-bold text-white text-base">Nenhuma guia fiscal pendente</h3>
        <p className="text-xs text-slate-400 max-w-md">
          Os lançamentos de impostos são sincronizados com suas contas a pagar e comprovantes arquivados. A apuração oficial e emissão de guias permanece sob responsabilidade do seu contador.
        </p>
      </div>
    </div>
  );
}
