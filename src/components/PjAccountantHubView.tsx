import { Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Download, FileText } from 'lucide-react';

interface Props {
  transactions?: Transaction[];
  isPrivacyMode?: boolean;
  onExportCsv?: () => Promise<string>;
  onExportJson?: () => Promise<unknown>;
}

export function PjAccountantHubView({
  transactions = [],
  isPrivacyMode = false,
  onExportCsv,
  onExportJson,
}: Props) {
  const receipts = transactions
    .filter((row) => row.context === 'PJ' && row.type === 'income')
    .reduce((sum, row) => sum + row.amount, 0);

  const expenses = transactions
    .filter((row) => row.context === 'PJ' && row.type === 'expense')
    .reduce((sum, row) => sum + row.amount, 0);

  const exportFile = async (format: 'csv' | 'json') => {
    const data = format === 'csv' ? await onExportCsv?.() : await onExportJson?.();
    if (data == null) return;
    const blob = new Blob([format === 'json' ? JSON.stringify(data, null, 2) : String(data)], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `aurafin-contador.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Central do Contador</h1>
          <p className="text-xs text-slate-300 mt-1">Exportação de pacotes de dados estruturados para fechamento contábil mensal.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void exportFile('csv')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => void exportFile('json')}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard title="Receitas Filtradas" value={receipts} isPrivacyMode={isPrivacyMode} subtitle="Movimentações listadas" />
        <MetricCard title="Despesas Filtradas" value={expenses} isPrivacyMode={isPrivacyMode} subtitle="Movimentações listadas" />
        <MetricCard title="Total de Registros" value={transactions.length} prefix="" subtitle="Transações ativas" />
      </div>

      {transactions.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10 text-slate-300">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Nenhum dado contábil disponível</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
            Cadastre transações na organização para habilitar a geração de relatórios fiscais.
          </p>
        </div>
      ) : (
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-white/10 text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block text-sm mb-1">Pacote de Fechamento Contábil:</strong>
          O pacote exportado inclui metadados fiscais, categorizações contábeis, comprovações de reembolsos de sócios e conciliações bancárias em conformidade com os padrões contábeis vigentes.
        </div>
      )}
    </div>
  );
}
