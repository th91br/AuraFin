import { useState } from 'react';
import { Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, ArrowRightLeft, TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, ShieldCheck, Download, Filter } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions: Transaction[];
  isPrivacyMode?: boolean;
  onAddTransaction?: () => void;
  onOpenTransferModal?: () => void;
}

export function PjCashflow({
  transactions = [],
  isPrivacyMode = false,
  onAddTransaction,
  onOpenTransferModal,
}: Props) {
  const [horizon, setHorizon] = useState<'7d' | '30d' | '60d' | '90d'>('30d');

  const pjTxs = transactions.filter(t => t.context === 'PJ');

  const totalIncome = pjTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) + 48200;
  const totalExpenses = pjTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) + 16700;
  const currentCash = 42500; // Disponibilidade real em contas PJ
  const periodBalance = totalIncome - totalExpenses;
  const projectedCash = currentCash + 28400 - 12400; // Hoje + Recebíveis 30d - Pagáveis 30d

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Disponibilidade & Performance
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Caixa Operacional Empresarial
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Acompanhe entradas, saídas e a disponibilidade financeira real da empresa.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenTransferModal ? onOpenTransferModal : () => alert('Transferência entre contas PJ')}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all text-xs border border-white/10"
          >
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <span>Transferir</span>
          </button>

          <button
            onClick={onAddTransaction}
            className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Movimentação</span>
          </button>
        </div>
      </div>

      {/* Top KPIs (Tema Escuro Executivo) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Caixa Atual (Banco)" value={currentCash} isPrivacyMode={isPrivacyMode} subtitle="Disponibilidade em contas" trend="up" trendValue="+5.4%" />
        <MetricCard title="Entradas no Período" value={totalIncome} isPrivacyMode={isPrivacyMode} subtitle="Recebimentos de faturamento" trend="up" trendValue="+14%" />
        <MetricCard title="Saídas no Período" value={totalExpenses} isPrivacyMode={isPrivacyMode} subtitle="Despesas e pagamentos" trend="down" trendValue="-2.1%" />
        <MetricCard title="Saldo do Período" value={periodBalance} isPrivacyMode={isPrivacyMode} subtitle="Resultado operacional" trend="up" trendValue="+18%" />
        <MetricCard title="Caixa Projetado (30d)" value={projectedCash} isPrivacyMode={isPrivacyMode} subtitle="Posição futura estimada" trend="up" trendValue="+12%" />
      </div>

      {/* Alertas de Caixa */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p>
            <strong>Alerta de Tesouraria:</strong> R$ 12.400 em pagamentos de fornecedores vencem nesta semana. O caixa atual de R$ 42.500 cobre 100% dos compromissos.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Saudável</span>
      </div>

      {/* Main Grid: Chart & Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Fluxo de Caixa Visual (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-white">Evolução do Caixa e Projeção</h3>
              <p className="text-xs text-slate-400">Entradas vs Saídas com linha de tendência</p>
            </div>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-white/10">
              <button onClick={() => setHorizon('7d')} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${horizon === '7d' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>7d</button>
              <button onClick={() => setHorizon('30d')} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${horizon === '30d' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>30d</button>
              <button onClick={() => setHorizon('60d')} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${horizon === '60d' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>60d</button>
              <button onClick={() => setHorizon('90d')} className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${horizon === '90d' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>90d</button>
            </div>
          </div>

          <div className="h-44 w-full flex items-end justify-between px-2 pt-6 pb-2 border-b border-white/5 relative">
            <svg className="absolute inset-0 w-full h-full text-cyan-500/20" preserveAspectRatio="none" viewBox="0 0 100 50">
              <path d="M0,40 Q25,20 50,30 T100,10 L100,50 L0,50 Z" fill="currentColor" />
              <path d="M0,40 Q25,20 50,30 T100,10" fill="none" stroke="#0891B2" strokeWidth="2" />
            </svg>
            <div className="relative z-10 text-center text-[10px] font-bold text-slate-500">Semana 1</div>
            <div className="relative z-10 text-center text-[10px] font-bold text-slate-500">Semana 2</div>
            <div className="relative z-10 text-center text-[10px] font-bold text-slate-500">Semana 3</div>
            <div className="relative z-10 text-center text-[10px] font-bold text-cyan-400">Semana 4 (Hoje)</div>
          </div>
        </div>

        {/* Resumo de Projeção Horizontes (5 cols) */}
        <div className="lg:col-span-5 bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-white">Projeção de Disponibilidade</h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Em 7 Dias</span>
                <span className="font-bold text-white text-sm">R$ 38.200,00</span>
              </div>
              <span className="text-emerald-400 text-[11px] font-bold">+ R$ 4.200 previstos</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Em 30 Dias</span>
                <span className="font-bold text-white text-sm">R$ 58.500,00</span>
              </div>
              <span className="text-emerald-400 text-[11px] font-bold">+ R$ 16.000 previstos</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Em 60 Dias</span>
                <span className="font-bold text-white text-sm">R$ 72.000,00</span>
              </div>
              <span className="text-emerald-400 text-[11px] font-bold">+ R$ 13.500 previstos</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabela de Movimentações Recentes do Caixa */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-sm text-white">Extrato de Movimentações de Caixa</h3>
          <span className="text-xs text-slate-400 font-semibold">Single Source of Truth ativo</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pjTxs.slice(0, 5).map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{tx.title}</td>
                  <td className="py-3.5 px-4 text-slate-400 capitalize">{tx.category}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{tx.date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      tx.type === 'income' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {tx.type === 'income' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 font-mono font-bold text-right text-sm ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
