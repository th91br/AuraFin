import { useState } from 'react';
import { Transaction, TransactionAnalytics } from '../types';
import { MetricCard } from './aura/AuraCards';
import { HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  isPrivacyMode?: boolean;
  analytics?: TransactionAnalytics;
}

export function PjDreView({ transactions = [], isPrivacyMode = false, analytics }: Props) {
  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const [expandedSection, setExpandedSection] = useState<string | null>('despesas');

  const categoryCents = (category: string) => Number(analytics?.by_category.find(item => item.category === category)?.expenses_cents || 0);
  const hasData = Boolean(analytics && analytics.transaction_count > 0);
  const grossRevenue = Number(analytics?.total_receipts_cents || 0) / 100;
  const taxesDirect = Number(analytics?.tax_cents || 0) / 100;
  const netRevenue = grossRevenue - taxesDirect;
  const directCosts = categoryCents('custo_direto') / 100;
  const grossMargin = netRevenue - directCosts;
  const opExpenses = Math.max(0, Number(analytics?.operating_expenses_cents || 0) / 100 - directCosts);
  const prolabore = Number(analytics?.prolabore_cents || 0) / 100;
  const netOpResult = grossMargin - opExpenses - prolabore;
  const opMarginPct = Math.round((netOpResult / (grossRevenue || 1)) * 100);

  if (!hasData) {
    return (
      <div className="space-y-8 text-slate-100">
        <div className="border-b border-white/10 pb-4">
          <h1 className="text-2xl font-black text-white">DRE Gerencial</h1>
          <p className="text-xs text-slate-300 mt-1">Demonstração do Resultado do Exercício da organização.</p>
        </div>
        <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10 text-slate-300">
          Nenhuma movimentação registrada no período selecionado.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <span>DRE Gerencial</span>
            <div className="group relative cursor-pointer">
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-slate-900 border border-white/10 text-[11px] text-slate-300 rounded-xl shadow-xl z-50 font-normal">
                Visão estruturada das receitas, custos e despesas da empresa. Mostra o resultado econômico real e margens operacionais.
              </div>
            </div>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
            Demonstrativo de faturamento, margens brutas, custos operacionais e resultado líquido.
          </p>
        </div>

        {/* Filter Period */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-white/10">
          <button onClick={() => setPeriod('mes')} className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${period === 'mes' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'}`}>Mês Atual</button>
          <button onClick={() => setPeriod('trimestre')} className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${period === 'trimestre' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'}`}>Trimestre</button>
          <button onClick={() => setPeriod('ano')} className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${period === 'ano' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'}`}>Ano 2026</button>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard title="Receita Bruta Total" value={grossRevenue} isPrivacyMode={isPrivacyMode} isPJ subtitle="Total faturado no período" />
        <MetricCard title="Margem Bruta" value={grossMargin} isPrivacyMode={isPrivacyMode} isPJ subtitle="Receita Líquida - Custos Diretos" />
        <MetricCard title="Resultado Operacional" value={netOpResult} isPrivacyMode={isPrivacyMode} isPJ subtitle="Lucro antes de IRPJ/CSLL" />
        <MetricCard title="Margem Operacional" value={opMarginPct} prefix="" isPrivacyMode={isPrivacyMode} isPJ subtitle="Eficiência do negócio" />
      </div>

      {/* Estrutura da DRE (Statement) */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/10 space-y-4 shadow-xs">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <h3 className="font-bold text-sm text-white">Demonstrativo Estruturado de Resultado</h3>
          <span className="text-xs text-slate-300 font-semibold font-mono">Regime de Competência</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {/* Receita Bruta */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 flex justify-between items-center font-bold text-white">
            <span className="font-sans flex items-center space-x-2">
              <span className="text-emerald-400 font-mono">(+)</span>
              <span>1. Receita Bruta das Vendas / Serviços</span>
            </span>
            <span className="text-emerald-400 font-mono font-bold">R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Impostos */}
          <div className="p-3 rounded-xl bg-slate-950/40 flex justify-between items-center text-slate-300">
            <span className="font-sans flex items-center space-x-2 pl-4">
              <span className="text-rose-400 font-mono">(-)</span>
              <span>Impostos Diretos (Simples Nacional / DAS)</span>
            </span>
            <span className="text-rose-400 font-mono">- R$ {taxesDirect.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Receita Líquida */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 flex justify-between items-center font-bold text-cyan-300">
            <span className="font-sans flex items-center space-x-2">
              <span className="font-mono">(=)</span>
              <span>2. Receita Líquida</span>
            </span>
            <span className="font-mono">R$ {netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Custos Diretos */}
          <div className="p-3 rounded-xl bg-slate-950/40 flex justify-between items-center text-slate-300">
            <span className="font-sans flex items-center space-x-2 pl-4">
              <span className="text-rose-400 font-mono">(-)</span>
              <span>Custos Operacionais Diretos</span>
            </span>
            <span className="text-rose-400 font-mono">- R$ {directCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Margem Bruta */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 flex justify-between items-center font-bold text-white">
            <span className="font-sans flex items-center space-x-2">
              <span className="font-mono">(=)</span>
              <span>3. Margem Bruta Gerencial</span>
            </span>
            <span className="font-mono">R$ {grossMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Despesas Operacionais (Expansível) */}
          <div className="space-y-1">
            <div
              onClick={() => setExpandedSection(prev => prev === 'despesas' ? null : 'despesas')}
              className="p-3 rounded-xl bg-slate-950/40 flex justify-between items-center text-slate-300 cursor-pointer hover:bg-slate-800/60 transition-colors"
            >
              <span className="font-sans flex items-center space-x-2 pl-4">
                {expandedSection === 'despesas' ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <span className="text-rose-400 font-mono">(-)</span>
                <span>Despesas Operacionais Fixas</span>
              </span>
              <span className="text-rose-400 font-mono">- R$ {opExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            {expandedSection === 'despesas' && (
              <div className="pl-10 pr-4 py-2 space-y-1.5 text-[11px] text-slate-300 border-l border-white/10 ml-6">
                <div className="flex justify-between"><span>Categorias ativas</span><span className="font-bold text-white font-mono">{analytics?.by_category.filter(item => item.expenses_cents > 0).length || 0} categoria(s)</span></div>
              </div>
            )}
          </div>

          {/* Pró-labore */}
          <div className="p-3 rounded-xl bg-slate-950/40 flex justify-between items-center text-slate-300">
            <span className="font-sans flex items-center space-x-2 pl-4">
              <span className="text-rose-400 font-mono">(-)</span>
              <span>Pró-labore dos Sócios</span>
            </span>
            <span className="text-rose-400 font-mono">- R$ {prolabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Resultado Operacional Líquido */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 flex justify-between items-center font-bold text-white text-sm">
            <span className="font-sans flex items-center space-x-2">
              <span className="text-cyan-400 font-mono">(=)</span>
              <span>4. RESULTADO OPERACIONAL LÍQUIDO</span>
            </span>
            <span className="text-emerald-400 font-mono text-base font-black">R$ {netOpResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
