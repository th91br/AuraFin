import { CalendarEvent } from '../types';
import { X, QrCode, Banknote, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BillingModalProps {
  isOpen?: boolean;
  event?: CalendarEvent;
  onClose: () => void;
  onSave?: (data: { client: string; amount: number; description: string; dueDate: string }) => void;
}

export function BillingModal({ isOpen = true, event, onClose, onSave }: BillingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [client, setClient] = useState(event?.client || 'Fintech Brasil Ltda');
  const [amount, setAmount] = useState(event?.value || 18500);
  const [description, setDescription] = useState(event?.title || 'Faturamento Servico TI');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (isOpen === false) return null;

  const handleGenerate = () => {
    if (onSave) {
      onSave({ client, amount, description, dueDate });
    }
    setStep(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 pb-4 flex justify-between items-center border-b border-slate-800">
          <h3 className="text-xl font-bold tracking-tight text-white">Emissão de Cobrança Pix</h3>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 pt-4">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cliente:</label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição do Serviço:</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-sans">Valor (R$):</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-sans">Vencimento:</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase">Método de cobrança gerencial</p>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-sky-500 bg-slate-800 text-sky-400 font-bold transition-all shadow-sm">
                    <QrCode className="w-6 h-6 mb-2" />
                    <span className="text-xs">Pix QR Code</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 font-medium transition-all">
                    <Banknote className="w-6 h-6 mb-2" />
                    <span className="text-xs">Boleto (D+1)</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="w-full py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Gerar Fatura e QR Code Pix
              </button>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-white tracking-tight">Cobrança Gerada com Sucesso!</h4>
              <p className="text-slate-400 text-xs max-w-[280px]">
                O link de pagamento via Pix foi registrado no caixa da empresa para <strong className="text-white">{client}</strong>.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors border border-slate-700"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
