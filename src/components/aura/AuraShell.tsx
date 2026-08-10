import React, { useState } from 'react';
import { ContextMode, ViewMode, PFTab, PJTab } from '../../types';
import { 
  User, 
  Building2, 
  Search, 
  Bell, 
  PanelLeft, 
  PanelRight, 
  Globe, 
  Eye, 
  EyeOff, 
  RotateCcw,
  LayoutDashboard,
  Receipt,
  PieChart,
  Landmark,
  FileText,
  LineChart,
  Activity,
  BarChart3,
  DollarSign,
  Briefcase,
  AlertCircle,
  FileCheck2,
  ArrowRightLeft,
  Plus,
  ShieldCheck,
  Wallet,
  CreditCard,
  RefreshCw,
  Target,
  ShieldAlert,
  TrendingUp,
  Users,
  Truck
} from 'lucide-react';

interface AuraShellProps {
  mode: ContextMode;
  setMode: (m: ContextMode) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  pfTab: PFTab;
  setPfTab: (t: PFTab) => void;
  pjTab: PJTab;
  setPjTab: (t: PJTab) => void;
  isPrivacyMode: boolean;
  setIsPrivacyMode: React.Dispatch<React.SetStateAction<boolean>>;
  pendingReimbursementAmount: number;
  defaultersCount: number;
  onOpenSearch: () => void;
  onResetDemo?: () => void;
  onOpenTransactionModal: () => void;
  onOpenBillingModal: () => void;
  children: React.ReactNode;
  rightRailContent?: React.ReactNode;
}

