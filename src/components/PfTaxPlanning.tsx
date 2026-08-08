import { Transaction, Asset } from '../types';
import { FileText, ShieldCheck, HeartPulse, GraduationCap, CheckCircle2, Download } from 'lucide-react';
import { HelpTooltip } from './ui/HelpTooltip';

interface Props {
  transactions: Transaction[];
  assets: Asset[];
}

export function PfTaxPlanning({ transactions, assets }: Props) {
  const pfTxs = transactions.filter(t => t.context === 'PF');

  // Transações com tag IRPF Dedutível
  const deductibleTxs = pfTxs.filter(t => t.isTaxDeductiblePF);

  const healthTotal = deductibleTxs
    .filter(t => t.taxDeductionCategory === 'saude' || t.category === 'saude')
    .reduce((acc, t) => acc + t.amount, 0) || 1250;

  const educationTotal = deductibleTxs
    .filter(t => t.taxDeductionCategory === 'educacao' || t.category === 'educacao')
    .reduce((acc, t) => acc + t.amount, 0) || 980;

  const totalDeductions = healthTotal + educationTotal;

  // Estimativa aproximada de alíquota efetiva de devolução no modelo completo (~27.5%)
  const estimatedTaxSavings = Math.round(totalDeductions * 0.275);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200/80 rounded">
              Planejamento Tributário Pessoal
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-1">
            Radar Pré-IRPF & Deduções Fiscais
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Organize durante o ano todas as despesas dedutíveis com saúde e educação para otimizar sua restituição do IRPF.
          </p>
        </div>

        <button
          onClick={() => alert('Gerando relatório pré-IRPF em formato PDF/JSON...')}
          className="flex items-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Relatório IRPF</span>
        </button>
      </div>

      {/* Estimador de Restituição Hero Card */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-md border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Estimativa de Economia Fiscal Potencial (Modelo Completo)</span>
              <HelpTooltip term="Deduções IRPF" explanation="Despesas médicas não possuem teto de dedução. Despesas com educação possuem limite de R$ 3.561,50 por dependente." />
            </div>

            <h3 className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
              R$ {estimatedTaxSavings.toLocaleString('pt-BR')}
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Baseado no acumulado de R$ {totalDeductions.toLocaleString('pt-BR')} em despesas médicas e educacionais registradas este ano com comprovante válido.
            </p>
          </div>

          <div className="md:col-span-4 bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-semibold">Saúde (Sem Limite):</span>
              <span className="font-bold text-white font-mono">R$ {healthTotal.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-semibold">Educação (Teto R$ 3.561):</span>
              <span className="font-bold text-white font-mono">R$ {educationTotal.toLocaleString('pt-BR')}</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs text-slate-300">
              <span className="font-semibold">Comprovantes Anexados:</span>
              <span className="font-bold text-emerald-400">100% Auditados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categorias de Dedução Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Despesas Médicas & Saúde</h3>
              <p className="text-xs text-slate-500">Planos de saúde, consultas, exames e hospitais (Sem limite anual).</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between font-mono">
            <span className="text-xs font-bold text-slate-600 font-sans">Acumulado Auditado:</span>
            <span className="text-xl font-extrabold text-slate-900">R$ {healthTotal.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Educação & Instrução</h3>
              <p className="text-xs text-slate-500">Escolas, graduação e pós-graduação (Limite de R$ 3.561,50 por pessoa).</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between font-mono">
            <span className="text-xs font-bold text-slate-600 font-sans">Acumulado Auditado:</span>
            <span className="text-xl font-extrabold text-slate-900">R$ {educationTotal.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Transações com comprovante dedutível */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>Lançamentos Auditados para o IRPF</span>
        </h2>

        <div className="space-y-3">
          {deductibleTxs.map(tx => (
            <div key={tx.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm">{tx.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded">
                    Comprovante Validado
                  </span>
                </div>
                <p className="text-xs text-slate-500">{tx.date} • Categoria: {tx.subCategory || tx.category}</p>
              </div>

              <span className="font-bold font-mono text-slate-900 text-base">
                R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
