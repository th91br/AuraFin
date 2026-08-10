import { useState } from 'react';
import { CreditCard as CreditCardType, Transaction } from '../types';
import { MetricCard, VisualPaymentCard } from './aura/AuraCards';
import { Plus, CreditCard, Calendar, AlertCircle, ChevronRight, PieChart, Layers } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  creditCards: CreditCardType[];
  transactions: Transaction[];
  isPrivacyMode?: boolean;
  onAddCard: () => void;
}

export function PfCards({
  creditCards,
  transactions,
  isPrivacyMode = false,
  onAddCard,
}: Props) {
  const [selectedCardId, setSelectedCardId] = useState<string>(creditCards[0]?.id || 'c1');
  const [activeTab, setActiveTab] = useState<'resumo' | 'transacoes' | 'parcelamentos' | 'faturas'>('resumo');

  const pfCards = creditCards.filter(c => c.context === 'PF');

  const totalLimit = pfCards.reduce((acc, c) => acc + c.limitTotal, 0) || 35000;
  const totalUsed = pfCards.reduce((acc, c) => acc + c.limitUsed, 0) || 6450;
  const totalAvailable = totalLimit - totalUsed;

  const selectedCard = pfCards.find(c => c.id === selectedCardId) || pfCards[0];

  // Compras parceladas simuladas
  const installments = [
    { title: 'Notebook Macbook Air M2', current: 3, total: 10, amount: 450, remaining: 7 },
    { title: 'Passagens Aéreas Férias', current: 2, total: 6, amount: 380, remaining: 4 },
    { title: 'Curso Desenvolvimento Web', current: 5, total: 5, amount: 190, remaining: 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">
            Gestão de Crédito
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
            Cartões de Crédito & Faturas
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Acompanhe limites comprometidos, faturas abertas, compras e parcelamentos futuros.
          </p>
        </div>

        <button
          onClick={onAddCard}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Cartão</span>
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Limite Total" value={totalLimit} isPrivacyMode={isPrivacyMode} subtitle="Soma de todos os cartões" />
        <MetricCard title="Limite Utilizado" value={totalUsed} isPrivacyMode={isPrivacyMode} subtitle="Faturas em aberto + Parcelas" trend="down" trendValue="-3%" />
        <MetricCard title="Limite Disponível" value={totalAvailable} isPrivacyMode={isPrivacyMode} subtitle="Livre para novas compras" trend="up" trendValue="+8%" />
        <MetricCard title="Faturas Atuais" value={totalUsed} isPrivacyMode={isPrivacyMode} subtitle="Vencimentos do mês" />
      </div>

      {/* Grid de Cartões Visuais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pfCards.map(card => {
          const usedPct = Math.min(100, Math.round(((card.limitUsed || 2453) / (card.limitTotal || 15000)) * 100));
          const isSelected = selectedCardId === card.id;

          return (
            <div
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                isSelected
                  ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <VisualPaymentCard
                cardName={card.name}
                cardNumberMasked="•••• •••• •••• 4554"
                balance={card.currentInvoice || 2453}
                dueDate={`${card.dueDay || 28}/28`}
              />

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[11px] font-sans font-medium text-slate-500">
                  <span>Utilização do Limite ({usedPct}%)</span>
                  <span className="font-mono font-bold text-slate-900">R$ {(card.limitUsed || 2453).toLocaleString('pt-BR')} / R$ {(card.limitTotal || 15000).toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${usedPct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Detail Visão com Abas */}
      {selectedCard && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-950">{selectedCard.name}</h3>
              <p className="text-xs text-slate-500">{selectedCard.institution} • Fechamento Dia {selectedCard.closingDay || 20} • Vencimento Dia {selectedCard.dueDay || 28}</p>
            </div>

            {/* Abas */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('resumo')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  activeTab === 'resumo' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resumo
              </button>
              <button
                onClick={() => setActiveTab('transacoes')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  activeTab === 'transacoes' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Transações
              </button>
              <button
                onClick={() => setActiveTab('parcelamentos')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  activeTab === 'parcelamentos' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Parcelamentos
              </button>
              <button
                onClick={() => setActiveTab('faturas')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  activeTab === 'faturas' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faturas
              </button>
            </div>
          </div>

          {/* Conteúdo das Abas */}
          {activeTab === 'resumo' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Fatura Atual</span>
                <p className="text-2xl font-black font-mono text-slate-950">
                  <PrivacyText value={selectedCard.currentInvoice || 2453} isPrivacyMode={isPrivacyMode} />
                </p>
                <span className="text-[11px] text-emerald-700 font-semibold">Fechamento em 12 dias</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Limite Livre</span>
                <p className="text-2xl font-black font-mono text-emerald-600">
                  <PrivacyText value={(selectedCard.limitTotal || 15000) - (selectedCard.limitUsed || 2453)} isPrivacyMode={isPrivacyMode} />
                </p>
                <span className="text-[11px] text-slate-500 font-semibold">
                  De <PrivacyText value={selectedCard.limitTotal || 15000} isPrivacyMode={isPrivacyMode} />
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Parcelamentos Ativos</span>
                <p className="text-2xl font-black font-mono text-slate-950">3 Compras</p>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Comprometendo <PrivacyText value={1020} isPrivacyMode={isPrivacyMode} />/mês
                </span>
              </div>
            </div>
          )}

          {activeTab === 'parcelamentos' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Compras Parceladas Ativas</h4>
              {installments.map((inst, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900">{inst.title}</h5>
                    <p className="text-[11px] text-slate-500">Parcela {inst.current} de {inst.total} • Restam {inst.remaining} parcelas</p>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900">R$ {inst.amount.toFixed(2)}/mês</span>
                    <span className="block text-[10px] text-slate-400">Total R$ {(inst.amount * inst.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'transacoes' && (
            <div className="space-y-2">
              {transactions.filter(t => t.context === 'PF').slice(0, 4).map(tx => (
                <div key={tx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{tx.title}</p>
                    <p className="text-[10px] text-slate-500">{tx.date} • {tx.category}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'faturas' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                <span className="font-bold text-emerald-900 block">Fatura Atual (Outubro)</span>
                <span className="text-lg font-black block">R$ 2.453,00</span>
                <span className="text-[10px] text-emerald-700 block">Status: Aberta (Vencimento 28/10)</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Fatura Próxima (Novembro)</span>
                <span className="text-lg font-black block">R$ 1.020,00</span>
                <span className="text-[10px] text-slate-500 block">Status: Prevista (Vencimento 28/11)</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Fatura Anterior (Setembro)</span>
                <span className="text-lg font-black block">R$ 3.120,00</span>
                <span className="text-[10px] text-emerald-700 block">Status: Paga integralmente</span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
