import { Building2, User, RotateCcw, ArrowRightLeft, PanelLeft, PanelRight, Globe, Eye, EyeOff, Search } from 'lucide-react';
import { ContextMode, ViewMode } from '../types';

interface HeaderProps {
  mode: ContextMode;
  setMode: (m: ContextMode) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  pendingReimbursementAmount: number;
  onResetDemo?: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isRightRailOpen: boolean;
  setIsRightRailOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isPrivacyMode: boolean;
  setIsPrivacyMode: (privacy: boolean | ((prev: boolean) => boolean)) => void;
  onOpenSearch: () => void;
}

export function Header({
  mode,
  setMode,
  viewMode,
  setViewMode,
  pendingReimbursementAmount,
  onResetDemo,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isRightRailOpen,
  setIsRightRailOpen,
  isPrivacyMode,
  setIsPrivacyMode,
  onOpenSearch,
}: HeaderProps) {
  const isPJ = mode === 'PJ';

  return (
    <header className="bg-white/95 text-slate-900 border-b border-slate-200/80 sticky top-0 z-20 backdrop-blur-md transition-colors duration-200">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Sidebar Toggle & Context Description */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarCollapsed((prev: boolean) => !prev)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all"
            title="Alternar Menu Lateral Esquerdo"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:block cursor-pointer" onClick={() => setViewMode('landing')}>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">AURAFIN</span>
              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${
                isPJ ? 'bg-slate-900 text-white border-slate-800' : 'bg-indigo-50 text-indigo-900 border-indigo-200'
              }`}>
                {isPJ ? 'Modo PJ' : 'Modo PF'}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {isPJ ? 'Caixa Corporativo & DRE Gerencial' : 'Vida Financeira Pessoal'}
            </p>
          </div>
        </div>

        {/* Central Mode Switcher (PF vs PJ) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
          {/* Botão PF (Branco quando ativo) */}
          <button
            onClick={() => setMode('PF')}
            className={`relative flex items-center px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              !isPJ 
                ? 'bg-white shadow-sm text-slate-900 border border-slate-200/80' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 mr-1.5 text-indigo-700" />
            <span>Pessoa Física (PF)</span>
          </button>

          {/* Botão PJ (Preto Executivo Destacado quando ativo) */}
          <button
            onClick={() => setMode('PJ')}
            className={`relative flex items-center px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              isPJ 
                ? 'bg-slate-900 text-white shadow-md border border-slate-800' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
            <span>Pessoa Jurídica (PJ)</span>

            {pendingReimbursementAmount > 0 && (
              <span className="ml-2 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center space-x-2 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            title="Buscar registro (Cmd + K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Buscar</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white text-slate-600 border border-slate-200">⌘K</kbd>
          </button>

          {/* Privacy Mode Toggle */}
          <button
            onClick={() => setIsPrivacyMode((prev: boolean) => !prev)}
            className={`p-2 rounded-xl border transition-colors ${
              isPrivacyMode
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title={isPrivacyMode ? 'Desativar Modo Privacidade (Mostrar valores)' : 'Ativar Modo Privacidade (Ocultar valores)'}
          >
            {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Landing Page Shortcut */}
          <button
            onClick={() => setViewMode('landing')}
            className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            title="Ver Landing Page Institucional"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Landing Page</span>
          </button>

          {pendingReimbursementAmount > 0 && (
            <div className="hidden xl:flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl border bg-amber-50 border-amber-200 text-amber-900">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Reembolso: R$ {pendingReimbursementAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          {onResetDemo && (
            <button
              onClick={onResetDemo}
              title="Restaurar dados originais de demonstração"
              className="p-2 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Right Rail Toggle Button */}
          <button
            onClick={() => setIsRightRailOpen((prev: boolean) => !prev)}
            className={`p-2 rounded-xl border transition-all ${
              isRightRailOpen
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Alternar Painel Lateral Direito (Insights / Ações)"
          >
            <PanelRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
