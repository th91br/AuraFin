import { Shield, Eye, Lock, Sparkles } from 'lucide-react';

interface Props {
  onUnlock: () => void;
}

export function PfPrivacyShieldView({ onUnlock }: Props) {
  return (
    <div className="min-h-[520px] flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md shadow-2xl text-center space-y-6 my-4 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Icon Badge */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner mx-auto">
          <Shield className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center border-2 border-slate-900 shadow-md">
          <Lock className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Texts */}
      <div className="space-y-2 max-w-md">
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800/80 rounded-full inline-flex items-center space-x-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Modo de Privacidade PF Ativo</span>
        </span>

        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight pt-1">
          Informações Pessoais Protegidas
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed pt-1">
          Todo o conteúdo, saldos, movimentações, contas, orçamentos, metas e relatórios do módulo de <strong>Pessoa Física (PF)</strong> foram temporariamente ocultados para sua segurança visual.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={onUnlock}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Eye className="w-4 h-4" />
          <span>Revelar Informações de PF</span>
        </button>
      </div>

      {/* Small Hint */}
      <p className="text-[11px] text-slate-400 font-medium pt-2">
        Você também pode alternar o modo clicando no ícone do olho na barra superior.
      </p>

    </div>
  );
}
