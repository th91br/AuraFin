import { useState } from 'react';
import { TransactionAnalytics } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Sliders } from 'lucide-react';

export function PjBreakEvenView({ isPrivacyMode = false, analytics }: { isPrivacyMode?: boolean; analytics?: TransactionAnalytics }) {
  const [costMultiplier, setCostMultiplier] = useState(1);
  const [revenueMultiplier, setRevenueMultiplier] = useState(1);
  const hasData = Boolean(analytics && analytics.transaction_count > 0);
  const revenue = Number(analytics?.total_receipts_cents || 0) / 100 * revenueMultiplier;
  const fixedCosts = Number(analytics?.operating_expenses_cents || 0) / 100 * costMultiplier;
  const directCosts = Number(analytics?.by_category.find(row => row.category === 'custo_direto')?.expenses_cents || 0) / 100;
  const contribution = Math.max(0, revenue - directCosts);
  const margin = revenue > 0 ? contribution / revenue : 0;
  const breakEven = margin > 0 ? fixedCosts / margin : 0;
  const safety = revenue - breakEven;
  return <div className="space-y-8 animate-in fade-in duration-200 text-slate-100"><div className="flex items-center justify-between border-b border-white/10 pb-4"><div><h1 className="text-2xl font-black text-white">Ponto de Equilíbrio</h1><p className="text-xs text-slate-400 mt-1">Cálculo derivado dos agregados financeiros da organização.</p></div><div className="flex gap-2"><button onClick={() => setCostMultiplier(value => value === 1 ? 1.1 : 1)} className="px-3 py-2 rounded-lg bg-slate-900 text-xs font-bold"><Sliders className="inline w-4 h-4 mr-1" />Custos {costMultiplier === 1 ? 'reais' : '+10%'}</button><button onClick={() => setRevenueMultiplier(value => value === 1 ? 0.9 : 1)} className="px-3 py-2 rounded-lg bg-slate-900 text-xs font-bold">Receita {revenueMultiplier === 1 ? 'real' : '-10%'}</button></div></div>{!hasData ? <div className="p-16 text-center bg-[#0F172A] rounded-2xl border border-dashed border-white/10 text-slate-400">Nenhum dado disponível</div> : <><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><MetricCard title="Ponto de Equilíbrio" value={breakEven} isPrivacyMode={isPrivacyMode} subtitle="Faturamento mínimo calculado" /><MetricCard title="Faturamento" value={revenue} isPrivacyMode={isPrivacyMode} subtitle="Receitas agregadas" /><MetricCard title="Margem de Segurança" value={safety} isPrivacyMode={isPrivacyMode} subtitle="Diferença calculada" /><MetricCard title="Custos Operacionais" value={fixedCosts} isPrivacyMode={isPrivacyMode} subtitle="Despesas agregadas" /></div><div className="p-6 bg-[#0F172A] rounded-2xl border border-white/5 text-sm text-slate-300">Margem de contribuição calculada: <strong className="text-white">{(margin * 100).toFixed(2)}%</strong>. Os cenários acima são simulações locais e não alteram dados reais.</div></>}</div>;
}
