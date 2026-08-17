import { useState } from 'react';
import { Transaction, TransactionQueryFilters } from '../types';
import { MetricCard } from './aura/AuraCards';
import { FileText, ShieldAlert, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  transactions?: Transaction[];
  assets?: any[];
  isPrivacyMode?: boolean;
  onExportCsv?: (filters: Pick<TransactionQueryFilters, 'startDate' | 'endDateExclusive'>) => Promise<string>;
}

export function PfTaxPlanning({ transactions = [], isPrivacyMode = false, onExportCsv }: Props) {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const pfTxs = transactions.filter(t => t.context === 'PF');

  if (pfTxs.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="border-b border-slate-200/60 pb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">Organizador Fiscal</span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">Inteligência IRPF</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Registre despesas reais para organizar a declaração.</p>
        </div>
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  // Filter real tax deductible expenses
  const taxRecords = pfTxs.filter(t => {
    const isYearMatch = t.date.startsWith(selectedYear);
    const isDeductibleCategory = t.category === 'saude' || 
                                t.category === 'educacao' || 
                                t.category === 'previdencia' || 
                                t.isTaxDeductiblePF ||
                                t.taxDeductionCategory !== undefined;
    return isYearMatch && isDeductibleCategory && t.type === 'expense';
  });

  const totalPotentiallyRelevant = taxRecords.reduce((acc, r) => acc + r.amount, 0);
  const healthDeductions = taxRecords.filter(r => r.category === 'saude' || r.taxDeductionCategory === 'saude').reduce((acc, r) => acc + r.amount, 0);
  const educationDeductions = taxRecords.filter(r => r.category === 'educacao' || r.taxDeductionCategory === 'educacao').reduce((acc, r) => acc + r.amount, 0);

  // Real CSV Export File Generation
  const handleExportCSV = async () => {
    if (onExportCsv) {
      const csvContent = await onExportCsv({ startDate: `${selectedYear}-01-01`, endDateExclusive: `${Number(selectedYear) + 1}-01-01` });
      if (!csvContent || csvContent.split('\n').length <= 1) { alert('Nenhum registro dedutível encontrado para o ano selecionado.'); return; }
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AuraFin_IRPF_${selectedYear}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (taxRecords.length === 0) {
      alert('Nenhum registro dedutível encontrado para o ano selecionado.');
      return;
    }

    const headers = ['Data', 'Descricao', 'Categoria', 'Valor (R$)', 'Comprovante'];
    const rows = taxRecords.map(t => [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.amount.toFixed(2),
      t.attachmentUrl ? 'Anexado' : 'Pendente'
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AuraFin_IRPF_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            Organize despesas médicas, instrução e previdência para a sua declaração anual.
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
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV IRPF</span>
          </button>
        </div>
      </div>

      {/* Responsible Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center space-x-3">
        <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0" />
        <p>
          <strong>Nota de Responsabilidade Fiscal:</strong> O AuraFin atua como organizador financeiro pessoal. A dedutibilidade e o enquadramento fiscal definitivo devem ser validados junto ao seu contador ou no programa oficial da Receita Federal.
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Dedutível Potencial" value={totalPotentiallyRelevant} isPrivacyMode={isPrivacyMode} subtitle="Saúde, Educação e PGBL" />
        <MetricCard title="Despesas com Saúde" value={healthDeductions} isPrivacyMode={isPrivacyMode} subtitle="Médicos, clínicas e planos" />
        <MetricCard title="Despesas com Educação" value={educationDeductions} isPrivacyMode={isPrivacyMode} subtitle="Instrução e cursos elegíveis" />
        <MetricCard title="Lançamentos Organizados" value={taxRecords.length} prefix="" subtitle={`Ano ${selectedYear}`} />
      </div>

      {/* List of Tax Relevant Records */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-950">Despesas Organizadas para o IRPF ({selectedYear})</h3>
          <span className="text-xs text-slate-500 font-mono">
            Total: R$ {totalPotentiallyRelevant.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {taxRecords.length > 0 ? (
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rec.attachmentUrl ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {rec.attachmentUrl ? 'Comprovante Anexado' : 'Sem Anexo'}
                  </span>
                  <span className="font-mono font-bold text-slate-950 text-sm">
                    R$ {rec.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Nenhuma despesa dedutível identificada em {selectedYear}</p>
            <p className="text-[11px] text-slate-500">
              Lançamentos nas categorias de Saúde, Educação ou com a marcação de dedutibilidade fiscal aparecerão aqui automaticamente.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
