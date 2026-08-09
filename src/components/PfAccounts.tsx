import { useState } from 'react';
import { Account, Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Landmark, ArrowRightLeft, ShieldCheck, Wallet, ChevronRight, Building } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  accounts: Account[];
  transactions: Transaction[];
  isPrivacyMode?: boolean;
  onAddAccount: () => void;
  onOpenTransferModal: () => void;
}

export function PfAccounts({
  accounts,
  transactions,
  isPrivacyMode = false,
  onAddAccount,
  onOpenTransferModal,
}: Props) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const pfAccounts = accounts.filter(a => a.context === 'PF');
  const totalBalance = pfAccounts.reduce((acc, a) => acc + a.balance, 0);
  const highestBalance = pfAccounts.reduce((max, a) => Math.max(max, a.balance), 0);

  const selectedAccount = pfAccounts.find(a => a.id === selectedAccountId);

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
          subtitle="Soma total das contas ativas (exclui limites de cartão)"
          trend="up"
          trendValue="+4.5%"
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
          subtitle="Conta de Renda Fixa / Reserva"
        />
      </div>

      {/* Main Grid: Account Cards */}
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
                  {account.institution.charAt(0)}
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
              <span>Ver extrato detalhado</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Account Detail Modal/Drawer if selected */}
      {selectedAccount && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-950">Histórico da Conta: {selectedAccount.name}</h3>
            <button onClick={() => setSelectedAccountId(null)} className="text-xs text-slate-500 font-bold hover:text-slate-900">Fechar X</button>
          </div>

          <div className="space-y-2">
            {transactions.filter(t => t.context === 'PF').slice(0, 5).map(tx => (
              <div key={tx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900">{tx.title}</p>
                  <p className="text-[10px] text-slate-500">{tx.date} • {tx.category}</p>
                </div>
                <span className="font-mono font-bold">R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
