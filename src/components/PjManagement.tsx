import { useState, type ReactNode } from 'react';
import { Project, Customer, Supplier, CostCenter } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Users, Truck } from 'lucide-react';

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

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PjManagement({
  customers = [],
  suppliers = [],
  isPrivacyMode = false,
  onAddCustomer,
  onAddSupplier,
}: Props) {
  const [tab, setTab] = useState<'customers' | 'suppliers'>('customers');
  const [selected, setSelected] = useState<Customer | null>(null);

  const billed = customers.reduce((sum, row) => sum + row.totalBilled, 0);
  const pending = customers.reduce((sum, row) => sum + row.totalPending, 0);
  const spent = suppliers.reduce((sum, row) => sum + row.totalSpent, 0);

  const showingCustomers = tab === 'customers';
  const addEntity = showingCustomers ? onAddCustomer : onAddSupplier;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Clientes &amp; Fornecedores</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">Gestão de parceiros comerciais, contas faturadas e histórico de pagamentos.</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-white/10">
          <button
            onClick={() => setTab('customers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              showingCustomers ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            Clientes ({customers.length})
          </button>
          <button
            onClick={() => setTab('suppliers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              !showingCustomers ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            Fornecedores ({suppliers.length})
          </button>
        </div>
      </div>

      {tab === 'customers' ? (
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <MetricCard title="Clientes Ativos" value={customers.length} prefix="" subtitle="Carteira cadastrada" />
            <MetricCard title="Total Faturado" value={billed} isPrivacyMode={isPrivacyMode} subtitle="Soma dos contratos" />
            <MetricCard title="Saldos a Receber" value={pending} isPrivacyMode={isPrivacyMode} subtitle="Em aberto" />
          </div>

          <DataTable
            empty={customers.length === 0}
            emptyMessage="Nenhum cliente cadastrado ainda. Adicione clientes para acompanhar contratos e recebíveis."
            headers={['Cliente', 'Documento', 'Contato', 'Faturado', 'Em aberto', 'Ações']}
          >
            {customers.map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-bold text-white">{row.name}</td>
                <td className="py-3 px-4 text-slate-300 font-mono">{row.documentCnpjCpf || '—'}</td>
                <td className="py-3 px-4 text-slate-300">{row.contactEmail || '—'}</td>
                <td className="py-3 px-4 text-right font-mono text-white">{money(row.totalBilled)}</td>
                <td className="py-3 px-4 text-right font-mono text-amber-400">{money(row.totalPending)}</td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => setSelected(row)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-cyan-300 text-[11px] font-bold transition-colors"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>

          {onAddCustomer && (
            <button
              onClick={onAddCustomer}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Novo cliente</span>
            </button>
          )}
        </section>
      ) : (
        <section className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <MetricCard title="Fornecedores Ativos" value={suppliers.length} prefix="" subtitle="Parceiros cadastrados" />
            <MetricCard title="Volume de Compras" value={spent} isPrivacyMode={isPrivacyMode} subtitle="Total pago a fornecedores" />
          </div>

          <DataTable
            empty={suppliers.length === 0}
            emptyMessage="Nenhum fornecedor cadastrado ainda. Registre seus fornecedores para controle de contas a pagar."
            headers={['Fornecedor', 'Categoria', 'CNPJ', 'E-mail', 'Total gasto']}
          >
            {suppliers.map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-bold text-white">{row.name}</td>
                <td className="py-3 px-4 text-slate-300">{row.category || '—'}</td>
                <td className="py-3 px-4 text-slate-300 font-mono">{row.documentCnpj || '—'}</td>
                <td className="py-3 px-4 text-slate-300">{row.contactEmail || '—'}</td>
                <td className="py-3 px-4 text-right font-mono text-white">{money(row.totalSpent)}</td>
              </tr>
            ))}
          </DataTable>

          {onAddSupplier && (
            <button
              onClick={onAddSupplier}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Novo fornecedor</span>
            </button>
          )}
        </section>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h2 className="font-bold text-white text-base">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xs font-bold">Fechar</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Total Faturado</span>
                <strong className="block text-white font-mono text-sm mt-0.5">{money(selected.totalBilled)}</strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Total Recebido</span>
                <strong className="block text-emerald-400 font-mono text-sm mt-0.5">{money(selected.totalReceived)}</strong>
              </div>
              <div className="col-span-2 p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Saldo Pendente</span>
                <strong className="block text-amber-400 font-mono text-sm mt-0.5">{money(selected.totalPending)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataTable({ headers, empty, emptyMessage, children }: { headers: string[]; empty: boolean; emptyMessage?: string; children: ReactNode }) {
  if (empty) {
    return (
      <div className="bg-slate-900/80 rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-300">
        <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-xs">{emptyMessage || 'Nenhum registro encontrado.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-300 uppercase text-[10px] tracking-wider border-b border-white/10">
              {headers.map((header) => (
                <th key={header} className="py-3 px-4">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
