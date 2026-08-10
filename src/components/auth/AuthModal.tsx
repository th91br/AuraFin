import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User as UserIcon, X, Sparkles, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: Props) {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    requestPasswordReset, 
    updatePassword, 
    error, 
    clearError,
    isPasswordRecoveryMode,
    exitPasswordRecoveryMode 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen && !isPasswordRecoveryMode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setNoticeMessage(null);
    setIsSubmitting(true);

    try {
      if (isPasswordRecoveryMode) {
        if (!newPassword || newPassword.length < 6) {
          setNoticeMessage('A nova senha deve ter no mínimo 6 caracteres.');
          setIsSubmitting(false);
          return;
        }
        await updatePassword(newPassword);
        setNoticeMessage('Sua senha foi atualizada com sucesso!');
        setTimeout(() => {
          exitPasswordRecoveryMode();
          onClose();
        }, 1500);
        return;
      }

      if (mode === 'login') {
        await signInWithEmail(email, password);
        if (!error) onClose();
      } else if (mode === 'signup') {
        const { requiresEmailConfirmation } = await signUpWithEmail(email, password, fullName);
        if (requiresEmailConfirmation) {
          setNoticeMessage('Cadastro realizado! Por favor, confira seu e-mail para confirmar sua conta antes de fazer login.');
        } else {
          onClose();
        }
      } else if (mode === 'forgot') {
        await requestPasswordReset(email);
        setNoticeMessage('Se o e-mail estiver cadastrado, enviamos um link para redefinição de senha.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        {!isPasswordRecoveryMode && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 rounded-full inline-flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>AuraFin Cloud Sync</span>
          </span>
          <h2 className="text-2xl font-black tracking-tight pt-1">
            {isPasswordRecoveryMode 
              ? 'Definir Nova Senha' 
              : mode === 'login' 
              ? 'Entrar no AuraFin' 
              : mode === 'signup' 
              ? 'Criar sua Conta' 
              : 'Recuperar Senha'}
          </h2>
          <p className="text-xs text-slate-400">
            {isPasswordRecoveryMode
              ? 'Digite sua nova senha abaixo para redefinir o acesso.'
              : mode === 'login'
              ? 'Acesse suas finanças pessoais e empresariais protegidas.'
              : mode === 'signup'
              ? 'Comece a gerenciar suas finanças com segurança bancária.'
              : 'Enviaremos as instruções de recuperação para seu e-mail.'}
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {noticeMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isPasswordRecoveryMode ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Nova Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <>
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300">Senha</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); clearError(); }}
                        className="text-[11px] font-semibold text-indigo-400 hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-98"
          >
            <span>
              {isSubmitting
                ? 'Processando...'
                : isPasswordRecoveryMode
                ? 'Atualizar Senha'
                : mode === 'login'
                ? 'Entrar'
                : mode === 'signup'
                ? 'Cadastrar'
                : 'Enviar Link de Recuperação'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Mode Switch Footer */}
        {!isPasswordRecoveryMode && (
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/60">
            {mode === 'login' ? (
              <p>
                Ainda não tem conta?{' '}
                <button 
                  onClick={() => { setMode('signup'); clearError(); }}
                  className="font-bold text-indigo-400 hover:underline"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            ) : (
              <p>
                Já possui uma conta?{' '}
                <button 
                  onClick={() => { setMode('login'); clearError(); }}
                  className="font-bold text-indigo-400 hover:underline"
                >
                  Fazer Login
                </button>
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
