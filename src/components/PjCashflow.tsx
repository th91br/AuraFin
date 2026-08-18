import { Transaction, TransactionAnalytics } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, ArrowRightLeft, BarChart3 } from 'lucide-react';

interface Props {
  transactions?: Transaction[];
  analytics?: TransactionAnalytics;
  isPrivacyMode?: boolean;
  onAddTransaction?: () => void;
  onOpenTransferModal?: () => void;
}

export function PjCashflow({
  transactions = [],
  analytics,
  isPrivacyMode = false,
  onAddTransaction,
  onOpenTransferModal,
}: Props) {
  const rows = transactions.filter((row) => row.context === 'PJ');
  const income =
    Number(analytics?.total_receipts_cents || 0) / 100 ||
    rows.filter((row) => row.type === 'income').reduce((sum, row) => sum + row.amount, 0);
  const expenses =
    Number(analytics?.total_expenses_cents || 0) / 100 ||
    rows.filter((row) => row.type === 'expense').reduce((sum, row) => sum + row.amount, 0);
  const balance = Number(analytics?.balance_cents || 0) / 100;
  const hasData = Boolean(analytics && analytics.transaction_count > 0) || rows.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Caixa Operacional Empresarial</h1>
          <p className="text-xs text-slate-300 mt-1">Acompanhamento contínuo de entradas, saídas e saldo líquido operacional.</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenTransferModal && (
            <button
              onClick={onOpenTransferModal}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white rounded-xl text-xs font-bold transition-all"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-300" />
              <span>Transferir</span>
            </button>
          )}
          {onAddTransaction && (
            <button
              onClick={onAddTransaction}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Lançamento</span>
            </button>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10 text-slate-300">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Nenhum lançamento no fluxo de caixa</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
            Cadastre receitas e despesas da empresa para acompanhar seu fluxo diário.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Saldo em Caixa" value={balance} isPrivacyMode={isPrivacyMode} subtitle="Posição líquida" />
            <MetricCard title="Entradas" value={income} isPrivacyMode={isPrivacyMode} subtitle="Faturamento creditado" />
            <MetricCard title="Saídas" value={expenses} isPrivacyMode={isPrivacyMode} subtitle="Despesas debitadas" />
            <MetricCard title="Resultado do Período" value={income - expenses} isPrivacyMode={isPrivacyMode} subtitle="Geração líquida" />
          </div>

          <div className="p-6 bg-slate-900/90 rounded-2xl border border-white/10 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block text-sm mb-1">Previsão e Conciliação:</strong>
            Os valores acima refletem movimentações liquidadas. Para projeções futuras de curto e médio prazo, consulte as abas de Contas a Receber e Runway.
          </div>
        </>
      )}
    </div>
  );
}
