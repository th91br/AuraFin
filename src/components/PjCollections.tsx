import { useMemo, useState } from 'react';
import { Defaulter } from '../types';
import { MetricCard } from './aura/AuraCards';
import { AlertTriangle, Copy, Check } from 'lucide-react';

interface Props {
  defaulters?: Defaulter[];
  isPrivacyMode?: boolean;
  onOpenBillingModal?: () => void;
}

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const templates = [
  'Olá [Cliente], identificamos um título vencido em [Data]. Segue a segunda via atualizada para regularização sem encargos.',
  'Prezado(a) [Cliente], gostaríamos de auxiliá-lo com a conciliação da sua fatura em aberto. Podemos gerar uma nova chave PIX?',
];

export function PjCollections({ defaulters = [], isPrivacyMode = false }: Props) {
  const [tab, setTab] = useState<'radar' | 'regua'>('radar');
  const [copied, setCopied] = useState<number | null>(null);
  const total = defaulters.reduce((sum, row) => sum + row.amount, 0);
  const avgDays = defaulters.length
    ? Math.round(defaulters.reduce((sum, row) => sum + row.daysLate, 0) / defaulters.length)
    : 0;

  const buckets = useMemo(
    () =>
      ['1-7', '8-15', '16-30', '31-60', '60+'].map((bucket) => ({
        bucket,
        rows: defaulters.filter((row) => row.agingBucket === bucket),
        amount: defaulters
          .filter((row) => row.agingBucket === bucket)
          .reduce((sum, row) => sum + row.amount, 0),
      })),
    [defaulters]
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Radar de Inadimplência &amp; Cobrança</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">Monitoramento de títulos em atraso, aging list e réguas de relacionamento.</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-white/10">
          <button
            onClick={() => setTab('radar')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'radar' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            Radar de Inadimplência
          </button>
          <button
            onClick={() => setTab('regua')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'regua' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
            }`}
          >
            Régua de Cobrança
          </button>
        </div>
      </div>

      {tab === 'radar' ? (
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <MetricCard title="Total em atraso" value={total} isPrivacyMode={isPrivacyMode} subtitle="Volume vencido" />
            <MetricCard title="Clientes inadimplentes" value={defaulters.length} prefix="" subtitle="Contas pendentes" />
            <MetricCard title="Atraso médio" value={avgDays} prefix="" subtitle="Dias de atraso" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard title="Maior Título" value={Math.max(0, ...defaulters.map((row) => row.amount))} isPrivacyMode={isPrivacyMode} subtitle="Maior concentração" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {buckets.map((item) => (
              <div key={item.bucket} className="p-4 rounded-xl bg-slate-900/90 border border-white/10">
                <span className="text-xs text-slate-300 block">{item.bucket} dias</span>
                <strong className="block text-white font-mono text-base mt-1">{money(item.amount)}</strong>
                <span className="text-[11px] text-slate-400 mt-0.5 block">{item.rows.length} título(s)</span>
              </div>
            ))}
          </div>

          {defaulters.length === 0 ? (
            <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10 text-slate-300">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">Nenhum cliente em atraso</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">Todos os títulos faturados estão em dia ou liquidados.</p>
            </div>
          ) : (
            <div className="bg-slate-900/90 rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 uppercase text-[10px] tracking-wider border-b border-white/10">
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Vencimento</th>
                      <th className="py-3 px-4">Dias em Atraso</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {defaulters.map((row) => (
                      <tr key={row.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">{row.client}</td>
                        <td className="py-3 px-4 text-slate-300">{row.dueDate}</td>
                        <td className="py-3 px-4 text-rose-300 font-bold font-mono">{row.daysLate} dias</td>
                        <td className="py-3 px-4 text-right font-mono text-white">{money(row.amount)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-500/30 text-[11px]">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template, index) => (
            <div key={template} className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
              <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                Modelo de Notificação #{index + 1}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-xl border border-white/5">
                {template}
              </p>
              <button
                onClick={() => {
                  void navigator.clipboard?.writeText(template);
                  setCopied(index);
                  window.setTimeout(() => setCopied(null), 1500);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                {copied === index ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copiado para a área de transferência</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copiar Mensagem</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
