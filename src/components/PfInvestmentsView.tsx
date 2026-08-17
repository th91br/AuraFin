import { useState } from 'react';
import { InvestmentItem } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, TrendingUp, PieChart, Landmark, ShieldCheck, ArrowUpRight, DollarSign, Trash2 } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  investments?: InvestmentItem[];
  isPrivacyMode?: boolean;
  onAddInvestment?: () => void;
  onDeleteInvestment?: (id: string) => void;
}

export function PfInvestmentsView({
  investments = [],
  isPrivacyMode = false,
  onAddInvestment,
  onDeleteInvestment,
}: Props) {
  const [selectedClass, setSelectedClass] = useState<string>('todas');

  const filteredInvestments = selectedClass === 'todas'
    ? investments
    : investments.filter(i => i.assetType.toLowerCase().includes(selectedClass.toLowerCase()));

  const totalInvested = investments.reduce((acc, i) => acc + (i.investedValue || i.totalValue || 0), 0);
  const totalCurrent = investments.reduce((acc, i) => acc + (i.totalValue || 0), 0);
  const totalProfit = totalCurrent - totalInvested;
  const yieldPctOverall = totalInvested > 0
    ? `${totalProfit >= 0 ? '+' : ''}${((totalProfit / totalInvested) * 100).toFixed(2)}%`
    : '+0.00%';

  if (investments.length === 0) return <div className="space-y-8 animate-in fade-in duration-200"><div className="flex items-center justify-between border-b border-slate-200/60 pb-4"><div><h1 className="text-2xl font-black tracking-tight text-slate-950">Investimentos &amp; Alocação</h1><p className="text-xs text-slate-500 mt-1">Posições reais do usuário autenticado.</p></div>{onAddInvestment && <button onClick={onAddInvestment} className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs"><Plus className="w-4 h-4" />Novo investimento</button>}</div><div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300"><TrendingUp className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-slate-500">Nenhum dado disponível</p></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Carteira & Performance
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Investimentos & Alocação
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Acompanhe a evolução da sua carteira, valor aplicado e rentabilidade consolidada.
          </p>
        </div>

        {onAddInvestment && (
          <button
            onClick={onAddInvestment}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Investimento</span>
          </button>
        )}
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Aplicado" value={totalInvested} isPrivacyMode={isPrivacyMode} subtitle="Custo de aquisição" />
        <MetricCard title="Valor Atual da Carteira" value={totalCurrent} isPrivacyMode={isPrivacyMode} subtitle="Posição atualizada" />
        <MetricCard title="Resultado Absoluto" value={totalProfit} isPrivacyMode={isPrivacyMode} subtitle="Lucro/Prejuízo da carteira" trend="up" trendValue={yieldPctOverall} />
        <MetricCard title="Rentabilidade Global" value={parseFloat(yieldPctOverall.replace('+', '').replace('%', '')) || 0} prefix="" subtitle="Retorno ponderado total" trend="up" trendValue={yieldPctOverall} />
      </div>

      {/* Main Table of Assets */}
      {investments.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-slate-950">Ativos & Posições da Carteira</h3>
            
            <div className="flex items-center space-x-2">
              {['todas', 'Renda Fixa', 'Ações', 'FIIs', 'Cripto'].map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedClass === cls ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Ativo</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4">Instituição</th>
                  <th className="py-3 px-4 text-right">Aplicado</th>
                  <th className="py-3 px-4 text-right">Valor Atual</th>
                  <th className="py-3 px-4 text-right">Retorno</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredInvestments.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{inv.name}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-500">{inv.assetType}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-500">{inv.institution}</td>
                    <td className="py-3.5 px-4 text-right text-slate-700">R$ {(inv.investedValue || inv.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-950">R$ {inv.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">{inv.yieldPct || '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      {onDeleteInvestment && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover o investimento "${inv.name}"?`)) {
                              onDeleteInvestment(inv.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950">Nenhum investimento registrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Cadastre suas aplicações de renda fixa, ações, fundos ou tesouro direto para acompanhar sua rentabilidade.
            </p>
          </div>
          {onAddInvestment && (
            <button
              onClick={onAddInvestment}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Investimento</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}
