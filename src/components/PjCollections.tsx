import { useState } from 'react';
import { Defaulter } from '../types';
import { AlertCircle, MessageSquare, CheckCircle2, Copy, X, FileText, Send } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  defaulters: Defaulter[];
  isPrivacyMode: boolean;
  onOpenBillingModal: () => void;
}

export function PjCollections({ defaulters, isPrivacyMode, onOpenBillingModal }: Props) {
  const [selectedDefaulter, setSelectedDefaulter] = useState<Defaulter | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const totalDelinquent = defaulters.reduce((acc, d) => acc + d.amount, 0);

  const getCollectionText = (def: Defaulter) => {
    return `Olá, equipe da ${def.client}! Tudo bem?

Constatamos em nosso sistema que a fatura referente ao contrato prestado, com vencimento em ${def.dueDate} (valor de R$ ${def.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}), está pendente de identificação de pagamento.

Segue nossa chave Pix CNPJ para regularização ou nos envie o comprovante de transferência:
Chave Pix CNPJ: 12.345.678/0001-90 (AuraFin Tecnologia e Serviços Ltda)

Ficamos à disposição para qualquer dúvida!
Atenciosamente,
Financeiro AuraFin`;
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Cobranças, Faturamento & Régua
          </h1>
          <p className="text-slate-400 mt-1 text-base">
            Gestão de faturamento Pix/Boleto gerencial e réguas automáticas de cobrança amigável.
          </p>
        </div>

        <button
          onClick={onOpenBillingModal}
          className="flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl transition-all shadow-sm active:scale-95 text-xs"
        >
          <FileText className="w-4 h-4" />
          <span>Emitir Fatura / Boleto Pix</span>
        </button>
      </div>

      {/* Delinquency Alert Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Total de Títulos em Atraso</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              {defaulters.length} cliente(s) aguardando regularização de cobrança.
            </p>
          </div>
        </div>
        <div className="text-right font-mono tabular-nums">
          <PrivacyText value={totalDelinquent} isPrivacyMode={isPrivacyMode} className="text-3xl font-black text-amber-400 tracking-tight" />
        </div>
      </div>

      {/* Régua Events Diagram */}
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white">Régua de Cobrança Programada</h2>
        <p className="text-xs text-slate-400">Eventos de envio automático de lembretes amigáveis para clientes.</p>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="font-bold text-sky-400">D-3</span>
            <p className="text-[10px] text-slate-500 font-sans mt-1">Lembrete Vencimento</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="font-bold text-emerald-400">D0</span>
            <p className="text-[10px] text-slate-500 font-sans mt-1">Dia do Vencimento</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="font-bold text-amber-400">D+3</span>
            <p className="text-[10px] text-slate-500 font-sans mt-1">Aviso de Atraso</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="font-bold text-amber-400">D+7</span>
            <p className="text-[10px] text-slate-500 font-sans mt-1">Cobrança Amigável</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="font-bold text-rose-400">D+15</span>
            <p className="text-[10px] text-slate-500 font-sans mt-1">Notificação Formal</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="font-bold text-rose-400">D+30</span>
            <p className="text-[10px] text-slate-500 font-sans mt-1">Renegociação</p>
          </div>
        </div>
      </div>

      {/* Defaulters List */}
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white">Clientes em Atraso Ativo</h2>

        <div className="space-y-4 font-mono tabular-nums">
          {defaulters.map((def) => (
            <div key={def.id} className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 font-sans">
                <div className="flex items-center space-x-3">
                  <h3 className="font-bold text-white text-lg">{def.client}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-rose-950/60 text-rose-300 border border-rose-800 rounded">
                    {def.daysLate} dias de atraso
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Vencimento: {def.dueDate} • Contato: {def.contactEmail}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <PrivacyText value={def.amount} isPrivacyMode={isPrivacyMode} className="text-2xl font-extrabold text-white" />
                <button
                  onClick={() => setSelectedDefaulter(def)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all font-sans"
                >
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Cobrar via Zap / E-mail</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collection Modal */}
      {selectedDefaulter && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-lg w-full border border-slate-800 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Régua de Cobrança Amigável</h3>
                <p className="text-xs text-slate-400 mt-0.5">Cliente: {selectedDefaulter.client}</p>
              </div>
              <button onClick={() => setSelectedDefaulter(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">Mensagem Sugerida:</label>
              <textarea
                rows={8}
                readOnly
                value={getCollectionText(selectedDefaulter)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 leading-relaxed outline-none"
              />
            </div>

            <button
              onClick={() => handleCopyText(getCollectionText(selectedDefaulter))}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              {copiedMessage ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMessage ? 'Copiado para a área de transferência!' : 'Copiar Texto da Cobrança'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
