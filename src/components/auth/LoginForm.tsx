import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  onRequiresMfa: () => void;
}

export function LoginForm({ onSwitchToSignup, onSwitchToForgotPassword, onRequiresMfa }: Props) {
  const { signInWithEmail, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    clearError();
    setIsSubmitting(true);

    try {
      const result = await signInWithEmail(email, password);
      if (result.requiresMfa) {
        onRequiresMfa();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Entre na sua conta</h2>
        <p className="text-xs text-slate-400">Acesse seu centro de inteligência e controle financeiro.</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>E-mail Corporativo ou Pessoal</span>
        </label>
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

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300">Senha de Acesso</label>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-[11px] font-medium"
          >
            Esqueci minha senha
          </button>
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => { clearError(); setPassword(e.target.value); }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 pl-10 pr-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit CTA */}
      <button
        type="submit"
        disabled={isSubmitting || isLoading || !email || !password}
        className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2"
      >
        {isSubmitting || isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Validando credenciais...</span>
          </>
        ) : (
          <>
            <span>Acessar Painel AuraFin</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Switch to Signup */}
      <div className="pt-2 text-center text-xs text-slate-400">
        Não possui uma conta?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors underline decoration-cyan-500/30 underline-offset-4"
        >
          Criar conta executiva
        </button>
      </div>

      {/* Trust Badge */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>Criptografia de ponta a ponta & Isolamento RLS</span>
      </div>
    </form>
  );
}
