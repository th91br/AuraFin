import { 
  LayoutDashboard, 
  PieChart, 
  Landmark, 
  FileText, 
  Activity, 
  BarChart3, 
  Briefcase, 
  AlertCircle, 
  FileCheck2, 
  Plus, 
  ShieldCheck
} from 'lucide-react';
import { ContextMode, PFTab, PJTab } from '../types';

interface SidebarProps {
  mode: ContextMode;
  pfTab: PFTab;
  setPfTab: (tab: PFTab) => void;
  pjTab: PJTab;
  setPjTab: (tab: PJTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  pendingReimbursementAmount: number;
  defaultersCount: number;
  onOpenTransactionModal: () => void;
  onOpenBillingModal: () => void;
}

export function Sidebar({
  mode,
  pfTab,
  setPfTab,
  pjTab,
  setPjTab,
  isCollapsed,
  pendingReimbursementAmount,
  defaultersCount,
  onOpenTransactionModal,
  onOpenBillingModal,
}: SidebarProps) {
  const isPJ = mode === 'PJ';

  return (
    <aside
      className={`relative flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 select-none border-r ${
        isPJ
          ? 'bg-slate-900 text-slate-100 border-slate-800'
          : 'bg-white text-slate-900 border-slate-200 shadow-sm'
      } ${isCollapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Sidebar Top Branding Header - Logo Always Visible */}
      <div className={`p-4 flex items-center border-b transition-all ${
        isCollapsed ? 'justify-center' : 'justify-start space-x-3'
      } ${isPJ ? 'border-slate-800' : 'border-slate-100'}`}>
        
        {/* Logo Avatar "A" - Prominently Displayed */}
        <div 
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm transition-transform hover:scale-105 ${
            isPJ 
              ? 'bg-slate-800 text-slate-100 border border-slate-700' 
              : 'bg-slate-900 text-white'
          }`}
          title="AuraFin - Plataforma Híbrida PF+PJ"
        >
          A
        </div>

        {!isCollapsed && (
          <div className="truncate animate-in fade-in duration-200">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">AURAFIN</span>
              <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded border ${
                isPJ ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {isPJ ? 'PJ' : 'PF'}
              </span>
            </div>
            <p className={`text-[11px] font-medium truncate ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
              {isPJ ? 'Gestão Corporativa' : 'Finanças Pessoais'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto scrollbar-none">
        {!isPJ ? (
          // Modo PF (Pessoa Física)
          <>
            {!isCollapsed && (
              <p className="px-3 text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-2">
                Navegação Pessoal
              </p>
            )}

            <button
              onClick={() => setPfTab('overview')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                pfTab === 'overview'
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200/80 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title="Resumo & Extrato"
            >
              <LayoutDashboard className="w-5 h-5 shrink-0 text-indigo-700" />
              {!isCollapsed && <span className="truncate">Resumo & Extrato</span>}
            </button>

            <button
              onClick={() => setPfTab('budget')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                pfTab === 'budget'
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200/80 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title="Orçamento & Categorias"
            >
              <PieChart className="w-5 h-5 shrink-0 text-indigo-700" />
              {!isCollapsed && <span className="truncate">Orçamento & Categorias</span>}
            </button>

            <button
              onClick={() => setPfTab('wealth')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                pfTab === 'wealth'
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200/80 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title="Patrimônio & Ativos"
            >
              <Landmark className="w-5 h-5 shrink-0 text-indigo-700" />
              {!isCollapsed && <span className="truncate">Patrimônio & Ativos</span>}
            </button>

            <button
              onClick={() => setPfTab('tax_planning')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                pfTab === 'tax_planning'
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200/80 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title="Reserva & Pré-IRPF"
            >
              <FileText className="w-5 h-5 shrink-0 text-indigo-700" />
              {!isCollapsed && <span className="truncate">Reserva & Pré-IRPF</span>}
            </button>
          </>
        ) : (
          // Modo PJ (Pessoa Jurídica)
          <>
            {!isCollapsed && (
              <p className="px-3 text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-2">
                Operação Empresa
              </p>
            )}

            <button
              onClick={() => setPjTab('overview')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                pjTab === 'overview'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Dashboard Gerencial"
            >
              <Activity className="w-5 h-5 shrink-0 text-sky-400" />
              {!isCollapsed && <span className="truncate">Dashboard Gerencial</span>}
            </button>

            <button
              onClick={() => setPjTab('dre_cashflow')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                pjTab === 'dre_cashflow'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="DRE & Ponto de Equilíbrio"
            >
              <BarChart3 className="w-5 h-5 shrink-0 text-sky-400" />
              {!isCollapsed && <span className="truncate">DRE & Ponto de Equilíbrio</span>}
            </button>

            <button
              onClick={() => setPjTab('projects')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                pjTab === 'projects'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Margem por Projeto"
            >
              <Briefcase className="w-5 h-5 shrink-0 text-sky-400" />
              {!isCollapsed && <span className="truncate">Margem por Projeto</span>}
            </button>

            <button
              onClick={() => setPjTab('defaulters')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                pjTab === 'defaulters'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Radar de Inadimplência"
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'} overflow-hidden`}>
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                {!isCollapsed && <span className="truncate">Radar Inadimplência</span>}
              </div>
              {!isCollapsed && defaultersCount > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {defaultersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setPjTab('accounting')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                pjTab === 'accounting'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Central do Contador & Reembolso"
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'} overflow-hidden`}>
                <FileCheck2 className="w-5 h-5 shrink-0 text-sky-400" />
                {!isCollapsed && <span className="truncate">Central do Contador</span>}
              </div>
              {!isCollapsed && pendingReimbursementAmount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Sidebar Footer & Action */}
      <div className={`p-4 border-t space-y-3 ${
        isPJ ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50/50'
      }`}>
        {!isPJ ? (
          <button
            onClick={onOpenTransactionModal}
            className={`w-full flex items-center justify-center space-x-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs ${
              isCollapsed ? 'px-0' : 'px-4'
            }`}
            title="Novo Lançamento PF"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Novo Lançamento</span>}
          </button>
        ) : (
          <button
            onClick={onOpenBillingModal}
            className={`w-full flex items-center justify-center space-x-2 py-3 bg-slate-100 hover:bg-white text-slate-900 font-extrabold rounded-xl transition-all shadow-sm active:scale-95 text-xs ${
              isCollapsed ? 'px-0' : 'px-4'
            }`}
            title="Emitir Fatura PJ"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Emitir Fatura / Pix</span>}
          </button>
        )}

        {!isCollapsed && (
          <div className={`flex items-center justify-between text-[11px] pt-1 px-1 font-medium ${
            isPJ ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sessão Local Criptografada</span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
