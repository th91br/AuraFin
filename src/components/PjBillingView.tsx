import { BusinessInvoice } from '../services/repositories/supabase/SupabaseBusinessDataRepository';
import { MetricCard } from './aura/AuraCards';
import { Plus, Receipt } from 'lucide-react';

interface Props { invoices?: BusinessInvoice[]; isPrivacyMode?: boolean; onAddBilling?: () => void; }
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PjBillingView({ invoices = [], isPrivacyMode = false, onAddBilling }: Props) {
  const totalBilled = invoices.reduce((sum, row) => sum + row.amount, 0);
  const totalPaid = invoices.filter(row => ['paid', 'paga'].includes(row.status)).reduce((sum, row) => sum + row.amount, 0);
  const totalOpen = invoices.filter(row => ['open', 'em_aberto', 'pending'].includes(row.status)).reduce((sum, row) => sum + row.amount, 0);
  const totalOverdue = invoices.filter(row => ['overdue', 'vencida'].includes(row.status)).reduce((sum, row) => sum + row.amount, 0);
  if (invoices.length === 0) return <div className="space-y-8 animate-in fade-in duration-200 text-slate-100"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4"><div><h1 className="text-2xl font-black tracking-tight text-white">Faturamento Empresarial</h1><p className="text-xs text-slate-400 mt-1">Faturas da organização ativa.</p></div><button onClick={onAddBilling} className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white font-bold rounded-xl text-xs"><Plus className="w-4 h-4" />Novo faturamento</button></div><div className="p-16 text-center bg-[#0F172A] rounded-2xl border border-dashed border-white/10"><Receipt className="w-10 h-10 mx-auto mb-3 text-slate-600" /><p className="text-slate-400">Nenhum dado disponível</p></div></div>;
  return <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div><h1 className="text-2xl font-black tracking-tight text-white">Faturamento Empresarial</h1><p className="text-xs text-slate-400 mt-1">Faturas reais da organização ativa.</p></div>
      <button onClick={onAddBilling} className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs"><Plus className="w-4 h-4" />Novo Faturamento</button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><MetricCard title="Faturado" value={totalBilled} isPrivacyMode={isPrivacyMode} subtitle="Notas/faturas do Supabase" /><MetricCard title="Recebido" value={totalPaid} isPrivacyMode={isPrivacyMode} subtitle="Status liquidado" /><MetricCard title="Em Aberto" value={totalOpen} isPrivacyMode={isPrivacyMode} subtitle="Status pendente" /><MetricCard title="Vencido" value={totalOverdue} isPrivacyMode={isPrivacyMode} subtitle="Status vencido" /></div>
    <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden"><div className="p-4 border-b border-white/5 flex justify-between"><h3 className="font-bold text-sm text-white">Faturas</h3><span className="text-xs text-slate-500">Fonte: Supabase</span></div>
      {invoices.length === 0 ? <div className="py-16 text-center text-slate-400"><Receipt className="w-10 h-10 mx-auto mb-3 text-slate-600" />Nenhum dado disponível</div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="bg-slate-900 text-slate-400 uppercase text-[10px]"><th className="py-3 px-4">Número</th><th className="py-3 px-4">Cliente</th><th className="py-3 px-4">Emissão</th><th className="py-3 px-4">Vencimento</th><th className="py-3 px-4 text-right">Valor</th><th className="py-3 px-4">Status</th></tr></thead><tbody>{invoices.map(row => <tr key={row.id} className="border-b border-white/5"><td className="py-3 px-4 font-mono">{row.invoiceNumber}</td><td className="py-3 px-4 font-bold">{row.client}</td><td className="py-3 px-4 text-slate-400">{row.issueDate}</td><td className="py-3 px-4 text-slate-400">{row.dueDate}</td><td className="py-3 px-4 text-right">{money(row.amount)}</td><td className="py-3 px-4">{row.status}</td></tr>)}</tbody></table></div>}
    </div>
  </div>;
}
