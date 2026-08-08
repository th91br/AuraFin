import { useState } from 'react';
import { Transaction, Account, CreditCard, RecurrenceItem } from '../types';
import { Receipt, CreditCard as CreditCardIcon, Landmark, RefreshCw, Filter, Plus, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  accounts: Account[];
  creditCards: CreditCard[];
  isPrivacyMode: boolean;
  onAddTransaction: () => void;
}

export function PfTransactions({ transactions, accounts, creditCards, isPrivacyMode, onAddTransaction }: Props) {
  const [subTab, setSubTab] = useState<'extrato' | 'contas' | 'cartoes' | 'recorrencias'>('extrato');
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [filterType, setFilterType] = useState<string>('todos');

  const pfTxs = transactions.filter(t => t.context === 'PF');

  const filteredTxs = pfTxs.filter(t => {
    if (filterCategory !== 'todas' && t.category !== filterCategory) return false;
    if (filterType !== 'todos' && t.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Movimentações & Cartões
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            Extrato unificado, controle de contas bancárias, cartões de crédito e assinaturas recorrentes.
          </p>
        </div>

        <button
          onClick={onAddTransaction}
          className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Sub-Tab Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('extrato')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'extrato' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Extrato Geral ({pfTxs.length})</span>
        </button>

        <button
          onClick={() => setSubTab('contas')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'contas' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Contas & Carteiras ({accounts.filter(a => a.context === 'PF').length})</span>
        </button>

        <button
          onClick={() => setSubTab('cartoes')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'cartoes' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>Cartões de Crédito ({creditCards.filter(c => c.context === 'PF').length})</span>
        </button>

        <button
          onClick={() => setSubTab('recorrencias')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            subTab === 'recorrencias' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Assinaturas Recorrentes</span>
        </button>
      </div>

      {/* SUB-TAB 1: EXTRATO */}
      {subTab === 'extrato' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Filter className="w-5 h-5 text-indigo-700" />
              <span>Filtros do Extrato</span>
            </h2>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="todas">Todas as Categorias</option>
                <option value="alimentacao">Alimentação & Mercado</option>
                <option value="saude">Saúde & Farmácia</option>
                <option value="educacao">Educação & Cursos</option>
                <option value="moradia">Moradia & Contas</option>
                <option value="salario_prolabore">Pró-labore Recebido</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="income">Entradas (Receita)</option>
                <option value="expense">Saídas (Despesa)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTxs.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                    {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5 text-emerald-600" /> : <ArrowDownRight className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-slate-900 text-sm">{tx.title}</p>
                      {tx.isTaxDeductiblePF && (
                        <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded">
                          IRPF Dedutível
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{tx.date} • {tx.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <PrivacyText
                    value={tx.amount}
                    isPrivacyMode={isPrivacyMode}
                    prefix={tx.type === 'income' ? '+ R$' : '- R$'}
                    className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-700' : 'text-slate-900'}`}
                  />
                </div>
              </div>
            ))}

            {filteredTxs.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                Nenhuma movimentação encontrada com os filtros selecionados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CONTAS & CARTEIRAS */}
      {subTab === 'contas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.filter(a => a.context === 'PF').map(acc => (
            <div key={acc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded capitalize">
                  {acc.type}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg">{acc.name}</h3>
                <p className="text-xs text-slate-500">{acc.institution}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Saldo Consolidado</span>
                <PrivacyText value={acc.balance} isPrivacyMode={isPrivacyMode} className="text-2xl font-black text-slate-900" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: CARTÕES DE CRÉDITO */}
      {subTab === 'cartoes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creditCards.filter(c => c.context === 'PF').map(card => (
            <div key={card.id} className="bg-slate-900 text-white p-7 rounded-2xl border border-slate-800 space-y-6 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCardIcon className="w-6 h-6 text-indigo-400" />
                  <span className="font-bold text-base text-white">{card.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{card.institution}</span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Fatura Atual (Vencimento dia {card.dueDay}):</p>
                <PrivacyText value={card.currentInvoice} isPrivacyMode={isPrivacyMode} className="text-3xl font-black text-white" />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Limite Utilizado:</span>
                  <span className="font-bold text-white">R$ {card.limitUsed.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Limite Total:</span>
                  <span className="font-bold text-slate-300">R$ {card.limitTotal.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 4: RECORRÊNCIAS */}
      {subTab === 'recorrencias' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Assinaturas & Contas Fixas Recorrentes</h2>
          <p className="text-xs text-slate-500">Serviços que são debitados automaticamente mensalmente.</p>

          <div className="space-y-3 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Plano de Saúde Unimed</h4>
                <p className="text-xs text-slate-500">Cobrança mensal todo dia 03</p>
              </div>
              <span className="font-bold text-slate-900 text-sm">R$ 1.250,00/mês</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Curso de Especialização UX/UI</h4>
                <p className="text-xs text-slate-500">Cobrança mensal todo dia 05</p>
              </div>
              <span className="font-bold text-slate-900 text-sm">R$ 980,00/mês</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
