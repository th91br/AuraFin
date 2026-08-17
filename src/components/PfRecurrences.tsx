import { useState } from 'react';
import { RecurrenceItem } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, RefreshCw, Calendar, Trash2, Clock } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  recurrences?: RecurrenceItem[];
  isPrivacyMode?: boolean;
  onAddRecurrence: () => void;
  onDeleteRecurrence?: (id: string) => void;
}

export function PfRecurrences({
  recurrences = [],
  isPrivacyMode = false,
  onAddRecurrence,
  onDeleteRecurrence,
}: Props) {
  const [filterStatus, setFilterStatus] = useState<'todas' | 'mensal' | 'anual'>('todas');

  const pfRecurrences = recurrences.filter(r => r.context === 'PF');
  const filteredRecurrences = filterStatus === 'todas'
    ? pfRecurrences
    : pfRecurrences.filter(r => r.frequency === filterStatus);

  const totalExpensesMonthly = pfRecurrences
    .filter(r => r.category !== 'salario_prolabore' && r.category !== 'distribuicao_lucro')
    .reduce((acc, r) => acc + (r.frequency === 'anual' ? r.amount / 12 : r.amount), 0);

  const totalIncomeMonthly = pfRecurrences
    .filter(r => r.category === 'salario_prolabore' || r.category === 'distribuicao_lucro')
    .reduce((acc, r) => acc + r.amount, 0);

  // Next due date from real recurrences
  const sortedByDue = [...pfRecurrences].sort((a, b) => (a.nextDueDate || '').localeCompare(b.nextDueDate || ''));
  const nextItem = sortedByDue[0];

  if (pfRecurrences.length === 0) return <div className="space-y-8 animate-in fade-in duration-200"><div className="flex items-center justify-between border-b border-slate-200/60 pb-4"><div><h1 className="text-2xl font-black tracking-tight text-slate-950">Recorrências &amp; Assinaturas</h1><p className="text-xs text-slate-500 mt-1">Compromissos reais do usuário autenticado.</p></div><button onClick={onAddRecurrence} className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs"><Plus className="w-4 h-4" />Nova recorrência</button></div><div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300"><Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-slate-500">Nenhum dado disponível</p></div></div>;

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
            Organize despesas fixas, assinaturas de streaming e receitas recorrentes.
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
        <MetricCard title="Recorrências Ativas" value={pfRecurrences.length} prefix="" subtitle="Contas e assinaturas ativas" />
        <MetricCard title="Despesas Recorrentes" value={totalExpensesMonthly} isPrivacyMode={isPrivacyMode} subtitle="Comprometido por mês" />
        <MetricCard title="Receitas Recorrentes" value={totalIncomeMonthly} isPrivacyMode={isPrivacyMode} subtitle="Entradas mensais fixas" />
        <MetricCard title="Próximo Vencimento" value={nextItem?.amount || 0} isPrivacyMode={isPrivacyMode} subtitle={nextItem ? `${nextItem.title} em ${nextItem.nextDueDate}` : 'Sem contas agendadas'} />
      </div>

      {pfRecurrences.length > 0 ? (
        <>
          {/* Timeline de Próximos Vencimentos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-950 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Linha do Tempo de Próximos Vencimentos</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {sortedByDue.slice(0, 4).map(r => (
                <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">{r.nextDueDate}</span>
                  <h4 className="font-bold text-xs text-slate-900 truncate">{r.title}</h4>
                  <p className="text-sm font-black font-mono text-slate-950">
                    R$ {r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabela de Recorrências */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-950">Lista Completa de Recorrências</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilterStatus('todas')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterStatus === 'todas' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterStatus('mensal')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterStatus === 'mensal' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Mensais
                </button>
                <button
                  onClick={() => setFilterStatus('anual')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterStatus === 'anual' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Anuais
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredRecurrences.map(r => (
                <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{r.title}</h4>
                      <p className="text-[10px] text-slate-500 capitalize">Frequência: {r.frequency} • Categoria: {r.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-900 text-sm">
                        R$ {r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="block text-[10px] text-slate-400">Próximo: {r.nextDueDate}</span>
                    </div>

                    {onDeleteRecurrence && (
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir a recorrência ${r.title}?`)) {
                            onDeleteRecurrence(r.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <RefreshCw className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950">Nenhuma recorrência cadastrada</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Cadastre suas despesas fixas mensais (aluguel, condomínio, internet, assinaturas) para automatizar seu fluxo financeiro.
            </p>
          </div>
          <button
            onClick={onAddRecurrence}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeira Recorrência</span>
          </button>
        </div>
      )}

    </div>
  );
}
