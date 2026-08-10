import { useState } from 'react';
import { MetricCard } from './aura/AuraCards';
import { Plus, Receipt, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  isPrivacyMode?: boolean;
  onAddBilling?: () => void;
}

export function PjBillingView({ isPrivacyMode = false, onAddBilling }: Props) {
  const invoices = [
    { id: 'inv1', client: 'TechCorp Brasil', description: 'Desenvolvimento Software Mês 08', amount: 15000, issueDate: '2026-08-01', dueDate: '2026-08-15', method: 'Pix / Boleto', status: 'em_aberto' },
    { id: 'inv2', client: 'Grupo Varejo Sul', description: 'Consultoria de Tecnologia Mês 08', amount: 12000, issueDate: '2026-08-01', dueDate: '2026-08-05', method: 'Transferência', status: 'vencida' },
    { id: 'inv3', client: 'Startup Innovate', description: 'Licenciamento Plataforma SaaS', amount: 4500, issueDate: '2026-08-02', dueDate: '2026-08-25', method: 'Pix', status: 'paga' },
  ];

  const totalBilled = invoices.reduce((acc, i) => acc + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paga').reduce((acc, i) => acc + i.amount, 0);
  const totalOpen = invoices.filter(i => i.status === 'em_aberto').reduce((acc, i) => acc + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'vencida').reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Cobranças & Emissões Gerenciais
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Faturamento Empresarial
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Organize cobranças, faturas e recebimentos da empresa.
          </p>
        </div>

        <button
          onClick={onAddBilling}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Faturamento</span>
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Faturado no Período" value={totalBilled} isPrivacyMode={isPrivacyMode} subtitle="Total emitido em cobranças" trend="up" trendValue="+15%" />
        <MetricCard title="Recebido no Caixa" value={totalPaid} isPrivacyMode={isPrivacyMode} subtitle="Liquidação efetuada" />
        <MetricCard title="Em Aberto" value={totalOpen} isPrivacyMode={isPrivacyMode} subtitle="Vencimento a ocorrer" />
        <MetricCard title="Vencido Inadimplente" value={totalOverdue} isPrivacyMode={isPrivacyMode} subtitle="Cobrança necessária" trend="down" trendValue="-3%" />
      </div>

      {/* Tabela de Faturas Gerenciais */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-sm text-white">Lista de Faturas Gerenciais</h3>
          <span className="text-xs text-slate-400 font-semibold">Gera recebíveis vinculados automaticamente</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Emissão</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-white">{inv.client}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">{inv.description}</td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.issueDate}</td>
                  <td className="py-3.5 px-4 text-slate-400">{inv.dueDate}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">{inv.method}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">R$ {inv.amount.toLocaleString('pt-BR')}</td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                      inv.status === 'paga' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      inv.status === 'vencida' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {inv.status}
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
