import { Transaction, TransactionAnalytics } from '../types';
import { RefreshCcw, Download, Landmark } from 'lucide-react';

interface Props {
  transactions?: Transaction[];
  analytics?: TransactionAnalytics;
  onExportJson?: () => Promise<unknown>;
  onReimburse: () => void;
}

export function PjAccounting({
  transactions = [],
  analytics,
  onExportJson,
  onReimburse,
}: Props) {
  const rows = transactions.filter((row) => row.context === 'PJ');
  const pending = rows.filter((row) => row.isPaidByPF && !row.reimbursed);
  const reimbursement =
    Number(analytics?.paid_by_pf_cents || 0) / 100 || pending.reduce((sum, row) => sum + row.amount, 0);
  const personal = rows.filter((row) => row.isPersonalExpenseInPJ);

  const exportPackage = async () => {
    const data = await onExportJson?.();
    if (data == null) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'aurafin-pacote-contabil.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Central Contábil</h1>
          <p className="text-xs text-slate-300 mt-1">Conciliação de retiradas, reembolsos de sócios e exportação de pacote fiscal.</p>
        </div>
        <button
          onClick={() => void exportPackage()}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Pacote JSON</span>
        </button>
      </div>

      {reimbursement > 0 && (
        <div className="p-5 bg-slate-900 border border-amber-500/30 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-300 block">Reembolso pendente ao sócio</span>
            <strong className="text-amber-400 font-mono text-base font-bold">
              {reimbursement.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
          </div>
          <button
            onClick={onReimburse}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Processar Reembolso</span>
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10 text-slate-300">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Nenhum lançamento contábil</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">Lançamentos na PJ serão refletidos automaticamente na central contábil.</p>
        </div>
      ) : (
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-white/10 space-y-4">
          <h2 className="font-bold text-white text-base">Uso Pessoal Pago na PJ (Ajuste de Pró-labore)</h2>
          {personal.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum lançamento marcado como despesa pessoal na conta da empresa.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {personal.map((row) => (
                <div key={row.id} className="py-2.5 flex justify-between items-center text-sm">
                  <span className="text-slate-200">{row.title}</span>
                  <strong className="text-rose-400 font-mono">
                    {row.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
