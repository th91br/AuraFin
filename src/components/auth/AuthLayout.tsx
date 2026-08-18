import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { EmailConfirmationView } from './EmailConfirmationView';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { MfaChallengeForm } from './MfaChallengeForm';
import { Shield, Sparkles, Building2, UserCheck, ArrowUpRight, Lock } from 'lucide-react';

export type AuthViewMode = 'login' | 'signup' | 'verify-email' | 'forgot-password' | 'reset-password' | 'mfa';

interface Props {
  initialMode?: AuthViewMode;
}

export function AuthLayout({ initialMode = 'login' }: Props) {
  const { isPasswordRecoveryMode } = useAuth();
  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  const [pendingEmail, setPendingEmail] = useState('');
  const environmentLabel = import.meta.env.VITE_APP_ENV === 'production'
    ? 'PROD'
    : import.meta.env.VITE_APP_ENV === 'staging'
      ? 'STAGING'
      : 'DEV';

  useEffect(() => {
    if (isPasswordRecoveryMode) {
      setMode('reset-password');
    }
  }, [isPasswordRecoveryMode]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      
      {/* Top Brand Bar */}
      <header className="px-6 py-5 border-b border-slate-900 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-extrabold tracking-tight text-base text-white">AuraFin</span>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/60">
              {environmentLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium text-slate-300">Ambiente Seguro & Criptografado</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: AuraFin Branding & Value Proposition */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-semibold w-fit">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Autonomia Financeira & Governança Patrimonial</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
              Gestão financeira de alta precisão para <span className="text-cyan-400">Pessoa Física</span> e <span className="text-slate-300">Pessoa Jurídica</span>.
            </h1>

            <p className="text-xs xl:text-sm text-slate-400 leading-relaxed max-w-md">
              Controle de caixa, conciliações societárias, DRE executivo e planejamento patrimonial com isolamento PostgreSQL por RLS.
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-200">Patrimônio Pessoal</h3>
                <p className="text-[11px] text-slate-400 leading-normal">Contas, cartões, investimentos e orçamentos integrados.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-200">Gestão Corporativa</h3>
                <p className="text-[11px] text-slate-400 leading-normal">Faturamento, DRE, pró-labore e rateios atômicos societários.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Auth Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
              
              {/* Top Subtle Ambient Light */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {mode === 'login' && (
                <LoginForm
                  onSwitchToSignup={() => setMode('signup')}
                  onSwitchToForgotPassword={() => setMode('forgot-password')}
                  onRequiresMfa={() => setMode('mfa')}
                />
              )}

              {mode === 'signup' && (
                <SignupForm
                  onSwitchToLogin={() => setMode('login')}
                  onSignupSuccess={(email) => {
                    setPendingEmail(email);
                    setMode('verify-email');
                  }}
                />
              )}

              {mode === 'verify-email' && (
                <EmailConfirmationView
                  email={pendingEmail}
                  onBackToLogin={() => setMode('login')}
                />
              )}

              {mode === 'forgot-password' && (
                <ForgotPasswordForm
                  onBackToLogin={() => setMode('login')}
                />
              )}

              {mode === 'reset-password' && (
                <ResetPasswordForm
                  onSuccess={() => setMode('login')}
                />
              )}

              {mode === 'mfa' && (
                <MfaChallengeForm
                  onSuccess={() => {
                    // Session upgraded to aal2, AuthProvider will trigger refresh
                  }}
                  onCancel={() => setMode('login')}
                />
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-900 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <span>© 2026 AuraFin Technologies. Todos os direitos reservados.</span>
        <div className="flex items-center space-x-4">
          <span className="hover:text-slate-400 transition-colors flex items-center space-x-0.5">
            <span>Privacidade & LGPD</span>
            <ArrowUpRight className="w-2.5 h-2.5" />
          </span>
          <span className="hover:text-slate-400 transition-colors flex items-center space-x-0.5">
            <span>Termos de Uso</span>
            <ArrowUpRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </footer>

    </div>
  );
}
