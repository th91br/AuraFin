import { useState } from 'react';
import { Account, TransactionAnalytics } from '../types';
import { MetricCard } from './aura/AuraCards';

export function PjRunwayView({ accounts = [], analytics, isPrivacyMode = false }: { accounts?: Account[]; analytics?: TransactionAnalytics; isPrivacyMode?: boolean }) {
  const [scenario, setScenario] = useState<'normal' | 'minus_25' | 'zero_revenue'>('normal');
  const cash = accounts.filter(account => account.context === 'PJ').reduce((sum, account) => sum + account.balance, 0);
  const baseBurn = Number(analytics?.total_expenses_cents || 0) / 100;
  const burn = scenario === 'minus_25' ? baseBurn * 1.1 : baseBurn;
  const months = burn > 0 ? cash / burn : 0;
  const days = Math.round(months * 30);
  const hasData = Boolean(analytics && analytics.transaction_count > 0) || accounts.some(account => account.context === 'PJ');
  return <div className="space-y-8 animate-in fade-in duration-200 text-slate-100"><div className="flex items-center justify-between border-b border-white/10 pb-4"><div><h1 className="text-2xl font-black text-white">Runway de Caixa</h1><p className="text-xs text-slate-400 mt-1">Cobertura calculada a partir das contas e despesas reais.</p></div><div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-white/10"><button onClick={() => setScenario('normal')} className={`px-3 py-2 text-xs font-bold rounded-lg ${scenario === 'normal' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>Normal</button><button onClick={() => setScenario('minus_25')} className={`px-3 py-2 text-xs font-bold rounded-lg ${scenario === 'minus_25' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>-25% receita</button><button onClick={() => setScenario('zero_revenue')} className={`px-3 py-2 text-xs font-bold rounded-lg ${scenario === 'zero_revenue' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>Receita zero</button></div></div>{!hasData ? <div className="p-16 text-center bg-[#0F172A] rounded-2xl border border-dashed border-white/10 text-slate-400">Nenhum dado disponível</div> : <><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><MetricCard title="Caixa disponível" value={cash} isPrivacyMode={isPrivacyMode} subtitle="Contas PJ" /><MetricCard title="Burn mensal" value={burn} isPrivacyMode={isPrivacyMode} subtitle="Despesas agregadas" /><MetricCard title="Runway em meses" value={months} prefix="" subtitle="Cobertura calculada" /><MetricCard title="Runway em dias" value={days} prefix="" subtitle="Conversão aproximada" /></div><div className="p-6 bg-[#0F172A] rounded-2xl border border-white/5 text-sm text-slate-300">A simulação é somente de leitura; nenhum valor é salvo localmente ou apresentado como dado real.</div></>}</div>;
}
