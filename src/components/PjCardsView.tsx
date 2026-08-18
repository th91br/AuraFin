import { useState } from 'react';
import { CreditCard, Account, Transaction } from '../types';
import { MetricCard } from './aura/AuraCards';
import { Plus, CreditCard as CreditCardIcon } from 'lucide-react';

interface Props {
  creditCards?: CreditCard[];
  accounts?: Account[];
  transactions?: Transaction[];
  isPrivacyMode?: boolean;
  onAddCard?: () => void;
  onPayInvoice?: (cardId: string, amount: number) => void;
}

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PjCardsView({ creditCards = [], isPrivacyMode = false, onAddCard, onPayInvoice }: Props) {
  const [filter, setFilter] = useState<'todos' | 'credito' | 'debito'>('todos');
  const cards = creditCards.filter((card) => card.context === 'PJ');
  const creditCardsOnly = cards.filter((card) => card.type === 'credito');
  const visibleCards = cards.filter((card) => filter === 'todos' || card.type === filter);
  const totalLimit = creditCardsOnly.reduce((sum, card) => sum + card.limitTotal, 0);
  const totalUsed = creditCardsOnly.reduce((sum, card) => sum + card.limitUsed, 0);
  const totalInvoices = creditCardsOnly.reduce((sum, card) => sum + card.currentInvoice, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Cartões Empresariais</h1>
          <p className="text-xs text-slate-300 mt-1">Gestão de limites de crédito corporativo, faturas e cartões de débito.</p>
        </div>
        {onAddCard && (
          <button
            onClick={onAddCard}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cartão</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Cartões Ativos" value={cards.length} prefix="" subtitle="Registros da empresa" />
        <MetricCard title="Limite Total" value={totalLimit} isPrivacyMode={isPrivacyMode} subtitle="Crédito global" />
        <MetricCard title="Limite Utilizado" value={totalUsed} isPrivacyMode={isPrivacyMode} subtitle="Gastos correntes" />
        <MetricCard title="Limite Disponível" value={Math.max(0, totalLimit - totalUsed)} isPrivacyMode={isPrivacyMode} subtitle="Saldo para compras" />
        <MetricCard title="Faturas em Aberto" value={totalInvoices} isPrivacyMode={isPrivacyMode} subtitle="Faturas do mês" />
      </div>

      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-white/10">
        <button
          onClick={() => setFilter('todos')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
            filter === 'todos' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
          }`}
        >
          Todos ({cards.length})
        </button>
        <button
          onClick={() => setFilter('credito')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
            filter === 'credito' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
          }`}
        >
          Crédito ({creditCardsOnly.length})
        </button>
        <button
          onClick={() => setFilter('debito')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
            filter === 'debito' ? 'bg-cyan-600 text-white shadow-xs' : 'text-white/70 hover:text-white'
          }`}
        >
          Débito ({cards.filter((card) => card.type === 'debito').length})
        </button>
      </div>

      {visibleCards.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/80 rounded-2xl border border-dashed border-white/10 text-slate-300">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <CreditCardIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Nenhum cartão cadastrado</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
            Cadastre os cartões da sua empresa para acompanhar limites e fechamento de faturas.
          </p>
          {onAddCard && (
            <button
              onClick={onAddCard}
              className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Adicionar Primeiro Cartão
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleCards.map((card) => {
            const credit = card.type === 'credito';
            const available = Math.max(0, card.limitTotal - card.limitUsed);
            return (
              <div key={card.id} className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                    {credit ? 'Cartão de Crédito' : 'Cartão de Débito'}
                  </span>
                  <h3 className="font-bold text-base text-white mt-1">{card.name}</h3>
                  <p className="text-xs text-slate-300">
                    {card.institution} · {card.brand || 'Bandeira Visa/Master'} · final {card.lastFourDigits || '—'}
                  </p>
                </div>
                {credit ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Fatura atual</span>
                      <strong className="text-white font-mono">{money(card.currentInvoice)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Limite disponível</span>
                      <strong className="text-emerald-400 font-mono">{money(available)}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300">Débito direto da conta bancária corporativa.</p>
                )}
                {credit && onPayInvoice && (
                  <button
                    onClick={() => onPayInvoice(card.id, card.currentInvoice)}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    Pagar Fatura
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
