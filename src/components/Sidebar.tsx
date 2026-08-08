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
  Receipt,
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
      className={`relative flex flex-col h-screen sticky top-0 transition-all duration-200 z-30 select-none border-r bg-white text-slate-900 border-slate-200/60 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Top Logo Tile */}
      <div className={`p-3.5 flex items-center border-b border-slate-100 transition-all ${
        isCollapsed ? 'justify-center' : 'justify-start space-x-3'
      }`}>
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-base shrink-0 bg-slate-950 text-white shadow-xs"
          title="AuraFin"
        >
          A
        </div>

        {!isCollapsed && (
          <div className="truncate">
            <span className="font-black text-base tracking-tight text-slate-950">AuraFin</span>
            <p className="text-[11px] font-medium text-slate-400 -mt-0.5 truncate">
              {isPJ ? 'Pessoa Jurídica' : 'Pessoa Física'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto scrollbar-none">
        {!isPJ ? (
          // --- MODO PF (PESSOA FÍSICA) ---
          <>
            {!isCollapsed && (
              <p className="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5 mt-2">
                Pessoal
              </p>
            )}

            <button
              onClick={() => setPfTab('overview')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pfTab === 'overview'
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Visão Geral"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-700" />
              {!isCollapsed && <span className="truncate">Visão Geral</span>}
            </button>

            <button
              onClick={() => setPfTab('transactions')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pfTab === 'transactions'
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Movimentações & Cartões"
            >
              <Receipt className="w-4 h-4 shrink-0 text-slate-700" />
              {!isCollapsed && <span className="truncate">Movimentações</span>}
            </button>

            <button
              onClick={() => setPfTab('planning')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pfTab === 'planning'
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Planejamento & Metas"
            >
              <PieChart className="w-4 h-4 shrink-0 text-slate-700" />
              {!isCollapsed && <span className="truncate">Planejamento</span>}
            </button>

            <button
              onClick={() => setPfTab('wealth')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pfTab === 'wealth'
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Patrimônio & Ativos"
            >
              <Landmark className="w-4 h-4 shrink-0 text-slate-700" />
              {!isCollapsed && <span className="truncate">Patrimônio</span>}
            </button>

            <button
              onClick={() => setPfTab('tax_planning')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pfTab === 'tax_planning'
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Radar IRPF"
            >
              <FileText className="w-4 h-4 shrink-0 text-slate-700" />
              {!isCollapsed && <span className="truncate">IRPF</span>}
            </button>

            <button
              onClick={() => setPfTab('reports')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pfTab === 'reports'
                  ? 'bg-slate-100 text-slate-950 font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Relatórios PF"
            >
              <LineChart className="w-4 h-4 shrink-0 text-slate-700" />
              {!isCollapsed && <span className="truncate">Relatórios</span>}
            </button>
          </>
        ) : (
          // --- MODO PJ (PESSOA JURÍDICA) ---
          <>
            {!isCollapsed && (
              <p className="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5 mt-2">
                Empresa
              </p>
            )}

            <button
              onClick={() => setPjTab('overview')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pjTab === 'overview'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Visão Geral"
            >
              <Activity className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Visão Geral</span>}
            </button>

            <button
              onClick={() => setPjTab('cashflow')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pjTab === 'cashflow'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Caixa & DRE Gerencial"
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Caixa & DRE</span>}
            </button>

            <button
              onClick={() => setPjTab('receivables_payables')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pjTab === 'receivables_payables'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Receber & Pagar"
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Receber & Pagar</span>}
            </button>

            <button
              onClick={() => setPjTab('management')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pjTab === 'management'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Gestão de Projetos & Clientes"
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Gestão</span>}
            </button>

            <button
              onClick={() => setPjTab('collections')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pjTab === 'collections'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Cobranças & Faturamento"
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'} overflow-hidden`}>
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                {!isCollapsed && <span className="truncate">Cobranças</span>}
              </div>
              {!isCollapsed && defaultersCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  {defaultersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setPjTab('accounting')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pjTab === 'accounting'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Central do Contador"
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'} overflow-hidden`}>
                <FileCheck2 className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">Contador</span>}
              </div>
              {!isCollapsed && pendingReimbursementAmount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => setPjTab('reports')}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2 rounded-lg text-xs font-medium transition-all ${
                pjTab === 'reports'
                  ? 'bg-slate-950 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Relatórios PJ"
            >
              <LineChart className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Relatórios</span>}
            </button>
          </>
        )}
      </div>

      {/* Sidebar Action Button */}
      <div className="p-3 border-t border-slate-100 bg-white">
        {!isPJ ? (
          <button
            onClick={onOpenTransactionModal}
            className={`w-full flex items-center justify-center space-x-2 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all text-xs shadow-xs ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title="Novo Lançamento PF"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Novo Lançamento</span>}
          </button>
        ) : (
          <button
            onClick={onOpenBillingModal}
            className={`w-full flex items-center justify-center space-x-2 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all text-xs shadow-xs ${
              isCollapsed ? 'px-0' : 'px-4'
            }`}
            title="Emitir Fatura PJ"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Emitir Fatura</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