export function AuraShell({
  mode,
  setMode,
  viewMode,
  setViewMode,
  pfTab,
  setPfTab,
  pjTab,
  setPjTab,
  isPrivacyMode,
  setIsPrivacyMode,
  pendingReimbursementAmount,
  defaultersCount,
  onOpenSearch,
  onResetDemo,
  onOpenTransactionModal,
  onOpenBillingModal,
  children,
  rightRailContent,
}: AuraShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightRailOpen, setIsRightRailOpen] = useState(true);

  const isPJ = mode === 'PJ';

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${
      isPJ ? 'bg-[#020617] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      
      {/* 1. AuraSidebar (230px-250px retractable, logo "A" always visible) */}
      <aside
        className={`sticky top-0 h-screen flex flex-col transition-all duration-300 z-30 select-none border-r ${
          isPJ 
            ? 'bg-[#0F172A] border-white/5 text-slate-100' 
            : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
        } ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo Tile Header */}
        <div className={`p-4 flex items-center border-b ${
          isCollapsedHeader(isSidebarCollapsed)
        } ${isPJ ? 'border-white/5' : 'border-slate-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm ${
            isPJ ? 'bg-slate-800 text-white border border-white/10' : 'bg-slate-950 text-white'
          }`}>
            A
          </div>

          {!isSidebarCollapsed && (
            <div className="truncate animate-in fade-in duration-200">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight">AURAFIN</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                  isPJ ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80' : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                }`}>
                  {isPJ ? 'PJ' : 'PF'}
                </span>
              </div>
              <p className={`text-[11px] font-medium truncate ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
                {isPJ ? 'Execução & Performance' : 'Tranquilidade & Futuro'}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Nav items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-none">
          {!isPJ ? (
            // MODO PF NAVIGATION
            <>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1.5 mt-2">
                  Pessoa Física
                </p>
              )}

              <button
                onClick={() => setPfTab('overview')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'overview'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Dashboard PF</span>}
              </button>

              <button
                onClick={() => setPfTab('transactions')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'transactions'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Receipt className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Movimentações</span>}
              </button>

              <button
                onClick={() => setPfTab('accounts')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'accounts'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Wallet className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Contas & Carteiras</span>}
              </button>

              <button
                onClick={() => setPfTab('cards')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'cards'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Cartões de Crédito</span>}
              </button>

              <button
                onClick={() => setPfTab('recurrences')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'recurrences'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Recorrências</span>}
              </button>

              <button
                onClick={() => setPfTab('planning')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'planning'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <PieChart className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Orçamento</span>}
              </button>

              <button
                onClick={() => setPfTab('goals')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'goals'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Target className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Metas</span>}
              </button>

              <button
                onClick={() => setPfTab('reserve')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'reserve'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Reserva de Emergência</span>}
              </button>

              <button
                onClick={() => setPfTab('debts')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'debts'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Dívidas & Financiamentos</span>}
              </button>

              <button
                onClick={() => setPfTab('wealth')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'wealth'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Landmark className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Patrimônio</span>}
              </button>

              <button
                onClick={() => setPfTab('investments')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'investments'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Investimentos</span>}
              </button>

              <button
                onClick={() => setPfTab('tax_planning')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'tax_planning'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Inteligência IRPF</span>}
              </button>

              <button
                onClick={() => setPfTab('reports')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pfTab === 'reports'
                    ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <LineChart className="w-4 h-4 text-indigo-600" />
                {!isSidebarCollapsed && <span>Relatórios PF</span>}
              </button>
            </>
          ) : (
            // MODO PJ NAVIGATION
            <>
              {!isSidebarCollapsed && (
                <p className="px-3 text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1.5 mt-2">
                  Pessoa Jurídica
                </p>
              )}

              <button
                onClick={() => setPjTab('overview')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pjTab === 'overview'
                    ? 'bg-[#1E293B] text-cyan-400 border border-cyan-500/20 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                {!isSidebarCollapsed && <span>Dashboard PJ</span>}
              </button>

              <button
                onClick={() => setPjTab('cashflow')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pjTab === 'cashflow'
                    ? 'bg-[#1E293B] text-cyan-400 border border-cyan-500/20 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                {!isSidebarCollapsed && <span>Caixa Operacional</span>}
              </button>

              <button
                onClick={() => setPjTab('receivables_payables')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pjTab === 'receivables_payables'
                    ? 'bg-[#1E293B] text-cyan-400 border border-cyan-500/20 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <DollarSign className="w-4 h-4 text-cyan-400" />
                {!isSidebarCollapsed && <span>Receber & Pagar</span>}
              </button>

              <button
                onClick={() => setPjTab('billing')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pjTab === 'billing'
                    ? 'bg-[#1E293B] text-cyan-400 border border-cyan-500/20 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Receipt className="w-4 h-4 text-cyan-400" />
                {!isSidebarCollapsed && <span>Faturamento</span>}
              </button>

              <button
                onClick={() => setPjTab('management')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pjTab === 'management'
                    ? 'bg-[#1E293B] text-cyan-400 border border-cyan-500/20 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4 text-cyan-400" />
                {!isSidebarCollapsed && <span>Clientes & Fornecedores</span>}
              </button>

              <button
                onClick={() => setPjTab('cards')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pjTab === 'cards'
                    ? 'bg-[#1E293B] text-cyan-400 border border-cyan-500/20 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CreditCard className="w-4 h-4 text-cyan-400" />
                {!isSidebarCollapsed && <span>Cartões da Empresa</span>}
              </button>

              <button
                onClick={() => setPjTab('collections')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pjTab === 'collections'
                    ? 'bg-[#1E293B] text-cyan-400 border border-cyan-500/20 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  {!isSidebarCollapsed && <span>Cobranças</span>}
                </div>
                {!isSidebarCollapsed && defaultersCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {defaultersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setPjTab('accounting')}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pjTab === 'accounting'
                    ? 'bg-[#1E293B] text-cyan-400 border border-cyan-500/20 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                  <FileCheck2 className="w-4 h-4 text-cyan-400" />
                  {!isSidebarCollapsed && <span>Contador</span>}
                </div>
                {!isSidebarCollapsed && pendingReimbursementAmount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Sidebar Footer Action */}
        <div className={`p-4 border-t space-y-3 ${
          isPJ ? 'border-white/5 bg-[#0F172A]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          {!isPJ ? (
            <button
              onClick={onOpenTransactionModal}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Novo Lançamento</span>}
            </button>
          ) : (
            <button
              onClick={onOpenBillingModal}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Emitir Fatura Pix</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. AuraTopbar */}
        <header className={`h-16 border-b sticky top-0 z-20 backdrop-blur-md transition-colors duration-200 ${
          isPJ ? 'bg-[#0F172A]/90 text-slate-100 border-white/5' : 'bg-white/90 text-slate-900 border-slate-200/80'
        }`}>
          <div className="h-full px-6 flex items-center justify-between gap-4">
            
            {/* Greeting & Sidebar Toggle */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarCollapsed(prev => !prev)}
                className={`p-2 rounded-xl border transition-all ${
                  isPJ 
                    ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white' 
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <PanelLeft className="w-4 h-4" />
              </button>

              <div>
                <h2 className="font-extrabold text-sm tracking-tight">Olá, Thiago!</h2>
                <p className={`text-[11px] font-medium ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isPJ ? 'Painel Executivo da Empresa' : 'Resumo da Vida Financeira'}
                </p>
              </div>
            </div>

            {/* Central Switcher */}
            <div className={`flex items-center p-1 rounded-xl border ${
              isPJ ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200/80'
            }`}>
              <button
                onClick={() => setMode('PF')}
                className={`flex items-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isPJ ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                <span>Pessoa Física</span>
              </button>

              <button
                onClick={() => setMode('PJ')}
                className={`flex items-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isPJ ? 'bg-[#172033] text-white shadow-xs border border-white/10' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                <span>Pessoa Jurídica</span>

                {pendingReimbursementAmount > 0 && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
            </div>

            {/* Right Tools */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenSearch}
                className={`hidden md:flex items-center space-x-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                  isPJ ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
                <kbd className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isPJ ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500 border border-slate-200'
                }`}>⌘K</kbd>
              </button>

              <button
                onClick={() => setIsPrivacyMode(prev => !prev)}
                className={`p-2 rounded-xl border transition-colors ${
                  isPrivacyMode
                    ? isPJ ? 'bg-amber-950/60 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                    : isPJ ? 'bg-slate-800 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Modo Privacidade"
              >
                {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              {/* Botão de Painel Lateral desabilitado no PF para garantir barra única */}
              {isPJ && (
                <button
                  onClick={() => setIsRightRailOpen(prev => !prev)}
                  className={`p-2 rounded-xl border transition-all ${
                    isRightRailOpen
                      ? 'bg-slate-800 text-white border-white/10'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Painel Lateral"
                >
                  <PanelRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </header>

        {/* 3. AuraMainContent (Fluid 12-column grid max-width 1440px) */}
        <main className="flex-1 p-6 md:p-8 max-w-[1440px] w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

      {/* 4. AuraRightRail (Apenas em PJ quando ativo) */}
      {isPJ && isRightRailOpen && (
        <aside className="w-80 h-screen sticky top-0 flex flex-col border-l border-white/5 z-10 transition-all duration-300 overflow-y-auto scrollbar-none p-6 space-y-6 bg-[#0F172A] text-white">
          {rightRailContent}
        </aside>
      )}

    </div>
  );
}

function isCollapsedHeader(collapsed: boolean) {
  return collapsed ? 'justify-center' : 'justify-start space-x-3';
}
