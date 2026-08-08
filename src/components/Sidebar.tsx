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
  ShieldCheck,
  Receipt,
  Users,
  CreditCard as CreditCardIcon,
  DollarSign,
  LineChart
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
      {/* Sidebar Top Header - Logo Always Visible */}
      <div className={`p-4 flex items-center border-b transition-all ${
        isCollapsed ? 'justify-center' : 'justify-start space-x-3'
      } ${isPJ ? 'border-slate-800' : 'border-slate-100'}`}>
        
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
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-none">
        {!isPJ ? (
          // --- MODO PF (PESSOA FÍSICA) ---
          <>
            {!isCollapsed && (
              <p className="px-3 text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1.5 mt-2">
                Navegação Pessoal
              </p>
            )}

            <button
              onClick={() => setPfTab('overview')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                pfTab === 'overview'
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200/80 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title="Visão Geral"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-700" />
              {!isCollapsed && <span className="truncate">Visão Geral</span>}
            </button>

            <button
              onClick={() => setPfTab('transactions')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                pfTab === 'transactions'
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200/80 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title="Movimentações & Cartões"
            >
              <Receipt className="w-4 h-4 shrink-0 text-indigo-700" />
              {!isCollapsed && <span className="truncate">Movimentações</span>}
            </button>

            <button
              onClick={() => setPfTab('planning')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                pfTab === 'planning'
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200/80 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title="Planejamento & Metas"
            >
              <PieChart className="w-4 h-4 shrink-0 text-indigo-700" />
              {!isCollapsed && <span className="truncate">Planejamento</span>}
            </button>

            <button
              onClick={() => setPfTab('wealth')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                pfTab === 'wealth'
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200/80 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title="Patrimônio & Ativos"
            >
              <Landmark className="w-4 h-4 shrink-0 text-indigo-700" />
              {!isCollapsed && <span className="truncate">Patrimônio</span>}
            </button>

            <button
              onClick={() => setPfTab('tax_planning')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                pfTab === 'tax_planning'
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200/80 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title="Radar IRPF"
            >
              <FileText className="w-4 h-4 shrink-0 text-indigo-700" />
              {!isCollapsed && <span className="truncate">IRPF</span>}
            </button>

            <button
              onClick={() => setPfTab('reports')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                pfTab === 'reports'
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-indigo-200/80 shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title="Relatórios PF"
            >
              <LineChart className="w-4 h-4 shrink-0 text-indigo-700" />
              {!isCollapsed && <span className="truncate">Relatórios</span>}
            </button>
          </>
        ) : (
          // --- MODO PJ (PESSOA JURÍDICA) ---
          <>
            {!isCollapsed && (
              <p className="px-3 text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1.5 mt-2">
                Operação Empresa
              </p>
            )}

            <button
              onClick={() => setPjTab('overview')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                pjTab === 'overview'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Visão Geral"
            >
              <Activity className="w-4 h-4 shrink-0 text-sky-400" />
              {!isCollapsed && <span className="truncate">Visão Geral</span>}
            </button>

            <button
              onClick={() => setPjTab('cashflow')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                pjTab === 'cashflow'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Caixa & DRE Gerencial"
            >
              <BarChart3 className="w-4 h-4 shrink-0 text-sky-400" />
              {!isCollapsed && <span className="truncate">Caixa & DRE</span>}
            </button>

            <button
              onClick={() => setPjTab('receivables_payables')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                pjTab === 'receivables_payables'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Receber & Pagar"
            >
              <DollarSign className="w-4 h-4 shrink-0 text-sky-400" />
              {!isCollapsed && <span className="truncate">Receber & Pagar</span>}
            </button>

            <button
              onClick={() => setPjTab('management')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                pjTab === 'management'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Gestão de Projetos & Clientes"
            >
              <Briefcase className="w-4 h-4 shrink-0 text-sky-400" />
              {!isCollapsed && <span className="truncate">Gestão</span>}
            </button>

            <button
              onClick={() => setPjTab('collections')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                pjTab === 'collections'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Cobranças & Faturamento"
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'} overflow-hidden`}>
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span className="truncate">Cobranças</span>}
              </div>
              {!isCollapsed && defaultersCount > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {defaultersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setPjTab('accounting')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                pjTab === 'accounting'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Central do Contador"
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'} overflow-hidden`}>
                <FileCheck2 className="w-4 h-4 shrink-0 text-sky-400" />
                {!isCollapsed && <span className="truncate">Contador</span>}
              </div>
              {!isCollapsed && pendingReimbursementAmount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => setPjTab('reports')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                pjTab === 'reports'
                  ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Relatórios PJ"
            >
              <LineChart className="w-4 h-4 shrink-0 text-sky-400" />
              {!isCollapsed && <span className="truncate">Relatórios</span>}
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
            className={`w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs ${
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
            className={`w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-100 hover:bg-white text-slate-900 font-extrabold rounded-xl transition-all shadow-sm active:scale-95 text-xs ${
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
