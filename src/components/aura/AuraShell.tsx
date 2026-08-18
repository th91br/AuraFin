import React, { useState } from 'react';
import { ContextMode, ViewMode, PFTab, PJTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { UserAccountMenu } from './UserAccountMenu';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { 
  User, 
  Building2, 
  Search, 
  PanelLeft, 
  Eye, 
  EyeOff, 
  LayoutDashboard,
  Receipt,
  PieChart,
  FileText,
  LineChart,
  Activity,
  BarChart3,
  Briefcase,
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
  Scale,
  Clock,
  Layers,
  Percent,
  AlertTriangle,
  UserCheck,
  FolderOpen,
  CheckSquare,
  X,
  Menu
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
  onOpenAuthModal?: () => void;
  onOpenSecuritySettings?: () => void;
  children: React.ReactNode;
  rightRailContent?: React.ReactNode;
}

export function AuraShell({
  mode,
  setMode,
  pfTab,
  setPfTab,
  pjTab,
  setPjTab,
  isPrivacyMode,
  setIsPrivacyMode,
  pendingReimbursementAmount,
  onOpenSearch,
  onOpenTransactionModal,
  onOpenBillingModal,
  onOpenSecuritySettings,
  children,
}: AuraShellProps) {
  const { user, profile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);

  const isPJ = mode === 'PJ';
  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Gestor';

  const handlePfTabSelect = (tab: PFTab) => {
    setPfTab(tab);
    setIsMobileDrawerOpen(false);
  };

  const handlePjTabSelect = (tab: PJTab) => {
    setPjTab(tab);
    setIsMobileDrawerOpen(false);
  };

  const renderNavList = (collapsed: boolean, isDrawer = false) => {
    if (!isPJ) {
      return (
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mb-1.5 mt-2">
              Pessoa Física
            </p>
          )}

          <NavItem icon={<LayoutDashboard className="w-4 h-4 text-indigo-600 shrink-0" />} label="Dashboard PF" active={pfTab === 'overview'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('overview')} />
          <NavItem icon={<Receipt className="w-4 h-4 text-indigo-600 shrink-0" />} label="Movimentações" active={pfTab === 'transactions'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('transactions')} />
          <NavItem icon={<Wallet className="w-4 h-4 text-indigo-600 shrink-0" />} label="Contas & Carteiras" active={pfTab === 'accounts'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('accounts')} />
          <NavItem icon={<CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />} label="Cartões de Crédito" active={pfTab === 'cards'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('cards')} />
          <NavItem icon={<RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />} label="Recorrências" active={pfTab === 'recurrences'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('recurrences')} />
          <NavItem icon={<PieChart className="w-4 h-4 text-indigo-600 shrink-0" />} label="Orçamento" active={pfTab === 'planning'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('planning')} />
          <NavItem icon={<Target className="w-4 h-4 text-indigo-600 shrink-0" />} label="Metas" active={pfTab === 'goals'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('goals')} />
          <NavItem icon={<ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />} label="Reserva de Emergência" active={pfTab === 'reserve'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('reserve')} />
          <NavItem icon={<ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />} label="Dívidas & Financiamentos" active={pfTab === 'debts'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('debts')} />
          <NavItem icon={<TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />} label="Patrimônio Líquido" active={pfTab === 'wealth'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('wealth')} />
          <NavItem icon={<BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />} label="Investimentos" active={pfTab === 'investments'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('investments')} />
          <NavItem icon={<FileText className="w-4 h-4 text-indigo-600 shrink-0" />} label="Planejamento IRPF" active={pfTab === 'tax_planning'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('tax_planning')} />
          <NavItem icon={<LineChart className="w-4 h-4 text-indigo-600 shrink-0" />} label="Relatórios PF" active={pfTab === 'reports'} collapsed={collapsed} isPJ={false} onClick={() => handlePfTabSelect('reports')} />

          <div className="pt-2">
            <NavItem 
              icon={<ArrowRightLeft className="w-4 h-4 text-amber-600 shrink-0" />} 
              label="Conciliações PF ↔ PJ" 
              active={pfTab === 'conciliations'} 
              collapsed={collapsed} 
              isPJ={false} 
              badge={pendingReimbursementAmount > 0 ? 'Reembolso' : undefined}
              onClick={() => handlePfTabSelect('conciliations')} 
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {!collapsed && (
          <p className="px-3 text-[10px] uppercase tracking-widest font-extrabold text-cyan-400 mb-1.5 mt-2">
            Pessoa Jurídica
          </p>
        )}

        <NavItem icon={<LayoutDashboard className="w-4 h-4 text-cyan-400 shrink-0" />} label="Dashboard PJ" active={pjTab === 'overview'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('overview')} />
        <NavItem icon={<Activity className="w-4 h-4 text-cyan-400 shrink-0" />} label="Fluxo de Caixa" active={pjTab === 'cashflow'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('cashflow')} />
        <NavItem icon={<Scale className="w-4 h-4 text-cyan-400 shrink-0" />} label="Contas a Receber / Pagar" active={pjTab === 'receivables_payables'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('receivables_payables')} />
        <NavItem icon={<Receipt className="w-4 h-4 text-cyan-400 shrink-0" />} label="Faturamento Empresarial" active={pjTab === 'billing'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('billing')} />
        <NavItem icon={<BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />} label="DRE Gerencial" active={pjTab === 'dre'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('dre')} />
        <NavItem icon={<PieChart className="w-4 h-4 text-cyan-400 shrink-0" />} label="Ponto de Equilíbrio" active={pjTab === 'breakeven'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('breakeven')} />
        <NavItem icon={<Clock className="w-4 h-4 text-cyan-400 shrink-0" />} label="Runway de Caixa" active={pjTab === 'runway'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('runway')} />
        <NavItem icon={<Users className="w-4 h-4 text-cyan-400 shrink-0" />} label="Clientes & Fornecedores" active={pjTab === 'management'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('management')} />
        <NavItem icon={<CreditCard className="w-4 h-4 text-cyan-400 shrink-0" />} label="Cartões PJ" active={pjTab === 'cards'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('cards')} />
        <NavItem icon={<Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />} label="Projetos & Contratos" active={pjTab === 'projects'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('projects')} />
        <NavItem icon={<Layers className="w-4 h-4 text-cyan-400 shrink-0" />} label="Centros de Custo" active={pjTab === 'cost_centers'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('cost_centers')} />
        <NavItem icon={<AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />} label="Inadimplência" active={pjTab === 'delinquency'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('delinquency')} />
        <NavItem icon={<UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />} label="Pró-labore & Sócios" active={pjTab === 'accounting'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('accounting')} />
        <NavItem icon={<ArrowRightLeft className="w-4 h-4 text-cyan-400 shrink-0" />} label="Conciliações PF ↔ PJ" active={pjTab === 'conciliations'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('conciliations')} />
        <NavItem icon={<CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />} label="Central do Contador" active={pjTab === 'accountant'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('accountant')} />
        <NavItem icon={<FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" />} label="Documentos" active={pjTab === 'documents'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('documents')} />
        <NavItem icon={<Percent className="w-4 h-4 text-cyan-400 shrink-0" />} label="Impostos (Controle)" active={pjTab === 'taxes'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('taxes')} />
        <NavItem icon={<LineChart className="w-4 h-4 text-cyan-400 shrink-0" />} label="Relatórios PJ" active={pjTab === 'reports'} collapsed={collapsed} isPJ onClick={() => handlePjTabSelect('reports')} />
      </div>
    );
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${
      isPJ ? 'bg-[#020617] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      
      {/* 1. Desktop Aside (≥ lg) */}
      <aside
        className={`hidden lg:flex sticky top-0 h-screen flex-col transition-all duration-300 z-30 select-none border-r ${
          isPJ 
            ? 'bg-[#0F172A] border-white/5 text-slate-100' 
            : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
        } ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo Header */}
        <div className={`p-4 flex items-center border-b ${
          isSidebarCollapsed ? 'justify-center' : 'justify-start space-x-3'
        } ${isPJ ? 'border-white/5' : 'border-slate-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-xs ${
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

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 overflow-y-auto scrollbar-none">
          {renderNavList(isSidebarCollapsed)}
        </div>

        {/* Sidebar Footer CTA */}
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

      {/* 2. Mobile Slide-Over Drawer (< lg) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          <div className={`relative z-10 w-72 max-w-[85vw] h-full flex flex-col shadow-2xl border-r animate-in slide-in-from-left duration-200 ${
            isPJ ? 'bg-[#0F172A] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Drawer Header */}
            <div className={`p-4 flex items-center justify-between border-b ${isPJ ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex items-center space-x-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shadow-xs ${
                  isPJ ? 'bg-slate-800 text-white border border-white/10' : 'bg-slate-950 text-white'
                }`}>
                  A
                </div>
                <div>
                  <span className="font-extrabold text-sm tracking-tight block">AURAFIN</span>
                  <span className={`text-[9px] font-bold uppercase ${isPJ ? 'text-cyan-400' : 'text-indigo-600'}`}>
                    {isPJ ? 'Modo Pessoa Jurídica' : 'Modo Pessoa Física'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`p-2 rounded-xl border transition-colors ${
                  isPJ ? 'border-white/10 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Nav */}
            <div className="flex-1 py-4 px-3 overflow-y-auto">
              {renderNavList(false, true)}
            </div>

            {/* Drawer Footer CTA */}
            <div className={`p-4 border-t ${isPJ ? 'border-white/10 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
              {!isPJ ? (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenTransactionModal();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Lançamento</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenBillingModal();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Emitir Fatura Pix</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Body */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className={`h-16 border-b sticky top-0 z-20 backdrop-blur-md transition-colors duration-200 ${
          isPJ ? 'bg-[#0F172A]/90 text-slate-100 border-white/5' : 'bg-white/90 text-slate-900 border-slate-200/80'
        }`}>
          <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Greeting & Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setIsMobileDrawerOpen(true);
                  } else {
                    setIsSidebarCollapsed((prev) => !prev);
                  }
                }}
                className={`p-2 rounded-xl border transition-all shrink-0 ${
                  isPJ 
                    ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white' 
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Abrir menu de navegação"
              >
                <PanelLeft className="w-4 h-4 hidden lg:block" />
                <Menu className="w-4 h-4 lg:hidden" />
              </button>

              <div className="min-w-0">
                <h2 className="font-extrabold text-xs sm:text-sm tracking-tight truncate">Olá, {firstName}!</h2>
                <p className={`text-[10px] sm:text-[11px] font-medium truncate hidden sm:block ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isPJ ? 'Painel Executivo da Empresa' : 'Resumo da Vida Financeira'}
                </p>
              </div>
            </div>

            {/* Central Switcher (PF vs PJ) */}
            <div className={`flex items-center p-0.5 sm:p-1 rounded-xl border shrink-0 ${
              isPJ ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200/80'
            }`}>
              <button
                onClick={() => setMode('PF')}
                className={`flex items-center px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isPJ ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 sm:mr-1.5 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline">Pessoa Física</span>
                <span className="sm:hidden ml-1">PF</span>
              </button>

              <button
                onClick={() => setMode('PJ')}
                className={`flex items-center px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isPJ ? 'bg-[#172033] text-white shadow-xs border border-white/10' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 sm:mr-1.5 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">Pessoa Jurídica</span>
                <span className="sm:hidden ml-1">PJ</span>

                {pendingReimbursementAmount > 0 && (
                  <span className="ml-1.5 sm:ml-2 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                )}
              </button>
            </div>

            {/* Right Tools & User Account */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <button
                onClick={onOpenSearch}
                className={`flex items-center space-x-2 text-xs font-semibold p-2 sm:px-3 sm:py-2 rounded-xl border transition-colors ${
                  isPJ ? 'bg-slate-800 border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Buscar movimentações"
                aria-label="Buscar"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Buscar</span>
                <kbd className={`hidden md:inline text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isPJ ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500 border border-slate-200'
                }`}>⌘K</kbd>
              </button>

              <button
                onClick={() => setIsPrivacyMode((prev) => !prev)}
                className={`p-2 rounded-xl border transition-colors ${
                  isPrivacyMode
                    ? isPJ ? 'bg-amber-950/60 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                    : isPJ ? 'bg-slate-800 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Modo Privacidade"
                aria-label="Alternar modo privacidade"
              >
                {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <UserAccountMenu
                isPJ={isPJ}
                onOpenSecuritySettings={() => {
                  if (onOpenSecuritySettings) onOpenSecuritySettings();
                }}
                onOpenCreateOrg={() => setIsCreateOrgModalOpen(true)}
              />
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-[1440px] w-full mx-auto space-y-6 sm:space-y-8">
          {children}
        </main>
      </div>

      {/* Modal for Creating New Organization */}
      <CreateOrganizationModal
        isOpen={isCreateOrgModalOpen}
        onClose={() => setIsCreateOrgModalOpen(false)}
      />

    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  collapsed,
  isPJ,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  isPJ: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${
        collapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'
      } py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[40px] ${
        active
          ? isPJ
            ? 'bg-[#1E293B] text-cyan-300 font-bold border border-cyan-500/20 shadow-xs'
            : 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs'
          : isPJ
          ? 'text-white/70 hover:text-white hover:bg-slate-800/60'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
      }`}
    >
      {icon}
      {!collapsed && (
        <span className="truncate flex-1 text-left flex items-center justify-between">
          <span>{label}</span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {badge}
            </span>
          )}
        </span>
      )}
    </button>
  );
}
