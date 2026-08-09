import { useState } from 'react';
import { Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { HelpTooltip } from './ui/HelpTooltip';
import { FileText, ShieldAlert, Upload, CheckSquare, Download, Sparkles } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions?: Transaction[];
  assets?: any[];
  isPrivacyMode?: boolean;
}

export function PfTaxPlanning({ transactions = [], isPrivacyMode = false }: Props) {
  const [selectedYear, setSelectedYear] = useState('2026');

  const taxRecords = [
    { id: 't1', title: 'Consulta Médica Especialista', category: 'saude', amount: 450, date: '2026-03-10', docStatus: 'Comprovante Anexado' },
    { id: 't2', title: 'Plano de Saúde Familiar Amil', category: 'saude', amount: 1250, date: '2026-04-05', docStatus: 'Nota Fiscal Anexada' },
    { id: 't3', title: 'Mensalidade Faculdade / Pós', category: 'educacao', amount: 1800, date: '2026-05-10', docStatus: 'Recibo Anexado' },
    { id: 't4', title: 'Aporte Previdência PGBL', category: 'previdencia', amount: 5000, date: '2026-06-20', docStatus: 'Informe de Rendimentos' },
  ];

  const totalPotentiallyRelevant = taxRecords.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Organizador Fiscal
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Inteligência IRPF
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Organize despesas e documentos que podem ser relevantes para sua declaração anual.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
          >
            <option value="2026">Ano-Calendário 2026</option>
            <option value="2025">Ano-Calendário 2025</option>
            <option value="2024">Ano-Calendário 2024</option>
          </select>

          <button
            onClick={() => alert('Relatório CSV exportado!')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Dados</span>
          </button>
        </div>
      </div>

      {/* Responsible Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center space-x-3">
        <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0" />
        <p>
          <strong>Nota de Responsabilidade Fiscal:</strong> O AuraFin atua como organizador financeiro pessoal. A dedutibilidade e o enquadramento fiscal definitivo devem ser confirmados com seu contador ou no programa oficial do IRPF.
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Valor Potencial Relevante" value={totalPotentiallyRelevant} isPrivacyMode={isPrivacyMode} subtitle="Soma dos registros marcados" />
        <MetricCard title="Registros Organizados" value={taxRecords.length} prefix="" subtitle="Despesas de saúde, educação e PGBL" />
        <MetricCard title="Documentos Anexados" value={4} prefix="" subtitle="Notas fiscais e recibos ok" />
        <MetricCard title="Pendências de Anexo" value={0} prefix="" subtitle="Todos os recibos conferidos" />
      </div>

      {/* List of Tax Relevant Records */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-950">Despesas Organizadas para Análise IRPF</h3>

        <div className="space-y-3">
          {taxRecords.map(rec => (
            <div key={rec.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{rec.title}</h4>
                  <p className="text-[10px] text-slate-500 capitalize">Categoria: {rec.category} • Data: {rec.date}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">{rec.docStatus}</span>
                <span className="font-mono font-bold text-slate-950 text-sm">R$ {rec.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
