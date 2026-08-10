import { useState } from 'react';
import { Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { CheckCircle2, Circle, Download, FileText, Lock, Calendar, HelpCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions?: Transaction[];
  isPrivacyMode?: boolean;
}

export function PjAccountantHubView({ transactions = [], isPrivacyMode = false }: Props) {
  const [closingMonth, setClosingMonth] = useState('08/2026');
  const [closingStatus, setClosingStatus] = useState<'em_aberto' | 'em_revisao' | 'pronto_contador'>('em_revisao');

  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Receitas & Faturas Faturadas Conferidas', done: true },
    { id: 'c2', label: 'Despesas Operacionais Classificadas', done: true },
    { id: 'c3', label: 'Contas Bancárias & Extratos Revisados', done: true },
    { id: 'c4', label: 'Fatura de Cartões de Crédito Conciliadas', done: true },
    { id: 'c5', label: 'Reembolsos de Despesas Sócio Resolvidos', done: false },
    { id: 'c6', label: 'Retiradas de Pró-labore Registradas', done: true },
    { id: 'c7', label: 'Guia DAS Simples Nacional Registrada', done: true },
    { id: 'c8', label: 'Comprovantes & Notas Fiscais Anexadas', done: false },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const completedCount = checklist.filter(c => c.done).length;
  const totalChecklist = checklist.length;
  const progressPct = Math.round((completedCount / totalChecklist) * 100);

  const handleExportPackage = (format: 'json' | 'csv') => {
    const dataStr = format === 'json' ? JSON.stringify(transactions, null, 2) : 'Data,Titulo,Valor,Categoria\n2026-08-01,Fatura,37000,receita_servico';
    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pacote_Contador_AuraFin_${closingMonth.replace('/', '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Fechamento Mensal & Central da Contabilidade
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1 flex items-center space-x-2">
            <span>Central do Contador</span>
            <div className="group relative cursor-pointer">
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 border border-white/10 text-[11px] text-slate-300 rounded-xl shadow-xl z-50 font-normal">
                Esta central permite conferir todos os lançamentos do mês, anexar documentos e exportar o pacote financeiro pronto para envio à contabilidade.
              </div>
            </div>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Organize documentos e pendências para tornar o fechamento mensal simples e seguro.
          </p>
        </div>

        {/* Action Export */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExportPackage('csv')}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 font-bold rounded-xl text-xs transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => handleExportPackage('json')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Gerar Pacote do Contador</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPIs Contador */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Receitas Faturadas no Mês" value={37000} isPrivacyMode={isPrivacyMode} subtitle="Competência 08/2026" />
        <MetricCard title="Despesas Registradas" value={14170} isPrivacyMode={isPrivacyMode} subtitle="Operacionais + Sócios" />
        <MetricCard title="Pendências no Fechamento" value={2} isPrivacyMode={isPrivacyMode} prefix="" subtitle="2 itens a revisar" />
        <MetricCard title="Status do Fechamento" value={progressPct} isPrivacyMode={isPrivacyMode} prefix="" subtitle={`${completedCount}/${totalChecklist} concluídos (${progressPct}%)`} />
      </div>

      {/* Checklist de Fechamento Gerencial */}
      <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 space-y-6 shadow-xs">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h3 className="font-bold text-sm text-white">Checklist do Fechamento Gerencial ({closingMonth})</h3>
            <p className="text-xs text-slate-400">Marque as etapas conferidas antes de disponibilizar à contabilidade.</p>
          </div>
          <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded border ${
            progressPct === 100 ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
          }`}>
            {progressPct === 100 ? 'Pronto para Contador' : 'Em Revisão'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklist.map(item => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                item.done ? 'bg-slate-900/90 border-emerald-500/30 text-white' : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <span className="text-xs font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
