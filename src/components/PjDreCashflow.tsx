import { Transaction } from '../types';

export function PjDreCashflow({ transactions = [] }: { transactions?: Transaction[] }) {
  const rows = transactions.filter(row => row.context === 'PJ');
  const revenue = rows.filter(row => row.type === 'income').reduce((sum, row) => sum + row.amount, 0);
  const expenses = rows.filter(row => row.type === 'expense').reduce((sum, row) => sum + row.amount, 0);
  return <div className="space-y-6 text-slate-100"><h1 className="text-2xl font-black">DRE &amp; Caixa</h1>{rows.length === 0 ? <div className="p-12 text-center bg-slate-900 rounded-2xl border border-dashed border-white/10 text-slate-400">Nenhum dado disponível</div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="p-6 bg-slate-900 rounded-2xl"><p className="text-xs text-slate-400">Receita</p><strong>R$ {revenue.toLocaleString('pt-BR')}</strong></div><div className="p-6 bg-slate-900 rounded-2xl"><p className="text-xs text-slate-400">Despesas</p><strong>R$ {expenses.toLocaleString('pt-BR')}</strong></div><div className="p-6 bg-slate-900 rounded-2xl"><p className="text-xs text-slate-400">Resultado</p><strong>R$ {(revenue - expenses).toLocaleString('pt-BR')}</strong></div></div>}</div>;
}
