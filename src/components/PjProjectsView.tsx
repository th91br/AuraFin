import { useState } from 'react';
import { Project, Customer } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Briefcase, DollarSign, Calendar, TrendingUp, Award, ArrowUpRight } from 'lucide-react';
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

  const mockProjects = projects.length > 0 ? projects : [
    { id: 'p1', name: 'Desenvolvimento Plataforma SaaS', client: 'TechCorp Brasil', revenueContracted: 45000, revenueReceived: 36500, directCosts: 12500, deadline: '2026-09-30', status: 'em_andamento' },
    { id: 'p2', name: 'Consultoria Arquitetura Cloud', client: 'Grupo Varejo Sul', revenueContracted: 28000, revenueReceived: 16000, directCosts: 6800, deadline: '2026-10-15', status: 'em_andamento' },
    { id: 'p3', name: 'Licenciamento & Integração API', client: 'Startup Innovate', revenueContracted: 14500, revenueReceived: 14500, directCosts: 3200, deadline: '2026-08-20', status: 'concluido' },
  ];

  const totalContracted = mockProjects.reduce((acc, p) => acc + p.revenueContracted, 0);
  const totalReceived = mockProjects.reduce((acc, p) => acc + p.revenueReceived, 0);
  const totalCosts = mockProjects.reduce((acc, p) => acc + p.directCosts, 0);
  const totalProfit = totalContracted - totalCosts;
  const avgMarginPct = Math.round((totalProfit / (totalContracted || 1)) * 100);

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
        <MetricCard title="Projetos Ativos" value={mockProjects.length} isPrivacyMode={isPrivacyMode} subtitle="Contratos em carteira" />
        <MetricCard title="Receita Contratada" value={totalContracted} isPrivacyMode={isPrivacyMode} subtitle="Valor comercial total" trend="up" trendValue="+14%" />
        <MetricCard title="Receita Recebida" value={totalReceived} isPrivacyMode={isPrivacyMode} subtitle="Entrada em caixa" />
        <MetricCard title="Lucro Estimado" value={totalProfit} isPrivacyMode={isPrivacyMode} subtitle="Receita - Custos Diretos" trend="up" trendValue="+18%" />
        <MetricCard title="Margem Média" value={avgMarginPct} isPrivacyMode={isPrivacyMode} prefix="" subtitle={`Operacional: ${avgMarginPct}%`} />
      </div>

      {/* Tabela de Projetos & Rentabilidade */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-sm text-white">Projetos & Contratos Ativos</h3>
          <span className="text-xs text-slate-400 font-semibold">Rentabilidade Gerencial Calculada</span>
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
              {mockProjects.map(p => {
                const profit = p.revenueContracted - p.directCosts;
                const marginPct = Math.round((profit / (p.revenueContracted || 1)) * 100);

                return (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-white">{p.name}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-400">{p.client}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">R$ {p.revenueContracted.toLocaleString('pt-BR')}</td>
                    <td className="py-3.5 px-4 text-right text-emerald-400">R$ {p.revenueReceived.toLocaleString('pt-BR')}</td>
                    <td className="py-3.5 px-4 text-right text-rose-400">R$ {p.directCosts.toLocaleString('pt-BR')}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-cyan-300">R$ {profit.toLocaleString('pt-BR')}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{marginPct}%</td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                        p.status === 'concluido' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {p.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
