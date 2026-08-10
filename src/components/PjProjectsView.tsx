import { useState } from 'react';
import { Project, Customer } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Briefcase, DollarSign, Calendar, TrendingUp, Award, ArrowUpRight, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  projects?: Project[];
  customers?: Customer[];
  isPrivacyMode?: boolean;
  onAddProject?: () => void;
}

export function PjProjectsView({
  projects = [],
  customers = [],
  isPrivacyMode = false,
  onAddProject,
}: Props) {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Normalização de dados para aceitar tanto a interface inicial quanto dados customizados
  const initialProjects = [
    { id: 'p1', name: 'Desenvolvimento Plataforma SaaS', client: 'TechCorp Brasil', revenueContracted: 45000, revenueReceived: 36500, directCosts: 12500, deadline: '2026-09-30', status: 'em_andamento' },
    { id: 'p2', name: 'Consultoria Arquitetura Cloud', client: 'Grupo Varejo Sul', revenueContracted: 28000, revenueReceived: 16000, directCosts: 6800, deadline: '2026-10-15', status: 'em_andamento' },
    { id: 'p3', name: 'Licenciamento & Integração API', client: 'Startup Innovate', revenueContracted: 14500, revenueReceived: 14500, directCosts: 3200, deadline: '2026-08-20', status: 'concluido' },
  ];

  const sourceList = projects.length > 0 ? projects : initialProjects;

  const normalizedProjects = sourceList.map(p => {
    const contracted = (p as any).revenueContracted ?? (p.revenue || 0);
    const received = (p as any).revenueReceived ?? Math.round(contracted * 0.8);
    const costs = (p as any).directCosts ?? (p.cost || 0);
    const profit = contracted - costs;
    const marginPct = contracted > 0 ? Math.round((profit / contracted) * 100) : 0;

    return {
      ...p,
      contracted,
      received,
      costs,
      profit,
      marginPct,
    };
  });

  const totalContracted = normalizedProjects.reduce((acc, p) => acc + p.contracted, 0);
  const totalReceived = normalizedProjects.reduce((acc, p) => acc + p.received, 0);
  const totalCosts = normalizedProjects.reduce((acc, p) => acc + p.costs, 0);
  const totalProfit = totalContracted - totalCosts;
  const avgMarginPct = totalContracted > 0 ? Math.round((totalProfit / totalContracted) * 100) : 0;

  // Ranking de projetos mais rentáveis
  const topProjects = [...normalizedProjects].sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Rentabilidade por Contrato
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Projetos & Contratos
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Acompanhe receita contratada, custos, lucro gerencial e margem de cada trabalho.
          </p>
        </div>

        <button
          onClick={onAddProject ? onAddProject : () => alert('Formulário de novo projeto')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Projeto / Contrato</span>
        </button>
      </div>

      {/* Top 5 KPIs Projetos */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Projetos Ativos" value={normalizedProjects.length} isPrivacyMode={isPrivacyMode} subtitle="Contratos em carteira" />
        <MetricCard title="Receita Contratada" value={totalContracted} isPrivacyMode={isPrivacyMode} subtitle="Valor comercial total" trend="up" trendValue="+14%" />
        <MetricCard title="Receita Recebida" value={totalReceived} isPrivacyMode={isPrivacyMode} subtitle="Entrada em caixa" />
        <MetricCard title="Lucro Estimado" value={totalProfit} isPrivacyMode={isPrivacyMode} subtitle="Receita - Custos Diretos" trend="up" trendValue="+18%" />
        <MetricCard title="Margem Média" value={avgMarginPct} isPrivacyMode={isPrivacyMode} prefix="" subtitle={`Operacional: ${avgMarginPct}%`} />
      </div>

      {/* Grid de Cards de Projetos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {normalizedProjects.map(p => (
          <div key={p.id} className="p-5 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-white/10">
                  {p.client}
                </span>
                <h3 className="font-bold text-base text-white mt-1.5">{p.name}</h3>
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                p.status === 'concluido' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                {p.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-slate-300 font-sans">
                <span>Receita Contratada:</span>
                <span className="font-mono font-bold text-white">R$ {p.contracted.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] font-sans">
                <span>Recebido no Caixa:</span>
                <span className="font-bold text-emerald-400">R$ {p.received.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] font-sans">
                <span>Custos Diretos Alocados:</span>
                <span className="font-bold text-rose-400">R$ {p.costs.toLocaleString('pt-BR')}</span>
              </div>
              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs font-sans">
                <span className="font-semibold text-slate-300">Lucro Gerencial ({p.marginPct}%):</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">R$ {p.profit.toLocaleString('pt-BR')}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, p.marginPct)}%` }} />
              </div>
            </div>

            <button
              onClick={() => setSelectedProject(p)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center space-x-1"
            >
              <span>Ver Detalhes do Contrato</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Tabela Completa de Projetos */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-sm text-white">Visão Consolidada de Rentabilidade por Contrato</h3>
          <span className="text-xs text-slate-400 font-semibold">Single Source of Truth Ativo</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Projeto</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4 text-right">Contratado</th>
                <th className="py-3 px-4 text-right">Recebido</th>
                <th className="py-3 px-4 text-right">Custos Diretos</th>
                <th className="py-3 px-4 text-right">Lucro</th>
                <th className="py-3 px-4 text-right">Margem %</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {normalizedProjects.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-white">{p.name}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">{p.client}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">R$ {p.contracted.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-right text-emerald-400">R$ {p.received.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-right text-rose-400">R$ {p.costs.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-cyan-300">R$ {p.profit.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{p.marginPct}%</td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                      p.status === 'concluido' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {p.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer / Modal de Detalhes do Projeto */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 text-white">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Detalhamento de Projeto</span>
                <h3 className="font-bold text-lg">{selectedProject.name}</h3>
                <p className="text-xs text-slate-400">Cliente: {selectedProject.client}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-slate-400 font-sans block text-[10px]">Receita Contratada</span>
                <span className="font-bold text-white text-sm">R$ {selectedProject.contracted.toLocaleString('pt-BR')}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-slate-400 font-sans block text-[10px]">Receita Recebida</span>
                <span className="font-bold text-emerald-400 text-sm">R$ {selectedProject.received.toLocaleString('pt-BR')}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-slate-400 font-sans block text-[10px]">Custos Diretos</span>
                <span className="font-bold text-rose-400 text-sm">R$ {selectedProject.costs.toLocaleString('pt-BR')}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-slate-400 font-sans block text-[10px]">Lucro Gerencial ({selectedProject.marginPct}%)</span>
                <span className="font-bold text-cyan-300 text-sm">R$ {selectedProject.profit.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl">Fechar Detalhes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
