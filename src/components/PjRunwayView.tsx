import { useState } from 'react';
import { Account, TransactionAnalytics } from '../types';
import { MetricCard } from './aura/AuraCards';

interface Props {
  accounts?: Account[];
  analytics?: TransactionAnalytics;
  isPrivacyMode?: boolean;
}

export function PjRunwayView({
  accounts = [],
  analytics,
  isPrivacyMode = false,
}: Props) {
  const [scenario, setScenario] = useState<'normal' | 'minus_25' | 'zero_revenue'>('normal');

  const cash = accounts
    .filter((account) => account.context === 'PJ')
    .reduce((sum, account) => sum + account.balance, 0);

  const baseBurn = Number(analytics?.total_expenses_cents || 0) / 100;
  const burn = scenario === 'minus_25' ? baseBurn * 1.1 : baseBurn;
  const months = burn > 0 ? cash / burn : 0;
  const days = Math.round(months * 30);

  const hasData = Boolean(analytics && analytics.transaction_count > 0) || accounts.some((account) => account.context === 'PJ');

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Runway &amp; Sobrevivência de Caixa</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">Estimativa de tempo em que a operação se mantém com o caixa atual e ritmo de queima (burn rate).</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-white/10">
          <button
            onClick={() => setScenario('normal')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              scenario === 'normal' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setScenario('minus_25')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              scenario === 'minus_25' ? 'bg-amber-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            -25% Receita
          </button>
          <button
            onClick={() => setScenario('zero_revenue')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              scenario === 'zero_revenue' ? 'bg-rose-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            Receita Zero
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10 text-slate-300">
          Nenhum dado financeiro disponível para cálculo de runway.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <MetricCard title="Caixa Disponível" value={cash} isPrivacyMode={isPrivacyMode} subtitle="Saldo consolidado PJ" />
            <MetricCard title="Burn Rate Médio" value={burn} isPrivacyMode={isPrivacyMode} subtitle="Saídas mensais estimadas" />
            <MetricCard title="Autonomia Estimada" value={days} prefix="" subtitle={`${months.toFixed(1)} meses restantes`} />
          </div>

          <div className="p-6 bg-slate-900/90 rounded-2xl border border-white/10 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block text-sm mb-1">Como este indicador funciona:</strong>
            O cálculo divide o saldo total das contas PJ pela média mensal de saídas operacionais. As alterações de cenário simulam o impacto de oscilações de faturamento na longevidade da empresa sem alterar dados persistidos.
          </div>
        </div>
      )}
    </div>
  );
}
