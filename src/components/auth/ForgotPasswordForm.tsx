import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: Props) {
  const { requestPasswordReset, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    clearError();
    setIsSubmitting(true);

    try {
      const accepted = await requestPasswordReset(email);
      if (accepted) setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Recuperação de Senha</h2>
        <p className="text-xs text-slate-400">
          Informe seu e-mail cadastrado para receber instruções seguras de redefinição.
        </p>
      </div>

      {isSubmitted ? (
        <div className="space-y-5 text-center py-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Instruções enviadas!</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Se existir uma conta vinculada ao e-mail <strong className="text-slate-200 font-mono">{email}</strong>, você receberá um link temporário para redefinir sua senha com segurança.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Login</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Seu E-mail Cadastrado</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => { clearError(); setEmail(e.target.value); }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 pl-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading || !email}
            className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Enviando link seguro...</span>
              </>
            ) : (
              <>
                <span>Enviar Link de Redefinição</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1 font-medium pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancelar e voltar ao Login</span>
          </button>
        </form>
      )}
    </div>
  );
}
