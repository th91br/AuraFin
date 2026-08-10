import { useState } from 'react';
import { Project, Customer, Supplier, CostCenter } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Users, Truck, Briefcase, Filter, Search, Phone, Mail, Building, ArrowUpRight, DollarSign } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  projects?: Project[];
  customers?: Customer[];
  suppliers?: Supplier[];
  costCenters?: CostCenter[];
  isPrivacyMode?: boolean;
  onAddProject?: () => void;
  onAddCustomer?: () => void;
  onAddSupplier?: () => void;
}

export function PjManagement({
  projects = [],
  customers = [],
  suppliers = [],
  costCenters = [],
  isPrivacyMode = false,
  onAddProject,
  onAddCustomer,
  onAddSupplier,
}: Props) {
  const [subTab, setSubTab] = useState<'customers' | 'suppliers'>('customers');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const mockCustomers = customers.length > 0 ? customers : [
    { id: 'cli1', name: 'TechCorp Brasil', documentCnpjCpf: '12.345.678/0001-90', contactEmail: 'financeiro@techcorp.com.br', phone: '(11) 98765-4321', totalBilled: 45000, totalReceived: 36500, totalPending: 8500 },
    { id: 'cli2', name: 'Grupo Varejo Sul', documentCnpjCpf: '98.765.432/0001-10', contactEmail: 'contato@varejosul.com', phone: '(41) 99887-6655', totalBilled: 28000, totalReceived: 16000, totalPending: 12000 },
    { id: 'cli3', name: 'Startup Innovate', documentCnpjCpf: '45.123.789/0001-55', contactEmail: 'hello@innovate.io', phone: '(31) 97766-5544', totalBilled: 14500, totalReceived: 14500, totalPending: 0 },
  ];

  const mockSuppliers = suppliers.length > 0 ? suppliers : [
    { id: 'sup1', name: 'AWS Amazon Web Services', category: 'Infraestrutura Cloud', documentCnpj: '00.000.000/0001-00', contactEmail: 'aws-billing@amazon.com', totalSpent: 38400 },
    { id: 'sup2', name: 'Google Workspace', category: 'SaaS & E-mail', documentCnpj: '11.111.111/0001-11', contactEmail: 'workspace-support@google.com', totalSpent: 10200 },
    { id: 'sup3', name: 'Escritório de Contabilidade', category: 'Serviços Profissionais', documentCnpj: '22.222.222/0001-22', contactEmail: 'contabilidade@contabil.com.br', totalSpent: 17400 },
  ];

  const totalPortfolioBilled = mockCustomers.reduce((acc, c) => acc + c.totalBilled, 0);
  const totalPortfolioPending = mockCustomers.reduce((acc, c) => acc + c.totalPending, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Carteira & Relacionamento Comercial
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Clientes & Fornecedores
          </h1>
        </div>

        {/* SubTab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10">
          <button
            onClick={() => setSubTab('customers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'customers' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Clientes (Visão 360°)
          </button>
          <button
            onClick={() => setSubTab('suppliers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'suppliers' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Fornecedores (Custos)
          </button>
        </div>
      </div>

      {/* SUBTAB: CLIENTES */}
      {subTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Clientes Ativos" value={mockCustomers.length} isPrivacyMode={isPrivacyMode} subtitle="Carteira comercial" />
            <MetricCard title="Faturamento da Carteira" value={totalPortfolioBilled} isPrivacyMode={isPrivacyMode} subtitle="Acumulado histórico" trend="up" trendValue="+12%" />
            <MetricCard title="Total em Aberto" value={totalPortfolioPending} isPrivacyMode={isPrivacyMode} subtitle="Valores a receber" />
            <MetricCard title="Total Vencido Inadimplente" value={12000} isPrivacyMode={isPrivacyMode} subtitle="Atraso > 7 dias" trend="down" trendValue="-2%" />
          </div>

          <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">Carteira de Clientes</h3>
              <button
                onClick={onAddCustomer ? onAddCustomer : () => alert('Formulário de novo cliente')}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
              >
                + Novo Cliente
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Cliente / Razão Social</th>
                    <th className="py-3 px-4">Documento</th>
                    <th className="py-3 px-4">Contato</th>
                    <th className="py-3 px-4 text-right">Total Faturado</th>
                    <th className="py-3 px-4 text-right">Em Aberto</th>
                    <th className="py-3 px-4 text-center">Perfil 360°</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {mockCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-bold text-white">{c.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{c.documentCnpjCpf}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-400">
                        <div>{c.contactEmail}</div>
                        <div className="text-[10px] text-slate-500">{c.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">R$ {c.totalBilled.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-400">R$ {c.totalPending.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <button
                          onClick={() => setSelectedClient(c)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[11px] rounded-lg border border-white/10"
                        >
                          Ver Perfil 360°
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: FORNECEDORES */}
      {subTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Fornecedores Ativos" value={mockSuppliers.length} isPrivacyMode={isPrivacyMode} subtitle="Parceiros operacionais" />
            <MetricCard title="Gasto no Período" value={66000} isPrivacyMode={isPrivacyMode} subtitle="Custo total acumulado" />
            <MetricCard title="Total a Pagar" value={5500} isPrivacyMode={isPrivacyMode} subtitle="Compromissos pendentes" />
            <MetricCard title="Contratos Recorrentes" value={3} isPrivacyMode={isPrivacyMode} subtitle="AWS, Google, Contador" />
          </div>

          <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">Lista de Fornecedores</h3>
              <button
                onClick={onAddSupplier ? onAddSupplier : () => alert('Formulário de novo fornecedor')}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
              >
                + Novo Fornecedor
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Fornecedor</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">CNPJ</th>
                    <th className="py-3 px-4">E-mail</th>
                    <th className="py-3 px-4 text-right">Total Gasto Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {mockSuppliers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-bold text-white">{s.name}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-400">{s.category}</td>
                      <td className="py-3.5 px-4 text-slate-400">{s.documentCnpj}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-400">{s.contactEmail}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">R$ {s.totalSpent.toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Perfil 360° do Cliente */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 text-white">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Perfil Financeiro 360°</span>
                <h3 className="font-bold text-lg">{selectedClient.name}</h3>
                <p className="text-xs text-slate-400">{selectedClient.documentCnpjCpf}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-slate-400 font-sans block text-[10px]">Total Faturado</span>
                <span className="font-bold text-white text-sm">R$ {selectedClient.totalBilled.toLocaleString('pt-BR')}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-slate-400 font-sans block text-[10px]">Total Recebido</span>
                <span className="font-bold text-emerald-400 text-sm">R$ {selectedClient.totalReceived.toLocaleString('pt-BR')}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl col-span-2">
                <span className="text-slate-400 font-sans block text-[10px]">Pendente em Aberto</span>
                <span className="font-bold text-amber-400 text-sm">R$ {selectedClient.totalPending.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedClient(null)} className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl">Fechar Perfil</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
