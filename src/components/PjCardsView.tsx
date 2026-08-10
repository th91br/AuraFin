import { useState } from 'react';
import { CreditCard } from '../types';
import { MetricCard, VisualPaymentCard } from './aura/AuraCards';
import { Plus, CreditCard as CreditCardIcon, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  isPrivacyMode?: boolean;
  onAddCard?: () => void;
  onPayInvoice?: (cardId: string, amount: number) => void;
}

export function PjCardsView({ isPrivacyMode = false, onAddCard, onPayInvoice }: Props) {
  const [pjCards, setPjCards] = useState<CreditCard[]>([
    { id: 'c_pj1', name: 'BTG Pactual Corporate Black', institution: 'BTG Pactual', limitTotal: 50000, limitUsed: 12400, currentInvoice: 8500, closingDay: 15, dueDay: 23, context: 'PJ' },
    { id: 'c_pj2', name: 'C6 Bank Business Platinum', institution: 'C6 Bank', limitTotal: 30000, limitUsed: 4200, currentInvoice: 2100, closingDay: 20, dueDay: 28, context: 'PJ' },
  ]);

  const totalLimit = pjCards.reduce((acc, c) => acc + c.limitTotal, 0);
  const totalUsed = pjCards.reduce((acc, c) => acc + c.limitUsed, 0);
  const availableLimit = totalLimit - totalUsed;
  const currentInvoicesTotal = pjCards.reduce((acc, c) => acc + c.currentInvoice, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Cartões Corporativos
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Cartões da Empresa
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Acompanhe limites, faturas e despesas realizadas nos cartões corporativos.
          </p>
        </div>

        <button
          onClick={onAddCard ? onAddCard : () => alert('Formulário de novo cartão PJ')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cartão Empresarial</span>
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Limite Total Corporativo" value={totalLimit} isPrivacyMode={isPrivacyMode} subtitle="Crédito concedido" />
        <MetricCard title="Limite Utilizado" value={totalUsed} isPrivacyMode={isPrivacyMode} subtitle="Comprometido nas faturas" trend="down" trendValue="-3%" />
        <MetricCard title="Limite Disponível Livre" value={availableLimit} isPrivacyMode={isPrivacyMode} subtitle="Livre para novas compras" trend="up" trendValue="+8%" />
        <MetricCard title="Faturas Atuais (Soma)" value={currentInvoicesTotal} isPrivacyMode={isPrivacyMode} subtitle="Fechamento próximo" />
      </div>

      {/* Cards Visuais & Gestão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pjCards.map(card => {
          const cardAvailable = card.limitTotal - card.limitUsed;
          const pctUsed = Math.min(100, Math.round((card.limitUsed / (card.limitTotal || 1)) * 100));

          return (
            <div key={card.id} className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-white/10">
                    {card.institution}
                  </span>
                  <h3 className="font-bold text-base text-white mt-1">{card.name}</h3>
                </div>
              </div>

              <VisualPaymentCard
                cardName={card.name}
                cardNumberMasked="•••• •••• •••• 8842"
                balance={cardAvailable}
                dueDate={`${card.dueDay}/28`}
              />

              <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs space-y-2 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Fatura Atual ({card.closingDay}/28):</span>
                  <span className="font-bold text-white">R$ {card.currentInvoice.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Limite Disponível:</span>
                  <span className="font-bold text-emerald-400">R$ {cardAvailable.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Uso do Limite ({pctUsed}%):</span>
                  <span>R$ {card.limitUsed.toLocaleString('pt-BR')} de R$ {card.limitTotal.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pctUsed}%` }} />
                </div>
              </div>

              <button
                onClick={() => onPayInvoice ? onPayInvoice(card.id, card.currentInvoice) : alert(`Pagamento de fatura de R$ ${card.currentInvoice} efetuado!`)}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Pagar Fatura do Cartão (Débito em Caixa)
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
