import { useState } from 'react';
import { Project, Customer } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Briefcase } from 'lucide-react';

interface Props {
  projects?: Project[];
  customers?: Customer[];
  isPrivacyMode?: boolean;
  onAddProject?: () => void;
}

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PjProjectsView({
  projects = [],
  isPrivacyMode = false,
  onAddProject,
}: Props) {
  const [selected, setSelected] = useState<Project | null>(null);

  const contracted = projects.reduce((sum, row) => sum + (row.revenueContracted ?? row.revenue), 0);
  const received = projects.reduce((sum, row) => sum + (row.revenueReceived ?? 0), 0);
  const costs = projects.reduce((sum, row) => sum + (row.directCosts ?? row.cost), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Projetos &amp; Contratos</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">Acompanhamento de margens, faturamento contratado e entregas por cliente.</p>
        </div>
        {onAddProject && (
          <button
            onClick={onAddProject}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard title="Projetos Ativos" value={projects.length} prefix="" subtitle="Contratos gerenciados" />
        <MetricCard title="Total Contratado" value={contracted} isPrivacyMode={isPrivacyMode} subtitle="Receita prevista" />
        <MetricCard title="Total Recebido" value={received} isPrivacyMode={isPrivacyMode} subtitle="Faturamento liquidado" />
        <MetricCard title="Custos Diretos" value={costs} isPrivacyMode={isPrivacyMode} subtitle="Gastos vinculados" />
      </div>

      {projects.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10 text-slate-300">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Nenhum projeto cadastrado</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">Crie projetos para acompanhar a rentabilidade individual de cada contrato.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <th className="py-3 px-4">Projeto</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4 text-right">Contratado</th>
                  <th className="py-3 px-4 text-right">Recebido</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(row)}
                    className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-white">{row.name}</td>
                    <td className="py-3 px-4 text-slate-300">{row.client || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono text-white">{money(row.revenueContracted ?? row.revenue)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">{money(row.revenueReceived ?? 0)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                        {row.status || 'Ativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="p-6 bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h2 className="font-bold text-white text-base">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xs font-bold">Fechar</button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-slate-300">Cliente: <strong className="text-white">{selected.client || 'Não informado'}</strong></p>
              <p className="text-slate-300">Receita Total: <strong className="text-white font-mono">{money(selected.revenueContracted ?? selected.revenue)}</strong></p>
              <p className="text-slate-300">Custos Diretos: <strong className="text-rose-400 font-mono">{money(selected.directCosts ?? selected.cost)}</strong></p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
