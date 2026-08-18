import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MailCheck, RefreshCw, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  email: string;
  onBackToLogin: () => void;
}

export function EmailConfirmationView({ email, onBackToLogin }: Props) {
  const { resendConfirmationEmail, isLoading, error, clearError } = useAuth();
  const [cooldown, setCooldown] = useState(60);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    clearError();
    setResendSuccess(false);

    try {
      const resent = await resendConfirmationEmail(email);
      if (resent) {
        setResendSuccess(true);
        setCooldown(60);
      }
    } catch {
      // Handled in AuthContext
    }
  };

  return (
    <div className="space-y-6 text-center animate-in fade-in duration-300">
      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-inner shadow-cyan-500/10">
        <MailCheck className="w-7 h-7 text-cyan-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Confirme seu endereço de e-mail</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Enviamos um link de ativação exclusivo para <br />
          <span className="font-semibold text-slate-200 font-mono">{email}</span>.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2 text-slate-400">
        <p className="font-semibold text-slate-300">O que fazer agora?</p>
        <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 leading-normal">
          <li>Abra sua caixa de entrada e procure pelo e-mail do <strong className="text-slate-200">AuraFin</strong>.</li>
          <li>Clique no botão <strong className="text-slate-200">Confirmar minha conta</strong>.</li>
          <li>Retorne a esta tela e faça o login com suas credenciais.</li>
        </ol>
      </div>

      {resendSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>E-mail de confirmação reenviado com sucesso!</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isLoading}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 border border-slate-700"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${cooldown > 0 ? '' : 'animate-spin-slow'}`} />
          )}
          <span>
            {cooldown > 0 ? `Reenviar e-mail em ${cooldown}s` : 'Não recebeu? Reenviar e-mail'}
          </span>
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para o Login</span>
        </button>
      </div>
    </div>
  );
}
