import { Shield, Eye, Lock, Sparkles } from 'lucide-react';

interface Props {
  onUnlock: () => void;
}

export function PjPrivacyShieldView({ onUnlock }: Props) {
  return (
    <div className="min-h-[520px] flex flex-col items-center justify-center p-8 rounded-3xl bg-[#0F172A] border border-white/10 backdrop-blur-md shadow-2xl text-center space-y-6 my-4 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Icon Badge */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 flex items-center justify-center shadow-inner mx-auto">
          <Shield className="w-10 h-10 text-cyan-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center border-2 border-[#0F172A] shadow-md">
          <Lock className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Texts */}
      <div className="space-y-2 max-w-md">
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-cyan-950/90 text-cyan-300 border border-cyan-800 rounded-full inline-flex items-center space-x-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Modo de Privacidade PJ Ativo</span>
        </span>

        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight pt-1">
          Informações Empresariais Protegidas
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed pt-1">
          Todo o conteúdo, faturamento, caixa, DRE, projetos, impostos, cartões corporativos, sócios e relatórios de <strong>Pessoa Jurídica (PJ)</strong> foram temporariamente ocultados para sua segurança visual.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={onUnlock}
          className="flex items-center space-x-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
        >
          <Eye className="w-4 h-4" />
          <span>Revelar Informações de PJ</span>
        </button>
      </div>

      {/* Small Hint */}
      <p className="text-[11px] text-slate-400 font-medium pt-2">
        Você também pode alternar o modo clicando no ícone do olho na barra superior.
      </p>

    </div>
  );
}
