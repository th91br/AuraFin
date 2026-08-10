import { useState } from 'react';
import { Transaction, Account, CreditCard } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, FileText, Trash2, Edit2, Copy, RefreshCw, X } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
  creditCards: CreditCard[];
  isPrivacyMode?: boolean;
  onAddTransaction: () => void;
}

export function PfTransactions({
  transactions,
  accounts,
  creditCards,
  isPrivacyMode = false,
  onAddTransaction,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('este_mes');
  const [selectedDetailTx, setSelectedDetailTx] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pfTxs = transactions.filter(t => t.context === 'PF');

  const filteredTxs = pfTxs.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'todos' || t.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalIncome = filteredTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = filteredTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netPeriodBalance = totalIncome - totalExpenses;

  const handleDeleteWithToast = (title: string) => {
    setToastMessage(`Movimentação "${title}" removida.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Extrato Operacional PF
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Movimentações
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Acompanhe todas as entradas, saídas e transferências da sua vida financeira.
          </p>
        </div>

        <button
          onClick={onAddTransaction}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Movimentação</span>
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Entradas do Período" value={totalIncome} isPrivacyMode={isPrivacyMode} subtitle="Receitas e Pró-labore" trend="up" trendValue="+12%" />
        <MetricCard title="Saídas do Período" value={totalExpenses} isPrivacyMode={isPrivacyMode} subtitle="Despesas e faturas" trend="down" trendValue="-3%" />
        <MetricCard title="Saldo do Período" value={netPeriodBalance} isPrivacyMode={isPrivacyMode} subtitle="Resultado líquido" trend="up" trendValue="+8%" />
        <MetricCard title="Total Registros" value={filteredTxs.length} prefix="" subtitle="Transações filtradas" />
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descrição ou categoria..."
            className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
          >
            <option value="este_mes">Este Mês</option>
            <option value="hoje">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="mes_anterior">Mês Anterior</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="income">Entradas (+)</option>
            <option value="expense">Saídas (-)</option>
            <option value="transfer">Transferências</option>
          </select>
        </div>

      </div>

      {/* FinancialTable Desktop / Cards Mobile */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxs.map(tx => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedDetailTx(tx)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">{tx.title}</td>
                  <td className="py-3.5 px-4 text-slate-500 capitalize">{tx.category}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{isPrivacyMode ? '••/••/••••' : tx.date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      tx.type === 'income' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {tx.type === 'income' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 font-mono font-bold text-right text-sm ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    <PrivacyText value={tx.amount} isPrivacyMode={isPrivacyMode} prefix={tx.type === 'income' ? '+ R$' : '- R$'} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWithToast(tx.title);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Excluir movimentação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-bold animate-in slide-in-from-bottom duration-200">
          <span>{toastMessage}</span>
          <button className="text-cyan-400 underline font-bold">Desfazer</button>
        </div>
      )}

      {/* Detail Drawer Modal */}
      {selectedDetailTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="font-bold text-base text-slate-950">Detalhes da Movimentação</h3>
                <button onClick={() => setSelectedDetailTx(null)} className="p-1 text-slate-400 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Valor Registrado</span>
                <p className="text-3xl font-black font-mono text-slate-950">R$ {selectedDetailTx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Descrição</span>
                  <span>{selectedDetailTx.title}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Categoria</span>
                  <span className="capitalize">{selectedDetailTx.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Data do Lançamento</span>
                  <span className="font-mono">{selectedDetailTx.date}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-normal">Contexto</span>
                  <span>{selectedDetailTx.context === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDetailTx(null)}
              className="w-full py-2.5 bg-slate-950 text-white font-bold text-xs rounded-xl"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
