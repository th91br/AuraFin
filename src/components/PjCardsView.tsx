import { useState } from 'react';
import { CreditCard, Account, Transaction } from '../types';
import { MetricCard, VisualPaymentCard } from './aura/AuraCards';
import { Plus, CreditCard as CreditCardIcon, ShieldCheck, AlertCircle, Wallet, Search, Filter, X, ChevronRight, Check } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';
import { formatCurrencyBRL, formatDateBRL } from '../utils/formatters';

interface Props {
  creditCards?: CreditCard[];
  accounts?: Account[];
  transactions?: Transaction[];
  isPrivacyMode?: boolean;
  onAddCard?: () => void;
  onPayInvoice?: (cardId: string, amount: number) => void;
}

export function PjCardsView({
  creditCards = [],
  accounts = [],
  transactions = [],
  isPrivacyMode = false,
  onAddCard,
  onPayInvoice,
}: Props) {
  const [filterType, setFilterType] = useState<'todos' | 'credito' | 'debito'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  // Default corporate cards fallback if state is empty
  const defaultCards: CreditCard[] = creditCards.length > 0 ? creditCards : [
    {
      id: 'c_pj1',
      name: 'BTG Pactual Corporate Black',
      institution: 'BTG Pactual',
      type: 'credito',
      brand: 'Mastercard',
      lastFourDigits: '8842',
      limitTotal: 50000,
      limitUsed: 12400,
      currentInvoice: 8500,
      closingDay: 15,
      dueDay: 23,
      context: 'PJ',
      status: 'ativo',
      isPrimary: true,
    },
    {
      id: 'c_pj2',
      name: 'C6 Bank Business Platinum',
      institution: 'C6 Bank',
      type: 'credito',
      brand: 'Visa',
      lastFourDigits: '4110',
      limitTotal: 30000,
      limitUsed: 4200,
      currentInvoice: 2100,
      closingDay: 20,
      dueDay: 28,
      context: 'PJ',
      status: 'ativo',
    },
    {
      id: 'd_pj1',
      name: 'Cartão Débito BTG Empresarial',
      institution: 'BTG Pactual',
      type: 'debito',
      brand: 'Mastercard',
      lastFourDigits: '9921',
      linkedAccountId: 'acc_btg_pj',
      limitTotal: 0,
      limitUsed: 0,
      currentInvoice: 0,
      closingDay: 0,
      dueDay: 0,
      context: 'PJ',
      status: 'ativo',
    },
  ];

  const pjCards = defaultCards.filter(c => c.context === 'PJ');

  // Filter logic
  const filteredCards = pjCards.filter(c => {
    const cardType = c.type || 'credito';
    if (filterType === 'credito' && cardType !== 'credito') return false;
    if (filterType === 'debito' && cardType !== 'debito') return false;
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(query) ||
        c.institution.toLowerCase().includes(query) ||
        (c.lastFourDigits && c.lastFourDigits.includes(query))
      );
    }
    return true;
  });

  // Calculate Metrics (Credit Cards Only)
  const creditOnly = pjCards.filter(c => (c.type || 'credito') === 'credito');
  const activeCount = pjCards.length;
  const totalLimit = creditOnly.reduce((acc, c) => acc + (c.limitTotal || 0), 0);
  const totalUsed = creditOnly.reduce((acc, c) => acc + (c.limitUsed || 0), 0);
  const availableLimit = totalLimit - totalUsed;
  const currentInvoicesTotal = creditOnly.reduce((acc, c) => acc + (c.currentInvoice || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Gestão Corporativa & Meios de Pagamento
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Cartões Empresariais
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Gerencie cartões de crédito e débito utilizados nas operações da empresa.
          </p>
        </div>

        <button
          onClick={onAddCard ? onAddCard : () => alert('Formulário de novo cartão PJ')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Adicionar Cartão</span>
        </button>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Cartões Ativos" value={activeCount} prefix="" subtitle="Crédito & Débito PJ" />
        <MetricCard title="Limite Total Crédito" value={totalLimit} isPrivacyMode={isPrivacyMode} subtitle="Crédito concedido" />
        <MetricCard title="Limite Utilizado" value={totalUsed} isPrivacyMode={isPrivacyMode} subtitle="Comprometido em faturas" trend="down" trendValue="-2%" />
        <MetricCard title="Limite Disponível" value={availableLimit} isPrivacyMode={isPrivacyMode} subtitle="Livre para compras" trend="up" trendValue="+5%" />
        <MetricCard title="Faturas em Aberto" value={currentInvoicesTotal} isPrivacyMode={isPrivacyMode} subtitle="Soma das faturas PJ" />
      </div>

      {/* Filter Bar & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0F172A] border border-white/5">
        
        {/* Tabs: Todos, Crédito, Débito */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-white/10 w-full md:w-auto">
          <button
            onClick={() => setFilterType('todos')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === 'todos' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            Todos ({pjCards.length})
          </button>
          <button
            onClick={() => setFilterType('credito')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === 'credito' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            Crédito ({creditOnly.length})
          </button>
          <button
            onClick={() => setFilterType('debito')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === 'debito' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            Débito ({pjCards.length - creditOnly.length})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cartão por nome ou final..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 font-semibold"
          />
        </div>
      </div>

      {/* Main Grid: Cards Display */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCards.map(card => {
            const isCredit = (card.type || 'credito') === 'credito';
            const cardAvailable = (card.limitTotal || 0) - (card.limitUsed || 0);
            const pctUsed = Math.min(100, Math.round(((card.limitUsed || 0) / (card.limitTotal || 1)) * 100));

            return (
              <div key={card.id} className="p-6 rounded-2xl bg-[#0F172A] border border-white/5 space-y-4 shadow-xs hover:border-cyan-500/30 transition-all">
                
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${isCredit ? 'bg-cyan-950 text-cyan-400 border-cyan-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'}`}>
                        {isCredit ? 'Crédito Corporativo' : 'Débito Empresarial'}
                      </span>
                      {card.isPrimary && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                          Principal
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-white mt-1.5">{card.name}</h3>
                    <span className="text-xs text-slate-400 font-medium">{card.institution} • Bandeira {card.brand || 'Mastercard'}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">Final {card.lastFourDigits || '4554'}</span>
                </div>

                <VisualPaymentCard
                  cardName={card.name}
                  cardNumberMasked={`•••• •••• •••• ${card.lastFourDigits || '4554'}`}
                  balance={isCredit ? cardAvailable : 45000}
                  dueDate={isCredit ? `${card.dueDay || 25}/28` : 'Débito em Conta'}
                />

                {isCredit ? (
                  /* Detalhes de Crédito (Limite, Fatura, Fechamento) */
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs space-y-2.5 font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Fatura Atual ({card.closingDay || 15}/28):</span>
                      <span className="font-bold text-white">
                        <PrivacyText value={card.currentInvoice || 0} isPrivacyMode={isPrivacyMode} />
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Limite Disponível:</span>
                      <span className="font-bold text-emerald-400">
                        <PrivacyText value={cardAvailable} isPrivacyMode={isPrivacyMode} />
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Limite Utilizado ({pctUsed}%):</span>
                      <span>
                        <PrivacyText value={card.limitUsed || 0} isPrivacyMode={isPrivacyMode} /> de <PrivacyText value={card.limitTotal || 0} isPrivacyMode={isPrivacyMode} />
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pctUsed}%` }} />
                    </div>
                  </div>
                ) : (
                  /* Detalhes de Débito (Conta Vinculada, Sem limites ou faturas) */
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Conta PJ Vinculada:</span>
                      <span className="font-bold text-cyan-400">Conta Corrente BTG (PJ)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Status do Cartão:</span>
                      <span className="font-extrabold text-emerald-400 uppercase text-[10px]">Ativo & Habilitado</span>
                    </div>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="flex items-center space-x-3 pt-2">
                  {isCredit && (
                    <button
                      onClick={() => onPayInvoice ? onPayInvoice(card.id, card.currentInvoice || 0) : alert(`Pagamento da fatura de ${formatCurrencyBRL(card.currentInvoice)} registrado!`)}
                      className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                    >
                      Pagar Fatura (Débito em Caixa)
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedCard(card)}
                    className={`py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all ${!isCredit ? 'w-full' : ''}`}
                  >
                    Ver Detalhes
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-[#0F172A] rounded-2xl border border-dashed border-white/10 space-y-4">
          <CreditCardIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Você ainda não possui cartões empresariais</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Cadastre cartões de crédito ou débito utilizados pela sua empresa para acompanhar despesas, limites e faturas sem complicação.
            </p>
          </div>
          <button
            onClick={onAddCard ? onAddCard : () => alert('Formulário de novo cartão PJ')}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            + Adicionar Primeiro Cartão
          </button>
        </div>
      )}

      {/* Drawer/Modal de Detalhes do Cartão Selecionado */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0F172A] rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg p-6 space-y-6 text-slate-100">
            
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {selectedCard.type === 'debito' ? 'Débito Empresarial' : 'Crédito Corporativo'}
                </span>
                <h2 className="text-xl font-black text-white mt-1">{selectedCard.name}</h2>
                <p className="text-xs text-slate-400">{selectedCard.institution} • Final {selectedCard.lastFourDigits || '4554'}</p>
              </div>
              <button onClick={() => setSelectedCard(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-slate-400">Limite Total:</span>
                <span className="font-bold text-white"><PrivacyText value={selectedCard.limitTotal || 0} isPrivacyMode={isPrivacyMode} /></span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-slate-400">Fatura Atual:</span>
                <span className="font-bold text-cyan-400"><PrivacyText value={selectedCard.currentInvoice || 0} isPrivacyMode={isPrivacyMode} /></span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-slate-400">Dia de Fechamento:</span>
                <span className="font-bold text-white">Dia {selectedCard.closingDay || 15}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-slate-400">Dia de Vencimento:</span>
                <span className="font-bold text-white">Dia {selectedCard.dueDay || 25}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedCard(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
