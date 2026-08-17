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
  const [cardType, setCardType] = useState<'credito' | 'debito'>('credito');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [brand, setBrand] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [limitTotal, setLimitTotal] = useState(0);
  const [closingDay, setClosingDay] = useState(0);
  const [dueDay, setDueDay] = useState(0);
  const [isPrimary, setIsPrimary] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: `card_${Date.now()}`,
      name,
      institution,
      brand,
      lastFourDigits,
      type: cardType,
      limitTotal: cardType === 'debito' ? 0 : limitTotal,
      limitUsed: 0,
      currentInvoice: 0,
      closingDay: cardType === 'debito' ? 0 : closingDay,
      dueDay: cardType === 'debito' ? 0 : dueDay,
      isPrimary,
    });
    onClose();
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-950 placeholder-slate-400 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-950 focus:border-slate-950";
  const labelClass = "block text-xs font-bold text-slate-900 mb-1";

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
            cardNumberMasked={`•••• •••• •••• ${lastFourDigits || '—'}`}
            balance={limitTotal}
            dueDate={cardType === 'credito' ? (dueDay > 0 ? `${dueDay}` : '—') : 'Débito em Conta'}
            brand={brand}
          />

          <div className="space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Sem número completo ou CVV por segurança</span>
            </div>
            <p>Os limites e transações serão atualizados automaticamente no sistema.</p>
          </div>
        </div>

        {/* Right Side: Step Form */}
        <div className="md:w-7/12 p-6 flex flex-col justify-between space-y-6 bg-white">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Passo {step} de 3
              </span>
              <h2 className="text-lg font-black text-slate-950 mt-1">Adicionar Cartão Empresarial</h2>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Step 1: Identificação & Tipo */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Tipo de Cartão */}
                <div>
                  <label className={labelClass}>Tipo de Cartão</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setCardType('credito')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${cardType === 'credito' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Crédito Corporativo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardType('debito')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${cardType === 'debito' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Débito Empresarial
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Nome do Cartão</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: BTG Pactual Corporate, Itaú Empresas"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Instituição</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Ex: BTG Pactual, Itaú, C6"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Bandeira</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className={`${inputClass} bg-white text-slate-950`}
                      required
                    >
                      <option value="" className="bg-white text-slate-950">Selecione a bandeira</option>
                      <option value="Visa" className="bg-white text-slate-950">Visa</option>
                      <option value="Mastercard" className="bg-white text-slate-950">Mastercard</option>
                      <option value="Elo" className="bg-white text-slate-950">Elo</option>
                      <option value="American Express" className="bg-white text-slate-950">American Express</option>
                      <option value="Hipercard" className="bg-white text-slate-950">Hipercard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Últimos 4 Dígitos (Final do Cartão)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={lastFourDigits}
                    onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 8842"
                    className={`${inputClass} font-mono font-bold`}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Limites e Datas */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {cardType === 'credito' ? (
                  <>
                    <div>
                      <label className={labelClass}>Limite Total do Cartão (R$)</label>
                      <input
                        type="number"
                        value={limitTotal}
                        onChange={(e) => setLimitTotal(Number(e.target.value))}
                        className={`${inputClass} font-mono font-bold text-sm`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <label className="block text-xs font-bold text-slate-900">Dia do Fechamento</label>
                          <HelpTooltip term="Fechamento" explanation="Dia em que novas compras deixam de entrar na fatura atual e passam para a próxima." />
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={closingDay}
                          onChange={(e) => setClosingDay(Number(e.target.value))}
                          className={`${inputClass} font-mono font-bold`}
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <label className="block text-xs font-bold text-slate-900">Dia do Vencimento</label>
                          <HelpTooltip term="Vencimento" explanation="Data limite para pagar a fatura sem juros." />
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={dueDay}
                          onChange={(e) => setDueDay(Number(e.target.value))}
                          className={`${inputClass} font-mono font-bold`}
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                    <p className="font-bold text-slate-900">Cartão de Débito Direto em Conta</p>
                    <p>Compras no débito reduzem o saldo da conta bancária corporativa vinculada no ato do pagamento. Não há fatura nem limite de crédito.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Personalização */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-slate-950 rounded border-slate-300 focus:ring-slate-950"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Definir como Cartão Principal</span>
                    <span className="text-[11px] text-slate-600 block">Será selecionado por padrão em novas operações corporativas.</span>
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
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950"
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
