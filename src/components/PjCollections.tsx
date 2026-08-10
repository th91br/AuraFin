import { useState } from 'react';
import { Defaulter } from '../types';
import { MetricCard } from './aura/AuraCards';
import { 
  AlertTriangle, 
  Clock, 
  Send, 
  MessageSquare, 
  Copy, 
  Check, 
  Filter, 
  Search, 
  ShieldAlert, 
  FileCheck2, 
  DollarSign, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  defaulters?: Defaulter[];
  isPrivacyMode?: boolean;
  onOpenBillingModal?: () => void;
}

export function PjCollections({ defaulters = [], isPrivacyMode = false, onOpenBillingModal }: Props) {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [selectedDefaulter, setSelectedDefaulter] = useState<any | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'radar' | 'regua' | 'acordos'>('radar');

  const mockDefaulters = defaulters.length > 0 ? defaulters : [
    { id: 'd1', client: 'Empresa Alfa Ltda', amount: 4850, dueDate: '2026-07-15', daysLate: 26, contactEmail: 'financeiro@alfa.com.br', agingBucket: '16-30' as const, status: 'pendente' as const },
    { id: 'd2', client: 'Studio Beta Design', amount: 2300, dueDate: '2026-08-01', daysLate: 9, contactEmail: 'contato@betadesign.com', agingBucket: '8-15' as const, status: 'notificado' as const },
    { id: 'd3', client: 'Gama Soluções Tech', amount: 8900, dueDate: '2026-06-10', daysLate: 61, contactEmail: 'cobranca@gama.com.br', agingBucket: '60+' as const, status: 'em_negociacao' as const },
  ];

  const totalOverdue = mockDefaulters.reduce((acc, d) => acc + d.amount, 0);
  const clientsInLate = mockDefaulters.length;
  const avgLateDays = Math.round(mockDefaulters.reduce((acc, d) => acc + d.daysLate, 0) / (clientsInLate || 1));
  const maxOverdue = Math.max(...mockDefaulters.map(d => d.amount), 0);
  const delinquencyRate = 4.2; // % calculada

  // Templates de Régua de Cobrança
  const templates = [
    { id: 'd-3', title: 'Lembrete Preventivo (D-3)', trigger: '3 dias antes do vencimento', text: 'Olá [Cliente], passando para lembrar que a fatura de R$ [Valor] com vencimento em [Data] está disponível para pagamento. Dúvidas, estamos à disposição!' },
    { id: 'd0', title: 'Dia do Vencimento (D0)', trigger: 'No dia do vencimento', text: 'Olá [Cliente], hoje vence sua fatura referente a [Serviço] no valor de R$ [Valor]. Utilize a chave Pix ou código de barras no boleto para quitação.' },
    { id: 'd+3', title: 'Aviso Amigável (D+3)', trigger: '3 dias de atraso', text: 'Olá [Cliente], identificamos que a fatura de R$ [Valor] vencida em [Data] ainda consta em aberto. Caso já tenha efetuado o pagamento, por favor desconsidere.' },
    { id: 'd+15', title: 'Notificação Formal (D+15)', trigger: '15 dias de atraso', text: 'Prezado(a) [Cliente], solicitamos a regularização do débito de R$ [Valor] pendente desde [Data]. Entre em contato com nosso financeiro para renegociação.' },
  ];

  const handleCopyText = (templateText: string, id: string) => {
    navigator.clipboard.writeText(templateText);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-800/80 rounded">
            Gestão de Inadimplência & Cobrança
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Radar de Inadimplência
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Acompanhe valores vencidos, priorize cobranças ativas e organize sua régua de comunicação.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-white/10">
          <button onClick={() => setActiveTab('radar')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${activeTab === 'radar' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Radar & Aging</button>
          <button onClick={() => setActiveTab('regua')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${activeTab === 'regua' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Régua de Cobrança</button>
        </div>
      </div>

      {/* Top 5 KPIs Inadimplência */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Total Vencido" value={totalOverdue} isPrivacyMode={isPrivacyMode} subtitle="Valores pendentes de entrada" trend="down" trendValue="+R$ 2.300" />
        <MetricCard title="Clientes em Atraso" value={clientsInLate} isPrivacyMode={isPrivacyMode} subtitle="Devedores em carteira" />
        <MetricCard title="Atraso Médio" value={avgLateDays} isPrivacyMode={isPrivacyMode} prefix="" subtitle="Dias médios de atraso" />
        <MetricCard title="Maior Valor Vencido" value={maxOverdue} isPrivacyMode={isPrivacyMode} subtitle="Gama Soluções Tech" />
        <MetricCard title="Taxa Inadimplência" value={delinquencyRate} isPrivacyMode={isPrivacyMode} prefix="" subtitle="4.2% do faturamento" />
      </div>

      {activeTab === 'radar' ? (
        <>
          {/* Aging de Inadimplência (Distribuição em Faixas) */}
          <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-white">Distribuição por Tempo de Atraso (Aging)</h3>
                <p className="text-xs text-slate-400">Classificação determinística dos recebíveis por idade de vencimento.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: '1–7 Dias', range: '1-7', amount: 0, count: 0, color: 'border-cyan-500/30' },
                { label: '8–15 Dias', range: '8-15', amount: 2300, count: 1, color: 'border-amber-500/40' },
                { label: '16–30 Dias', range: '16-30', amount: 4850, count: 1, color: 'border-orange-500/40' },
                { label: '31–60 Dias', range: '31-60', amount: 0, count: 0, color: 'border-rose-500/30' },
                { label: '60+ Dias', range: '60+', amount: 8900, count: 1, color: 'border-rose-600' },
              ].map(item => (
                <div key={item.range} className={`p-4 rounded-xl bg-slate-900 border ${item.color} space-y-1.5 font-mono text-xs`}>
                  <span className="text-[10px] font-sans font-extrabold uppercase text-slate-400 block">{item.label}</span>
                  <span className="font-bold text-white text-sm block">R$ {item.amount.toLocaleString('pt-BR')}</span>
                  <span className="text-[11px] text-slate-500 font-sans block">{item.count} título(s)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabela de Clientes em Atraso */}
          <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-sm text-white">Títulos Vencidos & Prioridade de Cobrança</h3>
              <span className="text-xs text-slate-400 font-semibold">Priorização Real por Atraso & Valor</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4 text-center">Dias Atraso</th>
                    <th className="py-3 px-4 text-right">Valor Vencido</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {mockDefaulters.map(d => (
                    <tr key={d.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-bold text-white">{d.client}</td>
                      <td className="py-3.5 px-4 text-slate-400">{d.dueDate}</td>
                      <td className="py-3.5 px-4 text-center text-rose-400 font-bold">{d.daysLate} dias</td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-300">R$ {d.amount.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                          d.status === 'em_negociacao' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {d.status === 'em_negociacao' ? 'Em Negociação' : 'Notificado'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={() => setSelectedDefaulter(d)}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition-all"
                        >
                          Cobrar via Régua
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Régua de Cobrança & Templates */
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-xs text-slate-300">
            <strong>Transparência de Comunicação:</strong> Utilize os templates oficiais abaixo para copiar o texto com o valor e a data corretas e enviar via WhatsApp ou E-mail.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map(t => (
              <div key={t.id} className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      Gatilho: {t.trigger}
                    </span>
                    <h3 className="font-bold text-base text-white mt-2">{t.title}</h3>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-white/5 font-sans text-xs text-slate-300 leading-relaxed">
                  "{t.text}"
                </div>

                <button
                  onClick={() => handleCopyText(t.text, t.id)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center space-x-2 transition-all"
                >
                  {copiedTemplate === t.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedTemplate === t.id ? 'Mensagem Copiada!' : 'Copiar Template de Cobrança'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
