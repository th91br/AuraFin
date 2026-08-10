import { useState } from 'react';
import { MetricCard } from './aura/AuraCards';
import { Plus, ShieldAlert, FileText, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  isPrivacyMode?: boolean;
}

export function PjTaxControlView({ isPrivacyMode = false }: Props) {
  const taxes = [
    { id: 't1', title: 'DAS — Simples Nacional Mês 07', competence: '07/2026', amount: 1110, dueDate: '2026-08-20', status: 'provisionado' },
    { id: 't2', title: 'GPS — INSS Pró-labore Sócios', competence: '07/2026', amount: 935, dueDate: '2026-08-20', status: 'provisionado' },
    { id: 't3', title: 'DAS — Simples Nacional Mês 06', competence: '06/2026', amount: 1080, dueDate: '2026-07-20', status: 'pago' },
  ];

  const totalProvisioned = taxes.filter(t => t.status === 'provisionado').reduce((acc, t) => acc + t.amount, 0);
  const totalPaid = taxes.filter(t => t.status === 'pago').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
              Controle Gerencial Tributário
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/10">
              Controle Gerencial (Não Fiscal)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Controle Gerencial de Impostos
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Acompanhe valores previstos, provisionados, pagos e vencimentos registrados.
          </p>
        </div>

        <button
          onClick={() => alert('Formulário de registro de imposto')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Imposto / Guia</span>
        </button>
      </div>

      {/* Top 4 KPIs Impostos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Impostos Provisionados" value={totalProvisioned} isPrivacyMode={isPrivacyMode} subtitle="A pagar neste mês" />
        <MetricCard title="Impostos Pagos no Mês" value={totalPaid} isPrivacyMode={isPrivacyMode} subtitle="Liquidados em caixa" />
        <MetricCard title="Tributos Vencidos" value={0} isPrivacyMode={isPrivacyMode} subtitle="Nenhuma pendência atrasada" trend="up" trendValue="100% em dia" />
        <MetricCard title="Próximo Vencimento" value={1110} isPrivacyMode={isPrivacyMode} subtitle="DAS Simples (20/08)" />
      </div>

      {/* Disclaimer de Responsabilidade Gerencial */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-3">
          <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0" />
          <p>
            <strong>Aviso de Engenharia Financeira:</strong> O AuraFin é uma ferramenta de gestão financeira gerencial. A apuração tributária oficial e emissão de guias governamentais continuam sob responsabilidade da sua contabilidade.
          </p>
        </div>
      </div>

      {/* Tabela de Guias & Impostos */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-sm text-white">Guias & Impostos Registrados</h3>
          <span className="text-xs text-slate-400 font-semibold">Provisões vs Liquidação em Caixa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Tributo / Descrição</th>
                <th className="py-3 px-4">Competência</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {taxes.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-white">{t.title}</td>
                  <td className="py-3.5 px-4 text-slate-400">{t.competence}</td>
                  <td className="py-3.5 px-4 text-slate-400">{t.dueDate}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">R$ {t.amount.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                      t.status === 'pago' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {t.status}
                    </span>
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
