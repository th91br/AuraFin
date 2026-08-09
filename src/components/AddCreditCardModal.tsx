import React, { useState } from 'react';
import { CreditCard as CreditCardType } from '../types';
import { VisualPaymentCard } from './aura/AuraCards';
import { HelpTooltip } from './ui/HelpTooltip';
import { X, Sparkles, ShieldCheck, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Partial<CreditCardType>) => void;
}

export function AddCreditCardModal({ isOpen, onClose, onSave }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('Nubank Violeta');
  const [institution, setInstitution] = useState('Nubank');
  const [brand, setBrand] = useState('Visa');
  const [lastFourDigits, setLastFourDigits] = useState('4554');
  const [limitTotal, setLimitTotal] = useState(15000);
  const [closingDay, setClosingDay] = useState(20);
  const [dueDay, setDueDay] = useState(28);
  const [bestPurchaseDay, setBestPurchaseDay] = useState(21);
  const [isPrimary, setIsPrimary] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: `card_${Date.now()}`,
      name,
      institution,
      limitTotal,
      limitUsed: 0,
      currentInvoice: 0,
      closingDay,
      dueDay,
      context: 'PF',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Live Card Preview */}
        <div className="md:w-5/12 bg-slate-900 p-6 text-white flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">Preview em Tempo Real</span>
            </div>
            <h3 className="text-base font-bold tracking-tight text-white mt-1">Seu Novo Cartão</h3>
          </div>

          <VisualPaymentCard
            cardName={name || 'Nome do Cartão'}
            cardNumberMasked={`•••• •••• •••• ${lastFourDigits || '0000'}`}
            balance={limitTotal}
            dueDate={`${dueDay}/28`}
          />

          <div className="space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Sem número completo ou CVV por segurança</span>
            </div>
            <p>Os limites e parcelamentos serão atualizados automaticamente nas suas movimentações.</p>
          </div>
        </div>

        {/* Right Side: Step Form */}
        <div className="md:w-7/12 p-6 flex flex-col justify-between space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Passo {step} de 3
              </span>
              <h2 className="text-lg font-black text-slate-950 mt-1">Adicionar Cartão de Crédito</h2>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Step 1: Identificação */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Cartão</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Nubank Violeta, Itaú Personnalité"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Instituição</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Ex: Nubank, Itaú, C6"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bandeira</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Elo">Elo</option>
                      <option value="American Express">American Express</option>
                      <option value="Hipercard">Hipercard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Últimos 4 Dígitos (Final do Cartão)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={lastFourDigits}
                    onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 4554"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Limites e Datas */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Limite Total do Cartão (R$)</label>
                  <input
                    type="number"
                    value={limitTotal}
                    onChange={(e) => setLimitTotal(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <label className="block text-xs font-bold text-slate-700">Dia do Fechamento</label>
                      <HelpTooltip term="Fechamento" explanation="Dia em que novas compras deixam de entrar na fatura atual e passam para a fatura do mês seguinte." />
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={closingDay}
                      onChange={(e) => setClosingDay(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <label className="block text-xs font-bold text-slate-700">Dia do Vencimento</label>
                      <HelpTooltip term="Vencimento" explanation="Data limite para pagar o valor total da fatura sem cobrança de juros." />
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={dueDay}
                      onChange={(e) => setDueDay(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <label className="block text-xs font-bold text-slate-700">Melhor Dia de Compra (Opcional)</label>
                    <HelpTooltip term="Melhor Dia" explanation="Dia normalmente mais favorável para comprar e ganhar mais prazo de pagamento até o próximo vencimento." />
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={bestPurchaseDay}
                    onChange={(e) => setBestPurchaseDay(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Personalização */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-slate-950 rounded border-slate-300 focus:ring-slate-900"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Definir como Cartão Principal</span>
                    <span className="text-[11px] text-slate-500 block">Será sugerido automaticamente em novos lançamentos no cartão.</span>
                  </div>
                </label>
              </div>
            )}

            {/* Step Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Voltar
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s + 1) as any)}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                >
                  Próximo Passo
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Cartão</span>
                </button>
              )}
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
