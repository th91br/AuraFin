import { useState, type ReactNode } from 'react';
import { Customer, Supplier, CostCenter } from '../types';
import { BusinessPayable, BusinessReceivable } from '../services/repositories/supabase/SupabaseBusinessDataRepository';
import { MetricCard } from './aura/AuraCards';

interface Props {
  customers?: Customer[];
  suppliers?: Supplier[];
  costCenters?: CostCenter[];
  receivables?: BusinessReceivable[];
  payables?: BusinessPayable[];
  isPrivacyMode?: boolean;
}

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PjReceivablesPayables({
  receivables = [],
  payables = [],
  isPrivacyMode = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>('receivables');

  const pendingReceivables = receivables.reduce((sum, row) => sum + Math.max(0, row.amount - row.receivedAmount), 0);
  const receivedReceivables = receivables.reduce((sum, row) => sum + row.receivedAmount, 0);
  const overdueReceivables = receivables
    .filter((row) => ['overdue', 'vencido'].includes(row.status))
    .reduce((sum, row) => sum + Math.max(0, row.amount - row.receivedAmount), 0);

  const pendingPayables = payables.reduce((sum, row) => sum + Math.max(0, row.amount - row.paidAmount), 0);
  const paidPayables = payables.reduce((sum, row) => sum + row.paidAmount, 0);
  const paidByPf = payables
    .filter((row) => row.isPaidByPF)
    .reduce((sum, row) => sum + Math.max(0, row.amount - row.paidAmount), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Contas a Receber &amp; Pagar</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">Previsão financeira de títulos, faturamento e compromissos operacionais.</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-white/10">
          <button
            onClick={() => setActiveTab('receivables')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'receivables' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            A Receber ({receivables.length})
          </button>
          <button
            onClick={() => setActiveTab('payables')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'payables' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            A Pagar ({payables.length})
          </button>
        </div>
      </div>

      {activeTab === 'receivables' ? (
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <MetricCard title="Total a Receber" value={pendingReceivables} isPrivacyMode={isPrivacyMode} subtitle="Saldo pendente" />
            <MetricCard title="Total Liquidado" value={receivedReceivables} isPrivacyMode={isPrivacyMode} subtitle="Entradas confirmadas" />
            <MetricCard title="Vencidos" value={overdueReceivables} isPrivacyMode={isPrivacyMode} subtitle="Em atraso" />
          </div>

          <DataTable
            empty={receivables.length === 0}
            emptyMessage="Nenhuma conta a receber registrada. Crie faturas ou adicione lançamentos para gerenciar recebíveis."
            headers={['Descrição', 'Cliente', 'Vencimento', 'Valor Total', 'Saldo Aberto', 'Status']}
          >
            {receivables.map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-bold text-white">{row.description}</td>
                <td className="py-3 px-4 text-slate-300">{row.client || '—'}</td>
                <td className="py-3 px-4 text-slate-300">{row.dueDate}</td>
                <td className="py-3 px-4 font-mono text-white">{money(row.amount)}</td>
                <td className="py-3 px-4 font-mono text-amber-400">{money(Math.max(0, row.amount - row.receivedAmount))}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard title="Total a Pagar" value={pendingPayables} isPrivacyMode={isPrivacyMode} subtitle="Compromissos pendentes" />
            <MetricCard title="Total Pago" value={paidPayables} isPrivacyMode={isPrivacyMode} subtitle="Saídas liquidadas" />
            <MetricCard title="Pago via Sócio (PF)" value={paidByPf} isPrivacyMode={isPrivacyMode} subtitle="Reembolso elegível" />
          </div>

          <DataTable
            empty={payables.length === 0}
            emptyMessage="Nenhuma conta a pagar cadastrada. Adicione despesas com vencimento para prever o fluxo de saídas."
            headers={['Descrição', 'Fornecedor', 'Vencimento', 'Valor', 'Pago via PF', 'Status']}
          >
            {payables.map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-bold text-white">{row.description}</td>
                <td className="py-3 px-4 text-slate-300">{row.supplier || '—'}</td>
                <td className="py-3 px-4 text-slate-300">{row.dueDate}</td>
                <td className="py-3 px-4 font-mono text-white">{money(row.amount)}</td>
                <td className="py-3 px-4">
                  {row.isPaidByPF ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/30 text-[11px]">
                      Sim (PF)
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Não</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      )}
    </div>
  );
}

function DataTable({
  headers,
  empty,
  emptyMessage,
  children,
}: {
  headers: string[];
  empty: boolean;
  emptyMessage?: string;
  children: ReactNode;
}) {
  if (empty) {
    return (
      <div className="bg-slate-900/80 rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-300">
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
                <th key={header} className="py-3 px-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
