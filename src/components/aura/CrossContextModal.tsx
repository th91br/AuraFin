import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { CrossContextService } from '../../services/crossContextService';
import { ArrowLeftRight, CheckCircle2, AlertCircle, X, Loader2, DollarSign, Wallet } from 'lucide-react';
import { Account } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reconciliation?: {
    id: string;
    amountCents: number;
    resolvedAmountCents: number;
    title: string;
  };
  pfAccounts: Account[];
  pjAccounts: Account[];
  onSuccess: () => void;
}

export function CrossContextModal({ isOpen, onClose, reconciliation, pfAccounts, pjAccounts, onSuccess }: Props) {
  const { user, isAuthenticated } = useAuth();
  const { activeOrganization, isViewerReadOnly } = useOrganization();

  const [mode, setMode] = useState<'reimbursement' | 'pro_labore' | 'profit_distribution'>('reimbursement');
  const [amountStr, setAmountStr] = useState('');
  const [selectedPfAccountId, setSelectedPfAccountId] = useState('');
  const [selectedPjAccountId, setSelectedPjAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [operationIdempotencyKey, setOperationIdempotencyKey] = useState<string>(() => crypto.randomUUID());

  if (!isOpen || !isAuthenticated || !user || !activeOrganization) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isViewerReadOnly) {
      setErrorMsg('Membros com permissão apenas de leitura (Viewer) não podem realizar liquidações financeiras.');
      return;
    }

    const amountCents = Math.round(parseFloat(amountStr || '0') * 100);
    if (amountCents <= 0) {
      setErrorMsg('Informe um valor válido maior que R$ 0,00.');
      return;
    }

    if (!selectedPjAccountId || !selectedPfAccountId) {
      setErrorMsg('Selecione a conta de origem (PJ) e a conta de destino (PF).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'reimbursement') {
        if (!reconciliation) {
          throw new Error('Nenhuma conciliação foi selecionada para reembolso.');
        }
        await CrossContextService.processReimbursement({
          organizationId: activeOrganization.id,
          reconciliationId: reconciliation.id,
          amountCents,
          pjAccountId: selectedPjAccountId,
          pfAccountId: selectedPfAccountId,
          idempotencyKey: operationIdempotencyKey,
          notes,
        });
        setSuccessMsg('Reembolso processado com sucesso! Saldo e conciliação atualizados.');
      } else if (mode === 'pro_labore') {
        await CrossContextService.processProLabore({
          organizationId: activeOrganization.id,
          partnerId: user.id,
          amountCents,
          pjAccountId: selectedPjAccountId,
          pfAccountId: selectedPfAccountId,
          idempotencyKey: operationIdempotencyKey,
          notes,
        });
        setSuccessMsg('Pró-labore transferido com sucesso! Entrada e saída vinculadas no PostgreSQL.');
      } else {
        await CrossContextService.processProfitDistribution({
          organizationId: activeOrganization.id,
          partnerId: user.id,
          amountCents,
          pjAccountId: selectedPjAccountId,
          pfAccountId: selectedPfAccountId,
          idempotencyKey: operationIdempotencyKey,
          notes,
        });
        setSuccessMsg('Distribuição de lucros processada com sucesso! Lançamentos vinculados no PostgreSQL.');
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
        onClose();
      }, 1000);

    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Falha ao processar operação cross-context.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative">
        
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded-full inline-flex items-center space-x-1.5">
            <Wallet className="w-3 h-3 text-cyan-400" />
            <span>Conciliação Atômica PF ↔ PJ</span>
          </span>
          <h2 className="text-2xl font-black tracking-tight pt-1">
            Acerto Financeiro Cross-Context
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Transfira valores entre o caixa da empresa ({activeOrganization.name}) e a conta pessoal do sócio de forma atômica no Supabase.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setMode('reimbursement')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'reimbursement' ? 'bg-cyan-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
          >
            Reembolso
          </button>
          <button
            type="button"
            onClick={() => setMode('pro_labore')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'pro_labore' ? 'bg-cyan-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
          >
            Pró-Labore
          </button>
          <button
            type="button"
            onClick={() => setMode('profit_distribution')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'profit_distribution' ? 'bg-cyan-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
          >
            Lucros
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* PJ Source Account */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Conta Pagadora (PJ Empresarial):</label>
            <select
              value={selectedPjAccountId}
              onChange={(e) => setSelectedPjAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
            >
              <option value="">Selecione a conta da empresa...</option>
              {pjAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — ({acc.institution}) — Saldo: R$ {(acc.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* PF Destination Account */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Conta Recebedora (PF Pessoal):</label>
            <select
              value={selectedPfAccountId}
              onChange={(e) => setSelectedPfAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
            >
              <option value="">Selecione sua conta pessoal...</option>
              {pfAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — ({acc.institution}) — Saldo: R$ {(acc.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Valor da Operação (R$):</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-mono">R$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Observações / Referência:</label>
            <input
              type="text"
              placeholder="Ex: Reembolso de nota fiscal de despesa gerencial..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {errorMsg && (
            <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isViewerReadOnly}
              className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>Confirmar Acerto</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
