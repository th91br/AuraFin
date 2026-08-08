import { Project } from '../types';
import { Briefcase, Plus, Clock } from 'lucide-react';

interface Props {
  projects: Project[];
  onAddProject: () => void;
}

export function PjProjects({ projects, onAddProject }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Margem & Lucratividade por Projeto
          </h1>
          <p className="text-slate-400 mt-1 text-base">
            Avalie o retorno financeiro real de cada cliente e contrato após os custos diretos.
          </p>
        </div>
        <button
          onClick={onAddProject}
          className="flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Projeto / Cliente</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const profit = proj.revenue - proj.cost;
          const margin = proj.revenue > 0 ? Math.round((profit / proj.revenue) * 100) : 0;

          return (
            <div key={proj.id} className="bg-slate-900 p-7 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-sky-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded border ${
                    proj.status === 'concluido'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800'
                  }`}>
                    {proj.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">{proj.name}</h3>
                <p className="text-sm font-semibold text-slate-400 mt-0.5">{proj.client}</p>
                {proj.deadline && <p className="text-xs text-slate-500 mt-2 flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {proj.deadline}</p>}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800 font-mono tabular-nums">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="font-sans">Faturamento do Contrato:</span>
                  <span className="font-bold text-white">R$ {proj.revenue.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="font-sans">Custos Diretos (Alocação):</span>
                  <span className="font-bold text-rose-400">- R$ {proj.cost.toLocaleString('pt-BR')}</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-sans">Margem de Lucro:</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {margin}% <span className="text-xs font-semibold text-slate-400">(R$ {profit.toLocaleString('pt-BR')})</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
