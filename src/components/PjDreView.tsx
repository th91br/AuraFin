import { useState } from 'react';
import { Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { HelpCircle, ChevronDown, ChevronRight, TrendingUp, DollarSign, Calendar, Filter, FileText } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  isPrivacyMode?: boolean;
}

export function PjDreView({ transactions = [], isPrivacyMode = false }: Props) {
  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const [expandedSection, setExpandedSection] = useState<string | null>('despesas');

  const pjTxs = transactions.filter(t => t.context === 'PJ');

  const grossRevenue = 37000;
  const taxesDirect = 1110;
  const netRevenue = grossRevenue - taxesDirect;
  const directCosts = 4500;
  const grossMargin = netRevenue - directCosts;
  const opExpenses = 4560;
  const prolabore = 8500;
  const netOpResult = grossMargin - opExpenses - prolabore;
  const opMarginPct = Math.round((netOpResult / (grossRevenue || 1)) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Demonstração do Resultado do Exercício
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1 flex items-center space-x-2">
            <span>DRE Gerencial</span>
            <div className="group relative cursor-pointer">
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 border border-white/10 text-[11px] text-slate-300 rounded-xl shadow-xl z-50 font-normal">
                DRE é uma visão organizada das receitas, custos e despesas da empresa em determinado período. Diferente do Caixa, que mostra entradas e saídas bancárias, a DRE mostra o resultado econômico real da operação.
              </div>
            </div>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Entenda quanto sua empresa faturou, gastou e efetivamente gerou de resultado.
          </p>
        </div>

        {/* Filter Period */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-white/10">
          <button onClick={() => setPeriod('mes')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${period === 'mes' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Mês Atual</button>
          <button onClick={() => setPeriod('trimestre')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${period === 'trimestre' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Trimestre</button>
          <button onClick={() => setPeriod('ano')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${period === 'ano' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Ano 2026</button>
        </div>
      </div>

      {/* Top 4 DRE KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Receita Bruta" value={grossRevenue} isPrivacyMode={isPrivacyMode} subtitle="Faturamento total emitido" trend="up" trendValue="+18.4%" />
        <MetricCard title="Receita Líquida" value={netRevenue} isPrivacyMode={isPrivacyMode} subtitle="Após impostos diretos" />
        <MetricCard title="Resultado Operacional" value={netOpResult} isPrivacyMode={isPrivacyMode} subtitle="Lucro líquido gerencial" trend="up" trendValue="+12%" />
        <MetricCard title="Margem Operacional" value={opMarginPct} isPrivacyMode={isPrivacyMode} prefix="" subtitle={`Operacional: ${opMarginPct}%`} />
      </div>

      {/* Estrutura da DRE (Statement) */}
      <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xs">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <h3 className="font-bold text-sm text-white">Demonstrativo Estruturado de Resultado</h3>
          <span className="text-xs text-slate-400 font-semibold font-mono">Regime Simplificado por Caixa/Competência</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {/* Receita Bruta */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex justify-between items-center font-bold text-white">
            <span className="font-sans flex items-center space-x-2">
              <span className="text-emerald-400">(+)</span>
              <span>1. Receita Bruta das Vendas / Serviços</span>
            </span>
            <span className="text-emerald-400">R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Impostos */}
          <div className="p-3 rounded-xl bg-slate-900/40 flex justify-between items-center text-slate-300">
            <span className="font-sans flex items-center space-x-2 pl-4">
              <span className="text-rose-400">(-)</span>
              <span>Impostos Diretos (Simples Nacional / DAS)</span>
            </span>
            <span className="text-rose-400">- R$ {taxesDirect.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Receita Líquida */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex justify-between items-center font-bold text-cyan-300">
            <span className="font-sans flex items-center space-x-2">
              <span>(=)</span>
              <span>2. Receita Líquida</span>
            </span>
            <span>R$ {netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Custos Diretos */}
          <div className="p-3 rounded-xl bg-slate-900/40 flex justify-between items-center text-slate-300">
            <span className="font-sans flex items-center space-x-2 pl-4">
              <span className="text-rose-400">(-)</span>
              <span>Custos Operacionais Diretos</span>
            </span>
            <span className="text-rose-400">- R$ {directCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Margem Bruta */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex justify-between items-center font-bold text-white">
            <span className="font-sans flex items-center space-x-2">
              <span>(=)</span>
              <span>3. Margem Bruta Gerencial (84.8%)</span>
            </span>
            <span>R$ {grossMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Despesas Operacionais (Expansível) */}
          <div className="space-y-1">
            <div
              onClick={() => setExpandedSection(prev => prev === 'despesas' ? null : 'despesas')}
              className="p-3 rounded-xl bg-slate-900/40 flex justify-between items-center text-slate-300 cursor-pointer hover:bg-slate-800/60"
            >
              <span className="font-sans flex items-center space-x-2 pl-4">
                {expandedSection === 'despesas' ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                <span className="text-rose-400">(-)</span>
                <span>Despesas Operacionais Fixas</span>
              </span>
              <span className="text-rose-400">- R$ {opExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            {expandedSection === 'despesas' && (
              <div className="pl-10 pr-4 py-2 space-y-1.5 text-[11px] text-slate-400 border-l border-white/10 ml-6">
                <div className="flex justify-between"><span>Softwares & Ferramentas SaaS:</span><span className="font-bold text-slate-200">R$ 850,00</span></div>
                <div className="flex justify-between"><span>Marketing & Infraestrutura:</span><span className="font-bold text-slate-200">R$ 2.260,00</span></div>
                <div className="flex justify-between"><span>Contabilidade & Serviços Profissionais:</span><span className="font-bold text-slate-200">R$ 1.450,00</span></div>
              </div>
            )}
          </div>

          {/* Pró-labore */}
          <div className="p-3 rounded-xl bg-slate-900/40 flex justify-between items-center text-slate-300">
            <span className="font-sans flex items-center space-x-2 pl-4">
              <span className="text-rose-400">(-)</span>
              <span>Pró-labore dos Sócios</span>
            </span>
            <span className="text-rose-400">- R$ {prolabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Resultado Operacional Líquido */}
          <div className="p-4 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex justify-between items-center font-bold text-white text-sm">
            <span className="font-sans flex items-center space-x-2">
              <span className="text-cyan-400">(=)</span>
              <span>4. RESULTADO OPERACIONAL LÍQUIDO (LAIR)</span>
            </span>
            <span className="text-emerald-400 font-mono text-base">R$ {netOpResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
