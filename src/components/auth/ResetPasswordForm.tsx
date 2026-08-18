import React, { useState } from 'react';
import { useAuth, validatePasswordStrength } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, Loader2, Check, X, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

export function ResetPasswordForm({ onSuccess }: Props) {
  const { updatePassword, error, clearError, isLoading, exitPasswordRecoveryMode } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = validatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (password !== confirmPassword) {
      setLocalError('A confirmação de senha não coincide.');
      return;
    }

    if (!strength.isValid) {
      setLocalError('A senha precisa ter no mínimo 8 caracteres e conter letras maiúsculas, minúsculas e números.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updatePassword(password);
      if (updated) {
        setIsSuccess(true);
        setTimeout(() => {
          exitPasswordRecoveryMode();
          onSuccess();
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || error;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Definir Nova Senha</h2>
        <p className="text-xs text-slate-400">Escolha uma nova senha forte para proteger sua conta no AuraFin.</p>
      </div>

      {isSuccess ? (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-emerald-300">Senha atualizada com sucesso!</p>
          <p className="text-xs text-slate-400">Redirecionando para seu painel seguro...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{activeError}</span>
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nova Senha Forte</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => { setLocalError(null); clearError(); setPassword(e.target.value); }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Checklist */}
            {password.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 mt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Classificação:</span>
                  <span className={`font-semibold ${strength.score >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {strength.message}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.score >= 1 ? 'bg-rose-500' : 'bg-slate-800'}`} />
                  <div className={`h-full ${strength.score >= 2 ? 'bg-amber-500' : 'bg-slate-800'}`} />
                  <div className={`h-full ${strength.score >= 3 ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                  <div className={`h-full ${strength.score >= 4 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] pt-1">
                  <div className={`flex items-center space-x-1 ${strength.hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>8+ caracteres</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${strength.hasUpper && strength.hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasUpper && strength.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Maiúsculas & Minúsculas</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${strength.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Ao menos 1 número</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${strength.hasSpecial || password.length >= 12 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {strength.hasSpecial || password.length >= 12 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Símbolo ou 12+ caracteres</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Confirme a Nova Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Repita sua nova senha"
                value={confirmPassword}
                onChange={(e) => { setLocalError(null); clearError(); setConfirmPassword(e.target.value); }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading || !password || !confirmPassword}
            className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Atualizando senha...</span>
              </>
            ) : (
              <>
                <span>Salvar Nova Senha</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
