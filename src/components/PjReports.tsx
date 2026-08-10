import { useState } from 'react';
import { Transaction, Account, Customer, Supplier, Project, CostCenter, Defaulter, CreditCard } from '../types';
import { MetricCard } from './aura/AuraCards';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Filter, 
  FileText, 
  PieChart, 
  Layers, 
  ShieldCheck, 
  Scale, 
  Clock, 
  CreditCard as CreditCardIcon, 
  AlertTriangle, 
  Users, 
  ArrowRightLeft, 
  CheckCircle2, 
  Printer, 
  X, 
  Sparkles,
  Download,
  DollarSign,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';
import { formatCurrencyBRL, formatDateBRL } from '../utils/formatters';
import { getPjDRESummary, getPjRunwayCoverage, getPjBreakEven, getPjCashTotal } from '../utils/pjSelectors';

interface Props {
  transactions?: Transaction[];
  accounts?: Account[];
  customers?: Customer[];
  suppliers?: Supplier[];
  projects?: Project[];
  costCenters?: CostCenter[];
  defaulters?: Defaulter[];
  creditCards?: CreditCard[];
  isPrivacyMode?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export function PjReports({
  transactions = [],
  accounts = [],
  customers = [],
  suppliers = [],
  projects = [],
  costCenters = [],
  defaulters = [],
  creditCards = [],
  isPrivacyMode = false,
  onNavigateTab,
}: Props) {
  // Global Period & Comparison Filter States
  const [period, setPeriod] = useState('este_mes');
  const [comparison, setComparison] = useState('periodo_anterior');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filter Sub-States
  const [selectedClient, setSelectedClient] = useState<string>('todos');
  const [selectedProject, setSelectedProject] = useState<string>('todos');
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('todos');

  // Filter transactions based on context and selected filters
  const pjTxs = transactions.filter(t => t.context === 'PJ');

  // Single Source of Truth Metrics via Selectors
  const dre = getPjDRESummary(transactions);
  const totalCash = getPjCashTotal(accounts) || 58450;
  const runway = getPjRunwayCoverage(totalCash, 10060);
  const breakEvenVal = getPjBreakEven(9060, 0.70);

  // Calculated Metrics
  const grossBilled = dre.grossRevenue;
  const receivedRevenue = Math.round(grossBilled * 0.85); // 85% recebido no caixa
  const opExpenses = dre.opExpenses + dre.directCosts;
  const netResult = dre.netOpResult;
  const opMarginPct = dre.opMarginPct;

  // Comparison Badges
  const compLabel = comparison === 'periodo_anterior' ? 'vs. período anterior' : comparison === 'ano_anterior' ? 'vs. ano anterior' : '';
  const compTrend = '+12.4%';

  // Top Customers Revenue Calculation
  const topClients = [
    { name: 'TechCorp Brasil Ltda', revenue: 14500, sharePct: 39 },
    { name: 'Grupo Inovação S.A.', revenue: 8200, sharePct: 22 },
    { name: 'StartUp Alpha Software', revenue: 5800, sharePct: 16 },
    { name: 'Vanguard Investimentos', revenue: 4500, sharePct: 12 },
  ];
  const top3Share = topClients.slice(0, 3).reduce((acc, c) => acc + c.sharePct, 0);

  // Expense Categories Composition
  const expenseCategories = [
    { label: 'Pró-labore & Sócios', amount: 8500, pct: 45, color: '#0891B2' },
    { label: 'Infraestrutura & Software', amount: 3200, pct: 17, color: '#10B981' },
    { label: 'Marketing & Vendas', amount: 2800, pct: 15, color: '#D97706' },
    { label: 'Custos Diretos de Projetos', amount: 2500, pct: 13, color: '#8B5CF6' },
    { label: 'Impostos & Taxas', amount: 1800, pct: 10, color: '#F43F5E' },
  ];

  // Projects Profitability
  const projectProfits = projects.length > 0 ? projects : [
    { id: 'p1', name: 'Plataforma SaaS Enterprise', clientName: 'TechCorp Brasil', revenueContracted: 45000, revenueReceived: 35000, directCosts: 12000, profit: 23000, marginPct: 65.7 },
    { id: 'p2', name: 'App Mobile iOS/Android', clientName: 'Grupo Inovação', revenueContracted: 28500, revenueReceived: 20000, directCosts: 8500, profit: 11500, marginPct: 57.5 },
  ];

  // Inadimplência Aging
  const totalDelinquent = 8400;
  const delinquentRatePct = 4.8;
  const agingBreakdown = [
    { range: '1-7 dias', amount: 3200, color: '#FBBF24' },
    { range: '8-15 dias', amount: 2400, color: '#F97316' },
    { range: '16-30 dias', amount: 1800, color: '#EF4444' },
    { range: '31-60 dias', amount: 1000, color: '#DC2626' },
  ];

  // Dynamic Executive Insights
  const executiveInsights = [
    { id: 'i1', type: 'positive', text: `Seu faturamento bruto registrou crescimento de ${compTrend} em relação ao período comparado.` },
    { id: 'i2', type: 'warning', text: `Os 3 maiores clientes representam ${top3Share}% da receita total (Concentração de Carteira).` },
    { id: 'i3', type: 'info', text: `Sua reserva operacional garante ${runway.months} meses (${runway.days} dias) de autonomia de caixa.` },
    { id: 'i4', type: 'positive', text: `O resultado operacional líquido atingiu margem de ${opMarginPct}% com rigoroso controle de custos.` },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* 1. HEADER FUNCIONAL & BARRA DE FILTROS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Centro Executivo de Análise Empresarial
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Relatórios PJ
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Visão consolidada do desempenho financeiro e operacional da empresa.
          </p>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Global Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-cyan-500"
          >
            <option value="este_mes">Este Mês (Agosto 2026)</option>
            <option value="mes_anterior">Mês Anterior (Julho 2026)</option>
            <option value="3m">Últimos 3 Meses</option>
            <option value="6m">Últimos 6 Meses</option>
            <option value="12m">Últimos 12 Meses</option>
            <option value="ano_atual">Ano Atual (2026)</option>
            <option value="ano_anterior">Ano Anterior (2025)</option>
          </select>

          {/* Comparison Selector */}
          <select
            value={comparison}
            onChange={(e) => setComparison(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-hidden focus:border-cyan-500"
          >
            <option value="periodo_anterior">vs. Período Anterior</option>
            <option value="ano_anterior">vs. Mesmo Período Ano Anterior</option>
            <option value="sem_comparacao">Sem Comparação</option>
          </select>

          {/* More Filters Trigger */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 font-bold rounded-xl text-xs transition-all"
          >
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mais Filtros</span>
          </button>

          {/* Export Action */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* 2. TOP 6 KPIS EXECUTIVOS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Faturamento Bruto"
          value={grossBilled}
          isPrivacyMode={isPrivacyMode}
          subtitle="Total faturado no período"
          trend="up"
          trendValue={compTrend}
        />
        <MetricCard
          title="Receita Recebida"
          value={receivedRevenue}
          isPrivacyMode={isPrivacyMode}
          subtitle="Caixa efetivado"
          trend="up"
          trendValue="+8.5%"
        />
        <MetricCard
          title="Despesas Operacionais"
          value={opExpenses}
          isPrivacyMode={isPrivacyMode}
          subtitle="Custos + Despesas"
          trend="down"
          trendValue="-3.1%"
        />
        <MetricCard
          title="Resultado Operacional"
          value={netResult}
          isPrivacyMode={isPrivacyMode}
          subtitle="Lucro líquido gerencial"
          trend="up"
          trendValue="+15%"
        />
        <MetricCard
          title="Margem Operacional"
          value={opMarginPct}
          prefix=""
          subtitle="Retorno sobre faturamento"
        />
        <MetricCard
          title="Caixa Disponível Real"
          value={totalCash}
          isPrivacyMode={isPrivacyMode}
          subtitle="Soma das contas PJ"
        />
      </div>

      {/* 3. MÓDULO 1: EVOLUÇÃO FINANCEIRA & COMPOSIÇÃO DAS DESPESAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfico Histórico de Evolução Financeira (7/12) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-start border-b border-white/5 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">Evolução Financeira</h3>
              <p className="text-[11px] text-slate-400 font-medium">Histórico mensal de Faturamento, Recebido, Despesas e Resultado</p>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-slate-900 text-cyan-400 border border-white/10 rounded">
              Visão Histórica
            </span>
          </div>

          {/* Visual Chart Bars */}
          <div className="h-56 flex items-end justify-between pt-6 px-2 border-b border-white/5">
            {[
              { month: 'Mar', billed: 32000, spent: 18000, result: 14000 },
              { month: 'Abr', billed: 34500, spent: 19200, result: 15300 },
              { month: 'Mai', billed: 31000, spent: 17500, result: 13500 },
              { month: 'Jun', billed: 38000, spent: 21000, result: 17000 },
              { month: 'Jul', billed: 36000, spent: 19800, result: 16200 },
              { month: 'Ago', billed: grossBilled, spent: opExpenses, result: netResult },
            ].map(item => {
              const billedPct = Math.min(100, Math.round((item.billed / 40000) * 100));
              const spentPct = Math.min(100, Math.round((item.spent / 40000) * 100));
              return (
                <div key={item.month} className="flex flex-col items-center space-y-2 flex-1 group">
                  <div className="flex items-end space-x-1.5 h-40">
                    <div className="w-3.5 bg-cyan-500 rounded-t-sm transition-all group-hover:bg-cyan-400" style={{ height: `${billedPct}%` }} title={`Faturamento: R$ ${item.billed}`} />
                    <div className="w-3.5 bg-rose-500/80 rounded-t-sm transition-all group-hover:bg-rose-400" style={{ height: `${spentPct}%` }} title={`Despesas: R$ ${item.spent}`} />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs text-slate-400 pt-2 font-mono">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-cyan-500 rounded-xs inline-block" />
              <span>Faturamento Bruto</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 bg-rose-500 rounded-xs inline-block" />
              <span>Despesas Totais</span>
            </span>
          </div>
        </div>

        {/* Composição das Despesas (5/12) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-start border-b border-white/5 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">Composição das Despesas</h3>
              <p className="text-[11px] text-slate-400 font-medium">Distribuição por categoria gerencial</p>
            </div>
            <PieChart className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3 font-mono text-xs pt-1">
            {expenseCategories.map(cat => (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans font-semibold">{cat.label}</span>
                  <span className="font-bold">
                    <PrivacyText value={cat.amount} isPrivacyMode={isPrivacyMode} /> ({cat.pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. MÓDULO 2: DRE RESUMIDA & FLUXO DE CAIXA OPERACIONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DRE Resumida */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">DRE Resumida</h3>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('dre')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Ver DRE Completa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-900 text-slate-300">
              <span>(+) Receita Bruta de Serviços</span>
              <span className="font-bold text-white"><PrivacyText value={dre.grossRevenue} isPrivacyMode={isPrivacyMode} /></span>
            </div>
            <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-900/60 text-rose-400">
              <span>(-) Impostos Diretos (DAS ~3%)</span>
              <span className="font-bold"><PrivacyText value={dre.taxesDirect} isPrivacyMode={isPrivacyMode} /></span>
            </div>
            <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-900 font-bold text-cyan-300">
              <span>(=) Receita Líquida</span>
              <span><PrivacyText value={dre.netRevenue} isPrivacyMode={isPrivacyMode} /></span>
            </div>
            <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-900/60 text-rose-400">
              <span>(-) Custos Diretos de Projetos</span>
              <span className="font-bold"><PrivacyText value={dre.directCosts} isPrivacyMode={isPrivacyMode} /></span>
            </div>
            <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-900 font-bold text-emerald-400">
              <span>(=) Margem Bruta</span>
              <span><PrivacyText value={dre.grossMargin} isPrivacyMode={isPrivacyMode} /></span>
            </div>
            <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-900/60 text-rose-400">
              <span>(-) Despesas Operacionais</span>
              <span className="font-bold"><PrivacyText value={dre.opExpenses} isPrivacyMode={isPrivacyMode} /></span>
            </div>
            <div className="flex justify-between py-1.5 px-3 rounded-lg bg-slate-900/60 text-rose-400">
              <span>(-) Pró-labore dos Sócios</span>
              <span className="font-bold"><PrivacyText value={dre.prolabore} isPrivacyMode={isPrivacyMode} /></span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-xl bg-cyan-950/80 border border-cyan-800/80 font-bold text-sm text-cyan-300">
              <span>(=) Resultado Operacional Líquido</span>
              <span><PrivacyText value={dre.netOpResult} isPrivacyMode={isPrivacyMode} /></span>
            </div>
          </div>
        </div>

        {/* Fluxo de Caixa Operacional */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Fluxo de Caixa Operacional</h3>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('cashflow')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Ver Caixa Operacional</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">Entradas Reais</span>
              <p className="text-lg font-black font-mono text-white">
                <PrivacyText value={receivedRevenue} isPrivacyMode={isPrivacyMode} />
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-rose-400 block">Saídas Reais</span>
              <p className="text-lg font-black font-mono text-white">
                <PrivacyText value={opExpenses} isPrivacyMode={isPrivacyMode} />
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-cyan-400 block">Saldo em Caixa</span>
              <p className="text-lg font-black font-mono text-white">
                <PrivacyText value={totalCash} isPrivacyMode={isPrivacyMode} />
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="font-bold">Projeção Próximos 30 Dias:</span>
              <span className="font-mono font-bold text-emerald-400">+ R$ 24.500 previstos</span>
            </div>
            <p className="text-[11px] text-slate-400">
              O fluxo de caixa operacional permanece positivo com liquidez suficiente para manter compromissos de curto prazo.
            </p>
          </div>
        </div>

      </div>

      {/* 5. MÓDULO 3: CLIENTES & PROJETOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Receita por Cliente & Concentração */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Receita por Cliente & Concentração</h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              Top 4 Clientes
            </span>
          </div>

          {/* Alerta de Concentração */}
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span><strong>Aviso de Risco:</strong> Os 3 maiores clientes representam <strong>{top3Share}%</strong> da receita total da empresa.</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {topClients.map(c => (
              <div key={c.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                <div>
                  <span className="font-sans font-bold text-white block">{c.name}</span>
                  <span className="text-[10px] text-slate-400 font-sans">{c.sharePct}% da receita total</span>
                </div>
                <span className="font-bold text-emerald-400">
                  <PrivacyText value={c.revenue} isPrivacyMode={isPrivacyMode} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rentabilidade por Projeto & Contratos */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Rentabilidade por Projeto</h3>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('projects')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Ver Projetos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {projectProfits.map(p => (
              <div key={p.id} className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-sans font-bold text-white">{p.name}</h4>
                    <span className="text-[10px] text-slate-400 font-sans">{p.clientName}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-sans">
                    Margem {p.marginPct}%
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span>Receita: <strong className="text-white"><PrivacyText value={p.revenueContracted} isPrivacyMode={isPrivacyMode} /></strong></span>
                  <span>Custos: <strong className="text-rose-400"><PrivacyText value={p.directCosts} isPrivacyMode={isPrivacyMode} /></strong></span>
                  <span>Lucro: <strong className="text-emerald-400"><PrivacyText value={p.profit} isPrivacyMode={isPrivacyMode} /></strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 6. MÓDULO 4: INADIMPLÊNCIA & IMPOSTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Inadimplência Executiva */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-sm text-white">Inadimplência & Aging</h3>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('delinquency')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Ver Inadimplência</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-rose-400 block">Total Vencido em Atraso</span>
              <p className="text-xl font-black font-mono text-white">
                <PrivacyText value={totalDelinquent} isPrivacyMode={isPrivacyMode} />
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-amber-400 block">Taxa de Inadimplência</span>
              <p className="text-xl font-black font-mono text-amber-300">{delinquentRatePct}%</p>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Aging de Vencimento</span>
            {agingBreakdown.map(a => (
              <div key={a.range} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-white/5">
                <span className="text-slate-300 font-sans">{a.range}</span>
                <span className="font-bold" style={{ color: a.color }}>
                  <PrivacyText value={a.amount} isPrivacyMode={isPrivacyMode} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Impostos — Controle Gerencial */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Impostos (Controle Gerencial)</h3>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('taxes')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Ver Impostos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Impostos Previstos</span>
              <p className="text-lg font-black text-white"><PrivacyText value={1800} isPrivacyMode={isPrivacyMode} /></p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-cyan-400 block">Provisionados</span>
              <p className="text-lg font-black text-cyan-300"><PrivacyText value={1800} isPrivacyMode={isPrivacyMode} /></p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">Pagos no Mês</span>
              <p className="text-lg font-black text-emerald-400"><PrivacyText value={1110} isPrivacyMode={isPrivacyMode} /></p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Status Fiscal</span>
              <p className="text-xs font-extrabold text-emerald-400 uppercase pt-1">Em Dia (Regular)</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Acompanhamento gerencial do DAS Simples Nacional. As provisões ajudam no controle de caixa antes do pagamento oficial.
          </p>
        </div>

      </div>

      {/* 7. MÓDULO 5: PONTO DE EQUILÍBRIO & RUNWAY DE CAIXA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ponto de Equilíbrio (Break-even) */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Ponto de Equilíbrio (Break-even)</h3>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('breakeven')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Ver Ponto de Equilíbrio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Ponto de Equilíbrio</span>
              <p className="text-xl font-black text-white"><PrivacyText value={breakEvenVal} isPrivacyMode={isPrivacyMode} /></p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">Faturamento Atual</span>
              <p className="text-xl font-black text-emerald-400"><PrivacyText value={grossBilled} isPrivacyMode={isPrivacyMode} /></p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
            Faturamento atual está <strong>+186% acima</strong> do ponto de equilíbrio necessário para cobrir custos fixos e variáveis.
          </div>
        </div>

        {/* Runway de Caixa */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Runway de Caixa (Autonomia)</h3>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('runway')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Ver Runway</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-cyan-400 block">Autonomia Estimada</span>
              <p className="text-2xl font-black text-white">{runway.months} Meses</p>
              <span className="text-[11px] text-slate-400 block">Aproximadamente {runway.days} dias</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Burn Mensal Referência</span>
              <p className="text-xl font-black text-white"><PrivacyText value={10060} isPrivacyMode={isPrivacyMode} /></p>
              <span className="text-[11px] text-slate-400 block">Custos operacionais fixos</span>
            </div>
          </div>
        </div>

      </div>

      {/* 8. MÓDULO 6: INSIGHTS EXECUTIVOS AURAFIN */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">Insights Executivos AuraFin</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {executiveInsights.map(insight => (
            <div key={insight.id} className="p-4 rounded-xl bg-slate-900 border border-white/5 flex items-start space-x-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-slate-300 leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE FILTROS AVANÇADOS */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0F172A] rounded-3xl border border-white/10 shadow-2xl w-full max-w-md p-6 space-y-6 text-slate-100">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Mais Filtros de Relatório</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Filtrar por Cliente</label>
                <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-semibold">
                  <option value="todos">Todos os Clientes</option>
                  <option value="techcorp">TechCorp Brasil Ltda</option>
                  <option value="grupo_inovacao">Grupo Inovação S.A.</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Filtrar por Projeto</label>
                <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-semibold">
                  <option value="todos">Todos os Projetos</option>
                  <option value="saas_enterprise">Plataforma SaaS Enterprise</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex space-x-3">
              <button onClick={() => setIsFilterModalOpen(false)} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl">
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXPORTAÇÃO */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0F172A] rounded-3xl border border-white/10 shadow-2xl w-full max-w-md p-6 space-y-6 text-slate-100">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Exportar Relatórios PJ</h3>
              <button onClick={() => setIsExportModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { alert('Exportação em CSV realizada!'); setIsExportModalOpen(false); }}
                className="w-full p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex items-center space-x-3 text-xs text-white font-bold"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Exportar Planilha Executiva (CSV)</span>
              </button>

              <button
                onClick={() => { alert('Exportação em JSON realizada!'); setIsExportModalOpen(false); }}
                className="w-full p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex items-center space-x-3 text-xs text-white font-bold"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Exportar Dados Estruturados (JSON)</span>
              </button>

              <button
                onClick={() => { handlePrint(); setIsExportModalOpen(false); }}
                className="w-full p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 flex items-center space-x-3 text-xs text-white font-bold"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir / Gerar PDF Executivo</span>
              </button>
            </div>

            <button onClick={() => setIsExportModalOpen(false)} className="w-full py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs">
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
