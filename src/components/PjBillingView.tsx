import { BusinessInvoice } from '../services/repositories/supabase/SupabaseBusinessDataRepository';
import { MetricCard } from './aura/AuraCards';
import { Plus, Receipt } from 'lucide-react';

interface Props {
  invoices?: BusinessInvoice[];
  isPrivacyMode?: boolean;
  onAddBilling?: () => void;
}

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PjBillingView({ invoices = [], isPrivacyMode = false, onAddBilling }: Props) {
  const totalBilled = invoices.reduce((sum, row) => sum + row.amount, 0);
  const totalPaid = invoices
    .filter((row) => ['paid', 'paga'].includes(row.status))
    .reduce((sum, row) => sum + row.amount, 0);
  const totalOpen = invoices
    .filter((row) => ['open', 'em_aberto', 'pending'].includes(row.status))
    .reduce((sum, row) => sum + row.amount, 0);
  const totalOverdue = invoices
    .filter((row) => ['overdue', 'vencida'].includes(row.status))
    .reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Faturamento Empresarial</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">Emissão e acompanhamento de faturas, notas de serviço e boletos.</p>
        </div>
        {onAddBilling && (
          <button
            onClick={onAddBilling}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nova Fatura</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard title="Total Faturado" value={totalBilled} isPrivacyMode={isPrivacyMode} subtitle="Volume emitido" />
        <MetricCard title="Recebido" value={totalPaid} isPrivacyMode={isPrivacyMode} subtitle="Status liquidado" />
        <MetricCard title="Em Aberto" value={totalOpen} isPrivacyMode={isPrivacyMode} subtitle="Status pendente" />
        <MetricCard title="Vencido" value={totalOverdue} isPrivacyMode={isPrivacyMode} subtitle="Títulos em atraso" />
      </div>

      {invoices.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10 text-slate-300">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Nenhuma fatura registrada</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
            Gere faturas para seus clientes para acompanhar vencimentos e previsões de entrada.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <th className="py-3 px-4">Número</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Emissão</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-white font-bold">{row.invoiceNumber}</td>
                    <td className="py-3 px-4 font-bold text-white">{row.client}</td>
                    <td className="py-3 px-4 text-slate-300">{row.issueDate}</td>
                    <td className="py-3 px-4 text-slate-300">{row.dueDate}</td>
                    <td className="py-3 px-4 text-right font-mono text-white">{money(row.amount)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
