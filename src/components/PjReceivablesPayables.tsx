import { useState } from 'react';
import { Customer, Supplier, CostCenter } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, Check, Clock, AlertTriangle, DollarSign, Filter, Search, ArrowUpRight, CheckCircle2, UserCheck, CreditCard } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  customers?: Customer[];
  suppliers?: Supplier[];
  costCenters?: CostCenter[];
  isPrivacyMode?: boolean;
}

export function PjReceivablesPayables({
  customers = [],
  suppliers = [],
  costCenters = [],
  isPrivacyMode = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>('receivables');
  const [receiveModalItem, setReceiveModalItem] = useState<any | null>(null);
  const [payModalItem, setPayModalItem] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Mock Recebíveis PJ
  const [receivables, setReceivables] = useState([
    { id: 'r1', client: 'TechCorp Brasil', description: 'Desenvolvimento Software - Parcela 2/3', amount: 8500, dueDate: '2026-08-15', status: 'vencendo', installment: '2/3' },
    { id: 'r2', client: 'Grupo Varejo Sul', description: 'Consultoria Mensal de Arquitetura', amount: 12000, dueDate: '2026-08-05', status: 'vencido', installment: '1/1' },
    { id: 'r3', client: 'Startup Innovate', description: 'Licenciamento de Plataforma SaaS', amount: 4500, dueDate: '2026-08-25', status: 'previsto', installment: '1/1' },
  ]);

  // Mock Pagáveis PJ
  const [payables, setPayables] = useState([
    { id: 'p1', supplier: 'AWS Amazon Web Services', description: 'Hospedagem & Nuvem Cloud', amount: 3200, dueDate: '2026-08-12', status: 'vencendo', isPaidByPF: false },
    { id: 'p2', supplier: 'Google Workspace', description: 'Licenças de E-mail & Productivity', amount: 850, dueDate: '2026-08-18', status: 'previsto', isPaidByPF: true },
    { id: 'p3', supplier: 'Escritório de Contabilidade', description: 'Honorários Contábeis Mensais', amount: 1450, dueDate: '2026-08-10', status: 'vencendo', isPaidByPF: false },
  ]);

  const handleMarkAsReceived = (id: string) => {
    setReceivables(prev => prev.map(r => r.id === id ? { ...r, status: 'recebido' } : r));
    setReceiveModalItem(null);
    setToastMsg('Recebimento confirmado! Caixa atualizado.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleMarkAsPaid = (id: string) => {
    setPayables(prev => prev.map(p => p.id === id ? { ...p, status: 'pago' } : p));
    setPayModalItem(null);
    setToastMsg('Pagamento confirmado! Caixa atualizado.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header com Alternador de Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Compromissos Financeiros Empresariais
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Contas a Receber & Pagar
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10">
          <button
            onClick={() => setActiveTab('receivables')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'receivables' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Contas a Receber (+ Entradas)
          </button>
          <button
            onClick={() => setActiveTab('payables')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'payables' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Contas a Pagar (- Saídas)
          </button>
        </div>
      </div>

      {/* SEÇÃO: CONTAS A RECEBER */}
      {activeTab === 'receivables' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Total a Receber" value={25000} isPrivacyMode={isPrivacyMode} subtitle="Previsto na carteira" trend="up" trendValue="+10%" />
            <MetricCard title="Vencendo em Breve" value={8500} isPrivacyMode={isPrivacyMode} subtitle="Vencimento nos próximos 7d" />
            <MetricCard title="Vencido Inadimplente" value={12000} isPrivacyMode={isPrivacyMode} subtitle="Cobrança necessária" trend="down" trendValue="-5%" />
            <MetricCard title="Recebido no Mês" value={48200} isPrivacyMode={isPrivacyMode} subtitle="Entrada realizada no caixa" />
          </div>

          <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">Lista de Contas a Receber</h3>
              <button
                onClick={() => alert('Formulário de nova conta a receber')}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
              >
                + Nova Conta a Receber
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Parcela</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {receivables.map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-bold text-white">{r.client}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-400">{r.description}</td>
                      <td className="py-3.5 px-4 text-slate-400">{r.dueDate}</td>
                      <td className="py-3.5 px-4 text-slate-400">{r.installment}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">R$ {r.amount.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                          r.status === 'recebido' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          r.status === 'vencido' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        {r.status !== 'recebido' ? (
                          <button
                            onClick={() => setReceiveModalItem(r)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg"
                          >
                            Marcar como Recebido
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-bold">Concluído</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO: CONTAS A PAGAR */}
      {activeTab === 'payables' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Total a Pagar" value={5500} isPrivacyMode={isPrivacyMode} subtitle="Compromissos pendentes" />
            <MetricCard title="Vencendo em Breve" value={4650} isPrivacyMode={isPrivacyMode} subtitle="Próximos 7 dias" />
            <MetricCard title="Pago no Mês" value={16700} isPrivacyMode={isPrivacyMode} subtitle="Saídas efetuadas" trend="down" trendValue="-3%" />
            <MetricCard title="Pagas via PF (Sócio)" value={850} isPrivacyMode={isPrivacyMode} subtitle="Crédito do sócio" />
          </div>

          <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">Lista de Contas a Pagar</h3>
              <button
                onClick={() => alert('Formulário de nova conta a pagar')}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
              >
                + Nova Conta a Pagar
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Fornecedor</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Origem Pagamento</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {payables.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-bold text-white">{p.supplier}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-400">{p.description}</td>
                      <td className="py-3.5 px-4 text-slate-400">{p.dueDate}</td>
                      <td className="py-3.5 px-4 font-sans">
                        {p.isPaidByPF ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            Paga via PF (Sócio)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Conta PJ</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">R$ {p.amount.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                          p.status === 'pago' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        {p.status !== 'pago' ? (
                          <button
                            onClick={() => setPayModalItem(p)}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] rounded-lg"
                          >
                            Marcar como Pago
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-bold">Concluído</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Marcar como Recebido */}
      {receiveModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 text-white">
            <h3 className="font-bold text-base">Confirmar Recebimento de Valor</h3>
            <p className="text-xs text-slate-400">Ao confirmar, o status muda para Recebido e a entrada real é registrada no Caixa PJ.</p>
            <div className="p-3 bg-slate-900 rounded-xl space-y-1 text-xs">
              <p><strong>Cliente:</strong> {receiveModalItem.client}</p>
              <p><strong>Valor:</strong> R$ {receiveModalItem.amount.toLocaleString('pt-BR')}</p>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setReceiveModalItem(null)} className="px-4 py-2 text-xs font-bold text-slate-400">Cancelar</button>
              <button onClick={() => handleMarkAsReceived(receiveModalItem.id)} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">Confirmar Entrada no Caixa</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Marcar como Pago */}
      {payModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 text-white">
            <h3 className="font-bold text-base">Confirmar Pagamento de Despesa</h3>
            <p className="text-xs text-slate-400">Ao confirmar, a saída bancária é registrada no Caixa PJ.</p>
            <div className="p-3 bg-slate-900 rounded-xl space-y-1 text-xs">
              <p><strong>Fornecedor:</strong> {payModalItem.supplier}</p>
              <p><strong>Valor:</strong> R$ {payModalItem.amount.toLocaleString('pt-BR')}</p>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setPayModalItem(null)} className="px-4 py-2 text-xs font-bold text-slate-400">Cancelar</button>
              <button onClick={() => handleMarkAsPaid(payModalItem.id)} className="px-4 py-2 bg-cyan-600 text-white font-bold text-xs rounded-xl">Confirmar Saída no Caixa</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-950 text-cyan-200 border border-cyan-700 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold">
          {toastMsg}
        </div>
      )}

    </div>
  );
}
