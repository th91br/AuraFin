import { Transaction, Account, Customer, Supplier, Project, CostCenter, Defaulter, CreditCard, TransactionAnalytics, TransactionQueryFilters } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Download, FileText } from 'lucide-react';

interface Props {
  transactions?: Transaction[];
  accounts?: Account[];
  customers?: Customer[];
  suppliers?: Supplier[];
  projects?: Project[];
  costCenters?: CostCenter[];
  defaulters?: Defaulter[];
  creditCards?: CreditCard[];
  isPrivacyMode?: boolean;
  analytics?: TransactionAnalytics;
  onExportCsv?: (filters?: Pick<TransactionQueryFilters, 'startDate' | 'endDateExclusive'>) => Promise<string>;
  onNavigateTab?: (tab: string) => void;
}

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PjReports({
  transactions = [],
  accounts = [],
  customers = [],
  suppliers = [],
  projects = [],
  defaulters = [],
  creditCards = [],
  isPrivacyMode = false,
  analytics,
  onExportCsv,
}: Props) {
  const hasData =
    Boolean(analytics && analytics.transaction_count > 0) ||
    transactions.length > 0 ||
    accounts.some((row) => row.context === 'PJ') ||
    customers.length > 0 ||
    suppliers.length > 0 ||
    projects.length > 0 ||
    defaulters.length > 0 ||
    creditCards.some((row) => row.context === 'PJ');

  const revenue =
    Number(analytics?.total_receipts_cents || 0) / 100 ||
    transactions.filter((row) => row.context === 'PJ' && row.type === 'income').reduce((sum, row) => sum + row.amount, 0);

  const expenses =
    Number(analytics?.total_expenses_cents || 0) / 100 ||
    transactions.filter((row) => row.context === 'PJ' && row.type === 'expense').reduce((sum, row) => sum + row.amount, 0);

  const balance = Number(analytics?.balance_cents || 0) / 100;
  const categoryRows = (analytics?.by_category || []).filter((row) => row.expenses_cents > 0);
  const delinquent = defaulters.reduce((sum, row) => sum + row.amount, 0);

  const exportReport = async () => {
    const csv = await onExportCsv?.();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'aurafin-relatorio-pj.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Relatórios Executivos PJ</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">Consolidação contábil, faturamento, despesas por categoria e exportação para auditoria.</p>
        </div>
        <button
          onClick={() => void exportReport()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {!hasData ? (
        <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10 text-slate-300">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Nenhum dado financeiro para relatório</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">Cadastre transações na PJ para gerar relatórios fiscais e de desempenho.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard title="Receitas Totais" value={revenue} isPrivacyMode={isPrivacyMode} subtitle="Faturamento do período" />
            <MetricCard title="Despesas Totais" value={expenses} isPrivacyMode={isPrivacyMode} subtitle="Gastos operacionais" />
            <MetricCard title="Saldo Consolidado" value={balance} isPrivacyMode={isPrivacyMode} subtitle="Resultado contábil" />
            <MetricCard title="Inadimplência" value={delinquent} isPrivacyMode={isPrivacyMode} subtitle="Cobranças em aberto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="p-6 bg-slate-900/90 rounded-2xl border border-white/10 space-y-4">
              <h2 className="font-bold text-white text-base">Despesas por Categoria</h2>
              {categoryRows.length === 0 ? (
                <p className="text-sm text-slate-300">Nenhum lançamento por categoria.</p>
              ) : (
                <div className="space-y-3">
                  {categoryRows.map((row) => (
                    <div key={row.category} className="flex justify-between text-sm py-1.5 border-b border-white/5">
                      <span className="text-slate-300 capitalize">{row.category}</span>
                      <strong className="text-white font-mono">{money(row.expenses_cents / 100)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="p-6 bg-slate-900/90 rounded-2xl border border-white/10 space-y-4">
              <h2 className="font-bold text-white text-base">Projetos &amp; Contratos</h2>
              {projects.length === 0 ? (
                <p className="text-sm text-slate-300">Nenhum projeto cadastrado.</p>
              ) : (
                <div className="space-y-3">
                  {projects.map((row) => (
                    <div key={row.id} className="flex justify-between text-sm py-1.5 border-b border-white/5">
                      <span className="text-slate-300">{row.name}</span>
                      <strong className="text-white font-mono">{money(row.revenueContracted ?? row.revenue)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
