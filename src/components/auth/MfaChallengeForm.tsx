import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, KeyRound, Loader2, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function MfaChallengeForm({ onSuccess, onCancel }: Props) {
  const { challengeAndVerifyMfa, error, clearError, isLoading } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const cleanCode = code.trim().replace(/\s/g, '');
    if (cleanCode.length !== 6) {
      setLocalError('Informe o código de autenticação de 6 dígitos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await challengeAndVerifyMfa(cleanCode);
      onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Código TOTP inválido ou expirado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-inner shadow-cyan-500/10">
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Autenticação de Dois Fatores (MFA)</h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador (Google Authenticator, 1Password, etc.).
        </p>
      </div>

      {activeError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{activeError}</span>
        </div>
      )}

      {/* TOTP Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 text-center block">Código de Verificação</label>
        <div className="relative max-w-xs mx-auto">
          <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            required
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={(e) => {
              setLocalError(null);
              clearError();
              setCode(e.target.value.replace(/[^0-9]/g, ''));
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 pl-10 text-center text-lg font-mono tracking-widest text-cyan-400 placeholder:text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isLoading || code.length !== 6}
          className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Verificando fator...</span>
            </>
          ) : (
            <>
              <span>Confirmar Acesso</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Login</span>
        </button>
      </div>
    </form>
  );
}
