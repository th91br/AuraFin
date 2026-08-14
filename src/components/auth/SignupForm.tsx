import React, { useState } from 'react';
import { useAuth, validatePasswordStrength } from '../../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Check, X, AlertCircle } from 'lucide-react';

interface Props {
  onSwitchToLogin: () => void;
  onSignupSuccess: (email: string) => void;
}

export function SignupForm({ onSwitchToLogin, onSignupSuccess }: Props) {
  const { signUpWithEmail, error, clearError, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const strength = validatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!acceptTerms) {
      setLocalError('Você precisa concordar com os Termos de Uso e Política de Privacidade.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    if (!strength.isValid) {
      setLocalError('A senha precisa atender a todos os requisitos de segurança obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { requiresEmailConfirmation } = await signUpWithEmail(email, password, fullName);
      if (requiresEmailConfirmation) {
        onSignupSuccess(email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Crie sua conta AuraFin</h2>
        <p className="text-xs text-slate-400">Inicie sua gestão patrimonial PF e empresarial PJ com isolamento seguro.</p>
      </div>

      {activeError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{activeError}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Nome Completo</label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            required
            autoComplete="name"
            placeholder="Ex: Carlos Eduardo Silva"
            value={fullName}
            onChange={(e) => { setLocalError(null); clearError(); setFullName(e.target.value); }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">E-mail Principal</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="carlos@empresa.com"
            value={email}
            onChange={(e) => { setLocalError(null); clearError(); setEmail(e.target.value); }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Senha Segura</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Mínimo 12 caracteres"
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

        {/* Strength Checklist */}
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
                <span>12+ caracteres</span>
              </div>
              <div className={`flex items-center space-x-1 ${strength.hasUpper && strength.hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                {strength.hasUpper && strength.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>Maiúsculas & Minúsculas</span>
              </div>
              <div className={`flex items-center space-x-1 ${strength.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                {strength.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>Ao menos 1 número</span>
              </div>
              <div className={`flex items-center space-x-1 ${strength.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                {strength.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>Ao menos 1 símbolo</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Confirmação da Senha</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Repita sua senha"
            value={confirmPassword}
            onChange={(e) => { setLocalError(null); clearError(); setConfirmPassword(e.target.value); }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Terms & Privacy */}
      <div className="pt-1">
        <label className="flex items-start space-x-2.5 text-[11px] text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/40"
          />
          <span className="leading-tight">
            Concordo com os Termos de Uso do AuraFin e reconheço a Política de Privacidade e Governança de Dados (LGPD).
          </span>
        </label>
      </div>

      {/* Submit CTA */}
      <button
        type="submit"
        disabled={isSubmitting || isLoading || !fullName || !email || !password || !confirmPassword || !acceptTerms}
        className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2"
      >
        {isSubmitting || isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Criando sua conta segura...</span>
          </>
        ) : (
          <>
            <span>Concluir Cadastro</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Switch to Login */}
      <div className="pt-2 text-center text-xs text-slate-400">
        Já possui uma conta?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors underline decoration-cyan-500/30 underline-offset-4"
        >
          Fazer login
        </button>
      </div>
    </form>
  );
}
