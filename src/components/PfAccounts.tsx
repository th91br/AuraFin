import { useState } from 'react';
import { Account, Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Landmark, ArrowRightLeft, ShieldCheck, Wallet, ChevronRight, Building, Trash2 } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  accounts: Account[];
  transactions: Transaction[];
  isPrivacyMode?: boolean;
  onAddAccount: () => void;
  onOpenTransferModal: () => void;
  onDeleteAccount?: (id: string) => void;
}

export function PfAccounts({
  accounts,
  transactions,
  isPrivacyMode = false,
  onAddAccount,
  onOpenTransferModal,
  onDeleteAccount,
}: Props) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const pfAccounts = accounts.filter(a => a.context === 'PF');
  const totalBalance = pfAccounts.reduce((acc, a) => acc + a.balance, 0);
  const highestBalance = pfAccounts.reduce((max, a) => Math.max(max, a.balance), 0);

  const selectedAccount = pfAccounts.find(a => a.id === selectedAccountId);
  const selectedAccountTransactions = selectedAccount
    ? transactions.filter(t => t.context === 'PF' && (t.accountId === selectedAccount.id || t.title.toLowerCase().includes(selectedAccount.institution.toLowerCase())))
    : [];

  if (pfAccounts.length === 0) return <div className="space-y-8 animate-in fade-in duration-200"><div className="flex items-center justify-between border-b border-slate-200/60 pb-4"><div><h1 className="text-2xl font-black tracking-tight text-slate-950">Contas &amp; Carteiras</h1><p className="text-xs text-slate-500 mt-1">Contas reais do usuário autenticado.</p></div><button onClick={onAddAccount} className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs"><Plus className="w-4 h-4" />Adicionar conta</button></div><div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300"><Landmark className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-slate-500">Nenhum dado disponível</p></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Patrimônio Líquido Disponível
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Contas & Carteiras
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Organize suas contas e veja seu saldo consolidado disponível em um só lugar.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-all text-xs border border-slate-200"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            <span>Transferir Entre Contas</span>
          </button>

          <button
            onClick={onAddAccount}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Conta</span>
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Saldo Consolidado Total"
          value={totalBalance}
          isPrivacyMode={isPrivacyMode}
          subtitle="Soma total das contas ativas em tempo real"
        />

        <MetricCard
          title="Quantidade de Contas"
          value={pfAccounts.length}
          prefix=""
          subtitle="Bancos, Carteiras & Investimentos"
        />

        <MetricCard
          title="Maior Saldo Individual"
          value={highestBalance}
          isPrivacyMode={isPrivacyMode}
          subtitle="Conta com maior liquidez disponível"
        />
      </div>

      {/* Main Grid: Account Cards */}
      {pfAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pfAccounts.map(account => (
            <div
              key={account.id}
              onClick={() => setSelectedAccountId(account.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                selectedAccountId === account.id
                  ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {account.institution?.charAt(0) || 'B'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-950">{account.name}</h3>
                    <p className="text-[11px] font-medium text-slate-500">{account.institution} • {account.type}</p>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {account.type}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Atual</span>
                <PrivacyText
                  value={account.balance}
                  isPrivacyMode={isPrivacyMode}
                  className="text-2xl font-black font-mono text-slate-950 tracking-tight block"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-500">
                <span>Ver extrato da conta</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950">Nenhuma conta cadastrada</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Cadastre suas contas bancárias, contas de pagamento ou carteiras para ver seu saldo unificado.
            </p>
          </div>
          <button
            onClick={onAddAccount}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeira Conta</span>
          </button>
        </div>
      )}

      {/* Account Detail Drawer if selected */}
      {selectedAccount && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-950">Extrato da Conta: {selectedAccount.name}</h3>
              <p className="text-xs text-slate-500 font-mono">
                Saldo Atual: R$ {selectedAccount.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {onDeleteAccount && (
                <button
                  onClick={() => {
                    if (confirm(`Deseja realmente remover a conta ${selectedAccount.name}?`)) {
                      onDeleteAccount(selectedAccount.id);
                      setSelectedAccountId(null);
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Conta</span>
                </button>
              )}
              <button onClick={() => setSelectedAccountId(null)} className="text-xs text-slate-500 font-bold hover:text-slate-900">
                Fechar X
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {selectedAccountTransactions.length > 0 ? (
              selectedAccountTransactions.slice(0, 10).map(tx => (
                <div key={tx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{tx.title}</p>
                    <p className="text-[10px] text-slate-500">{tx.date} • {tx.category}</p>
                  </div>
                  <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma movimentação específica vinculada a esta conta.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
