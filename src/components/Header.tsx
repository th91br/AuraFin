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
    <header className="h-14 bg-white text-slate-950 border-b border-slate-200/70 sticky top-0 z-20 backdrop-blur-md transition-colors duration-200">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        
        {/* Left: Sidebar Toggle & Brand Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarCollapsed((prev: boolean) => !prev)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            title="Alternar Menu Lateral"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setViewMode('landing')}>
            <span className="font-black text-sm tracking-tight text-slate-950">AURAFIN</span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">|</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              {isPJ ? 'Pessoa Jurídica' : 'Pessoa Física'}
            </span>
          </div>
        </div>

        {/* Central Mode Switcher (PF vs PJ) */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/60 text-xs">
          {/* Botão PF (Branco quando ativo) */}
          <button
            onClick={() => setMode('PF')}
            className={`flex items-center px-4 py-1.5 rounded-lg font-semibold transition-all ${
              !isPJ 
                ? 'bg-white shadow-xs text-slate-950 border border-slate-200/80' 
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <User className="w-3.5 h-3.5 mr-1.5 text-slate-700" />
            <span>Pessoa Física</span>
          </button>

          {/* Botão PJ (Preto Executivo Destacado quando ativo) */}
          <button
            onClick={() => setMode('PJ')}
            className={`flex items-center px-4 py-1.5 rounded-lg font-semibold transition-all ${
              isPJ 
                ? 'bg-slate-950 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
            <span>Pessoa Jurídica</span>

            {pendingReimbursementAmount > 0 && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center space-x-2">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            title="Buscar registro (Cmd + K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Buscar</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white text-slate-500 border border-slate-200/80">⌘K</kbd>
          </button>

          {/* Privacy Mode Toggle */}
          <button
            onClick={() => setIsPrivacyMode((prev: boolean) => !prev)}
            className={`p-1.5 rounded-lg transition-colors ${
              isPrivacyMode
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
            }`}
            title={isPrivacyMode ? 'Mostrar valores' : 'Ocultar valores'}
          >
            {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Landing Page Link */}
          <button
            onClick={() => setViewMode('landing')}
            className="hidden lg:flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            title="Ver Landing Page Institucional"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Landing Page</span>
          </button>

          {pendingReimbursementAmount > 0 && (
            <div className="hidden xl:flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Reembolso: R$ {pendingReimbursementAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          {onResetDemo && (
            <button
              onClick={onResetDemo}
              title="Restaurar dados originais"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Right Rail Toggle Button */}
          <button
            onClick={() => setIsRightRailOpen((prev: boolean) => !prev)}
            className={`p-1.5 rounded-lg transition-all ${
              isRightRailOpen
                ? 'bg-slate-950 text-white'
                : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
            }`}
            title="Alternar Painel Lateral"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
