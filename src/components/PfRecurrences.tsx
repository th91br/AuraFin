import { useState } from 'react';
import { RecurrenceItem } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, RefreshCw, Calendar, Pause, Play, Trash2, Edit2, Clock } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  isPrivacyMode?: boolean;
  onAddRecurrence: () => void;
}

export function PfRecurrences({ isPrivacyMode = false, onAddRecurrence }: Props) {
  const [recurrences, setRecurrences] = useState<RecurrenceItem[]>([
    { id: 'r1', title: 'Aluguel & Condomínio', amount: 2150, frequency: 'mensal', category: 'moradia', nextDueDate: '2026-08-10', context: 'PF' },
    { id: 'r2', title: 'Assinatura Netflix & Spotify', amount: 59.90, frequency: 'mensal', category: 'lazer', nextDueDate: '2026-08-12', context: 'PF' },
    { id: 'r3', title: 'Plano de Saúde Familiar', amount: 1250, frequency: 'mensal', category: 'saude', nextDueDate: '2026-08-15', context: 'PF' },
    { id: 'r4', title: 'Internet Fibra Óptica', amount: 129.90, frequency: 'mensal', category: 'moradia', nextDueDate: '2026-08-18', context: 'PF' },
    { id: 'r5', title: 'Pró-labore Recebido da PJ', amount: 8500, frequency: 'mensal', category: 'salario_prolabore', nextDueDate: '2026-08-01', context: 'PF' },
  ]);

  const [filterStatus, setFilterStatus] = useState<'todas' | 'ativas' | 'pausadas'>('todas');

  const totalExpensesMonthly = recurrences.filter(r => r.category !== 'salario_prolabore').reduce((acc, r) => acc + r.amount, 0);
  const totalIncomeMonthly = recurrences.filter(r => r.category === 'salario_prolabore').reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Automação de Contas
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Recorrências & Assinaturas
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Organize contas fixas, assinaturas e receitas que se repetem automaticamente.
          </p>
        </div>

        <button
          onClick={onAddRecurrence}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Recorrência</span>
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Recorrências Ativas" value={recurrences.length} prefix="" subtitle="Contas e assinaturas" />
        <MetricCard title="Despesas Recorrentes" value={totalExpensesMonthly} isPrivacyMode={isPrivacyMode} subtitle="Comprometido por mês" trend="down" trendValue="-2%" />
        <MetricCard title="Receitas Recorrentes" value={totalIncomeMonthly} isPrivacyMode={isPrivacyMode} subtitle="Entradas mensais fixas" trend="up" trendValue="+10%" />
        <MetricCard title="Próximo Vencimento" value={2150} isPrivacyMode={isPrivacyMode} subtitle="Aluguel em 10/08" />
      </div>

      {/* Timeline de Próximos Vencimentos */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-950 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Linha do Tempo de Próximas Recorrências</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {recurrences.slice(0, 4).map(r => (
            <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">{r.nextDueDate}</span>
              <h4 className="font-bold text-xs text-slate-900 truncate">{r.title}</h4>
              <p className="text-sm font-black font-mono text-slate-950">R$ {r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de Recorrências */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-950">Lista Completa de Recorrências</h3>
          <div className="flex items-center space-x-2">
            <button onClick={() => setFilterStatus('todas')} className={`px-3 py-1 text-xs font-bold rounded-lg ${filterStatus === 'todas' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}>Todas</button>
            <button onClick={() => setFilterStatus('ativas')} className={`px-3 py-1 text-xs font-bold rounded-lg ${filterStatus === 'ativas' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}>Ativas</button>
          </div>
        </div>

        <div className="space-y-2">
          {recurrences.map(r => (
            <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{r.title}</h4>
                  <p className="text-[10px] text-slate-500">Frequência: {r.frequency} • Categoria: {r.category}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right font-mono">
                  <span className="font-bold text-slate-900 text-sm">R$ {r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="block text-[10px] text-slate-400">Próximo: {r.nextDueDate}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg" title="Pausar">
                    <Pause className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
