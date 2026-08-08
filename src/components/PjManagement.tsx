import { useState } from 'react';
import { Project, Customer, Supplier, CostCenter } from '../types';
import { Briefcase, Building2, Users, Layers, Plus, Clock } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  projects: Project[];
  customers: Customer[];
  suppliers: Supplier[];
  costCenters: CostCenter[];
  isPrivacyMode: boolean;
  onAddProject: () => void;
}

export function PjManagement({
  projects,
  customers,
  suppliers,
  costCenters,
  isPrivacyMode,
  onAddProject,
}: Props) {
  const [subTab, setSubTab] = useState<'projetos' | 'clientes' | 'fornecedores' | 'centros'>('projetos');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Gestão Corporativa
          </h1>
          <p className="text-slate-400 mt-1 text-base">
            Rentabilidade de projetos, perfil 360° de clientes, fornecedores e centros de custo.
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

      {/* Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('projetos')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'projetos' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-850'
          }`}
        >
          <Briefcase className="w-4 h-4 text-sky-400" />
          <span>Projetos & Rentabilidade ({projects.length})</span>
        </button>

        <button
          onClick={() => setSubTab('clientes')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'clientes' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-850'
          }`}
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>Clientes 360° ({customers.length})</span>
        </button>

        <button
          onClick={() => setSubTab('fornecedores')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'fornecedores' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-850'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>Fornecedores ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setSubTab('centros')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'centros' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-850'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Centros de Custo ({costCenters.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: PROJETOS & RENTABILIDADE */}
      {subTab === 'projetos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono tabular-nums">
          {projects.map((proj) => {
            const profit = proj.revenue - proj.cost;
            const margin = proj.revenue > 0 ? Math.round((profit / proj.revenue) * 100) : 0;

            return (
              <div key={proj.id} className="bg-slate-900 p-7 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-sky-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded border font-sans ${
                      proj.status === 'concluido' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-amber-950/60 text-amber-300 border-amber-800'
                    }`}>
                      {proj.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight font-sans">{proj.name}</h3>
                  <p className="text-sm font-semibold text-slate-400 mt-0.5 font-sans">{proj.client}</p>
                  {proj.deadline && <p className="text-xs text-slate-500 mt-2 flex items-center font-sans"><Clock className="w-3.5 h-3.5 mr-1" /> {proj.deadline}</p>}
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="font-sans">Faturamento:</span>
                    <span className="font-bold text-white">R$ {proj.revenue.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="font-sans">Custos Diretos:</span>
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
      )}

      {/* SUB-TAB 2: CLIENTES 360 */}
      {subTab === 'clientes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customers.map(c => (
            <div key={c.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">{c.name}</h3>
                  <p className="text-xs text-slate-400">CNPJ: {c.documentCnpjCpf}</p>
                </div>
                <span className="text-xs font-bold text-slate-400">{c.contactEmail}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 font-mono tabular-nums text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans uppercase">Total Faturado</span>
                  <p className="font-bold text-white mt-1">R$ {c.totalBilled.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans uppercase">Recebido</span>
                  <p className="font-bold text-emerald-400 mt-1">R$ {c.totalReceived.toLocaleString('pt-BR')}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans uppercase">Pendente</span>
                  <p className="font-bold text-amber-400 mt-1">R$ {c.totalPending.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: FORNECEDORES */}
      {subTab === 'fornecedores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map(s => (
            <div key={s.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-lg">{s.name}</h3>
              <p className="text-xs text-slate-400">Categoria: {s.category}</p>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-mono">
                <span className="text-slate-400">Total Pago:</span>
                <span className="font-bold text-rose-400">- R$ {s.totalSpent.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 4: CENTROS DE CUSTO */}
      {subTab === 'centros' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono tabular-nums">
          {costCenters.map(cc => (
            <div key={cc.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-base font-sans">{cc.name}</h3>
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span className="font-sans">Orçamento:</span>
                  <span className="font-bold text-white">R$ {cc.budgetAllocated.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Executado:</span>
                  <span className="font-bold text-rose-400">R$ {cc.totalSpent.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
