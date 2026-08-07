import { CalendarEvent } from '../types';
import { X, QrCode, Banknote, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function BillingModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 pb-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Emissão de Cobrança</h3>
          <button 
            onClick={onClose} 
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 pt-2">
          {step === 1 ? (
            <div className="space-y-8">
              <div className="text-center p-8 bg-slate-50/80 rounded-[1.5rem] border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-2">{event.title}</p>
                <p className="text-4xl font-semibold text-slate-900 tracking-tight mb-3">
                  R$ {event.value?.toFixed(2)}
                </p>
                <p className="text-sm font-medium text-slate-600 bg-white py-1.5 px-4 rounded-full inline-block border border-slate-200 shadow-sm">
                  Cliente: {event.client}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-900">Método de cobrança padrão</p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 text-indigo-700 transition-all shadow-sm">
                    <QrCode className="w-7 h-7 mb-3" />
                    <span className="text-sm font-bold">Pix Automático</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 transition-all">
                    <Banknote className="w-7 h-7 mb-3" />
                    <span className="text-sm font-semibold">Boleto (D+1)</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-sm transition-all transform hover:scale-[1.01] active:scale-95 text-lg"
              >
                Gerar e Enviar Cobrança
              </button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2 ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-semibold text-slate-900 tracking-tight">Cobrança Enviada!</h4>
              <p className="text-slate-500 max-w-[280px] leading-relaxed">
                O link de pagamento via Pix foi gerado e enviado para o WhatsApp de <strong className="text-slate-700">{event.client}</strong>.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-2xl transition-colors"
              >
                Voltar para Agenda
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
