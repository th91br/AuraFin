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
  customers = [],
  suppliers = [],
  costCenters = [],
  receivables = [],
  payables = [],
  isPrivacyMode = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>('receivables');
  const [toast, setToast] = useState<string | null>(null);

  const pendingReceivables = receivables.reduce((sum, row) => sum + Math.max(0, row.amount - row.receivedAmount), 0);
  const receivedReceivables = receivables.reduce((sum, row) => sum + row.receivedAmount, 0);
  const overdueReceivables = receivables.filter(row => ['overdue', 'vencido'].includes(row.status))
    .reduce((sum, row) => sum + Math.max(0, row.amount - row.receivedAmount), 0);
  const pendingPayables = payables.reduce((sum, row) => sum + Math.max(0, row.amount - row.paidAmount), 0);
  const paidPayables = payables.reduce((sum, row) => sum + row.paidAmount, 0);
  const paidByPf = payables.filter(row => row.isPaidByPF).reduce((sum, row) => sum + Math.max(0, row.amount - row.paidAmount), 0);

  const notImplementedMutation = () => {
    setToast('Esta ação será concluída após o registro transacional no Supabase.');
    window.setTimeout(() => setToast(null), 3500);
  };

  const activeRows = activeTab === 'receivables' ? receivables : payables;
  if (activeRows.length === 0) return <div className="space-y-8 animate-in fade-in duration-200 text-slate-100"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4"><div><h1 className="text-2xl font-black tracking-tight text-white">Contas a Receber &amp; Pagar</h1><p className="text-xs text-slate-400 mt-1">Dados da organização ativa.</p></div><div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10"><button onClick={() => setActiveTab('receivables')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'receivables' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>A receber</button><button onClick={() => setActiveTab('payables')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'payables' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>A pagar</button></div></div><div className="p-16 text-center bg-[#0F172A] rounded-2xl border border-dashed border-white/10"><p className="text-slate-400">Nenhum dado disponível</p></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Contas a Receber &amp; Pagar</h1>
          <p className="text-xs text-slate-400 mt-1">Dados exibidos exclusivamente a partir do Supabase da organização ativa.</p>
        </div>
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10">
          <button onClick={() => setActiveTab('receivables')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'receivables' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>A Receber</button>
          <button onClick={() => setActiveTab('payables')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'payables' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>A Pagar</button>
        </div>
      </div>

      {activeTab === 'receivables' ? (
        <section className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Total a Receber" value={pendingReceivables} isPrivacyMode={isPrivacyMode} subtitle="Saldo real dos recebíveis" />
            <MetricCard title="Vencido" value={overdueReceivables} isPrivacyMode={isPrivacyMode} subtitle="Registros vencidos" />
            <MetricCard title="Recebido" value={receivedReceivables} isPrivacyMode={isPrivacyMode} subtitle="Valor recebido registrado" />
            <MetricCard title="Clientes" value={customers.length} prefix="" subtitle="Clientes da organização" />
          </div>
          <DataTable title="Contas a Receber" empty={receivables.length === 0} headers={['Cliente', 'Descrição', 'Vencimento', 'Valor', 'Status', 'Ação']}>
            {receivables.map(row => <tr key={row.id} className="border-b border-white/5">
              <td className="py-3 px-4 font-bold">{row.client}</td><td className="py-3 px-4 text-slate-400">{row.description}</td>
              <td className="py-3 px-4 text-slate-400">{row.dueDate}</td><td className="py-3 px-4 text-right">{money(row.amount)}</td>
              <td className="py-3 px-4 text-center">{row.status}</td><td className="py-3 px-4 text-center"><button onClick={notImplementedMutation} className="px-2 py-1 rounded bg-emerald-700 text-[11px] font-bold">Atualizar</button></td>
            </tr>)}
          </DataTable>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Total a Pagar" value={pendingPayables} isPrivacyMode={isPrivacyMode} subtitle="Saldo real dos pagáveis" />
            <MetricCard title="Pago" value={paidPayables} isPrivacyMode={isPrivacyMode} subtitle="Valor pago registrado" />
            <MetricCard title="Pago via PF" value={paidByPf} isPrivacyMode={isPrivacyMode} subtitle="Saldo atribuído ao sócio" />
            <MetricCard title="Fornecedores" value={suppliers.length} prefix="" subtitle="Fornecedores da organização" />
          </div>
          <DataTable title="Contas a Pagar" empty={payables.length === 0} headers={['Fornecedor', 'Descrição', 'Vencimento', 'Valor', 'Status', 'Ação']}>
            {payables.map(row => <tr key={row.id} className="border-b border-white/5">
              <td className="py-3 px-4 font-bold">{row.supplier}</td><td className="py-3 px-4 text-slate-400">{row.description}</td>
              <td className="py-3 px-4 text-slate-400">{row.dueDate}</td><td className="py-3 px-4 text-right">{money(row.amount)}</td>
              <td className="py-3 px-4 text-center">{row.status}</td><td className="py-3 px-4 text-center"><button onClick={notImplementedMutation} className="px-2 py-1 rounded bg-cyan-700 text-[11px] font-bold">Atualizar</button></td>
            </tr>)}
          </DataTable>
        </section>
      )}
      {toast && <div role="status" className="fixed bottom-6 right-6 z-50 bg-cyan-950 text-cyan-200 border border-cyan-700 px-5 py-3 rounded-2xl text-xs font-bold">{toast}</div>}
    </div>
  );
}

function DataTable({ title, headers, empty, children }: { title: string; headers: string[]; empty: boolean; children: ReactNode }) {
  return <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden">
    <div className="p-4 border-b border-white/5 flex items-center justify-between"><h3 className="font-bold text-sm text-white">{title}</h3><span className="text-xs text-slate-500">Fonte: Supabase</span></div>
    <div className="overflow-x-auto">{empty ? <div className="py-16 text-center text-slate-400">Nenhum dado disponível</div> : <table className="w-full text-left text-xs"><thead><tr className="bg-slate-900 text-slate-400 uppercase text-[10px]">{headers.map(header => <th key={header} className="py-3 px-4">{header}</th>)}</tr></thead><tbody>{children}</tbody></table>}</div>
  </div>;
}
