import { Transaction } from '../types';

export function PjPlanning({ transactions = [] }: { transactions?: Transaction[]; onReimburse?: () => void }) {
  const rows = transactions.filter(row => row.context === 'PJ');
  const income = rows.filter(row => row.type === 'income').reduce((sum, row) => sum + row.amount, 0);
  const expenses = rows.filter(row => row.type === 'expense').reduce((sum, row) => sum + row.amount, 0);
  return <div className="space-y-6"><h2 className="text-2xl font-bold text-slate-900">Planejamento PJ</h2>{rows.length === 0 ? <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">Nenhum dado disponível</div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="p-6 bg-white rounded-2xl border border-slate-200"><p className="text-xs text-slate-500">Receitas na página</p><strong className="text-2xl text-slate-900">R$ {income.toLocaleString('pt-BR')}</strong></div><div className="p-6 bg-white rounded-2xl border border-slate-200"><p className="text-xs text-slate-500">Despesas na página</p><strong className="text-2xl text-slate-900">R$ {expenses.toLocaleString('pt-BR')}</strong></div></div>}</div>;
}
