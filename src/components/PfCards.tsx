import { useState } from 'react';
import { CreditCard as CreditCardType, Transaction } from '../types';
import { MetricCard, VisualPaymentCard } from './aura/AuraCards';
import { Plus, CreditCard, Calendar, AlertCircle, ChevronRight, PieChart, Layers, Trash2 } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  creditCards: CreditCardType[];
  transactions: Transaction[];
  isPrivacyMode?: boolean;
  onAddCard: () => void;
  onDeleteCard?: (id: string) => void;
}

export function PfCards({
  creditCards,
  transactions,
  isPrivacyMode = false,
  onAddCard,
  onDeleteCard,
}: Props) {
  const pfCards = creditCards.filter(c => c.context === 'PF');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(pfCards[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'resumo' | 'transacoes' | 'faturas'>('resumo');

  const totalLimit = pfCards.reduce((acc, c) => acc + (c.limitTotal || 0), 0);
  const totalUsed = pfCards.reduce((acc, c) => acc + (c.limitUsed || 0), 0);
  const totalAvailable = Math.max(0, totalLimit - totalUsed);
  const totalInvoices = pfCards.reduce((acc, c) => acc + (c.currentInvoice || c.limitUsed || 0), 0);

  const selectedCard = pfCards.find(c => c.id === selectedCardId) || pfCards[0];
  const selectedCardTransactions = selectedCard
    ? transactions.filter(t => t.context === 'PF' && (t.creditCardId === selectedCard.id || t.cardId === selectedCard.id))
    : [];

  if (pfCards.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded">Gestão de Crédito</span>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">Cartões de Crédito &amp; Faturas</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Cartões reais do usuário autenticado.</p>
          </div>
          <button onClick={onAddCard} className="flex items-center space-x-2 px-4 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs shadow-xs">
            <Plus className="w-4 h-4" />
            <span>Adicionar Cartão</span>
          </button>
        </div>
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <CreditCard className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

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
            Acompanhe limites comprometidos, faturas abertas e compras dos seus cartões.
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
        <MetricCard title="Limite Utilizado" value={totalUsed} isPrivacyMode={isPrivacyMode} subtitle="Faturas e limites em uso" />
        <MetricCard title="Limite Disponível" value={totalAvailable} isPrivacyMode={isPrivacyMode} subtitle="Livre para novas compras" />
        <MetricCard title="Faturas Consolidadas" value={totalInvoices} isPrivacyMode={isPrivacyMode} subtitle="Vencimento no mês" />
      </div>

      {pfCards.length > 0 ? (
        <>
          {/* Grid de Cartões Visuais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pfCards.map(card => {
              const usedPct = card.limitTotal > 0 ? Math.min(100, Math.round(((card.limitUsed || 0) / card.limitTotal) * 100)) : 0;
              const isSelected = (selectedCard?.id === card.id);

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
                    cardNumberMasked={`•••• •••• •••• ${card.lastFourDigits || '—'}`}
                    balance={Math.max(0, (card.limitTotal || 0) - (card.limitUsed || 0))}
                    dueDate={card.dueDay ? String(card.dueDay) : '—'}
                    brand={card.brand}
                    isPrivacyMode={isPrivacyMode}
                  />

                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-[11px] font-sans font-medium text-slate-500">
                      <span>Utilização do Limite ({usedPct}%)</span>
                      <span className="font-mono font-bold text-slate-900">
                        R$ {(card.limitUsed || 0).toLocaleString('pt-BR')} / R$ {(card.limitTotal || 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${usedPct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card Detail Visão com Abas */}
          {selectedCard && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-950">{selectedCard.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedCard.institution} • Fechamento {selectedCard.closingDay ? `Dia ${selectedCard.closingDay}` : 'não informado'} • Vencimento {selectedCard.dueDay ? `Dia ${selectedCard.dueDay}` : 'não informado'}
                  </p>
                </div>

                {/* Abas & Exclusão */}
                <div className="flex items-center space-x-3">
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
                      Transações ({selectedCardTransactions.length})
                    </button>
                  </div>

                  {onDeleteCard && (
                    <button
                      onClick={() => {
                        if (confirm(`Deseja remover o cartão ${selectedCard.name}?`)) {
                          onDeleteCard(selectedCard.id);
                        }
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
                      title="Excluir Cartão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Conteúdo das Abas */}
              {activeTab === 'resumo' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Fatura Atual</span>
                    <p className="text-2xl font-black font-mono text-slate-950">
                      <PrivacyText value={selectedCard.currentInvoice || selectedCard.limitUsed || 0} isPrivacyMode={isPrivacyMode} />
                    </p>
                    <span className="text-[11px] text-indigo-700 font-semibold">Fechamento {selectedCard.closingDay ? `Dia ${selectedCard.closingDay}` : 'não informado'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Limite Disponível</span>
                    <p className="text-2xl font-black font-mono text-emerald-600">
                      <PrivacyText value={Math.max(0, (selectedCard.limitTotal || 0) - (selectedCard.limitUsed || 0))} isPrivacyMode={isPrivacyMode} />
                    </p>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      De <PrivacyText value={selectedCard.limitTotal || 0} isPrivacyMode={isPrivacyMode} />
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Limite Utilizado</span>
                    <p className="text-2xl font-black font-mono text-slate-950">
                      <PrivacyText value={selectedCard.limitUsed || 0} isPrivacyMode={isPrivacyMode} />
                    </p>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Vencimento {selectedCard.dueDay ? `no dia ${selectedCard.dueDay}` : 'não informado'}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'transacoes' && (
                <div className="space-y-2">
                  {selectedCardTransactions.length > 0 ? (
                    selectedCardTransactions.map(tx => (
                      <div key={tx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{tx.title}</p>
                          <p className="text-[10px] text-slate-500">{tx.date} • {tx.category}</p>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">Nenhuma despesa vinculada a este cartão.</p>
                  )}
                </div>
              )}

            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950">Nenhum cartão cadastrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Cadastre seus cartões de crédito para acompanhar faturas e limites em tempo real.
            </p>
          </div>
          <button
            onClick={onAddCard}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeiro Cartão</span>
          </button>
        </div>
      )}

    </div>
  );
}
