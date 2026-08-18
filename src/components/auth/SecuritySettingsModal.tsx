import React, { useState } from 'react';
import { useAuth, validatePasswordStrength } from '../../context/AuthContext';
import { X, ShieldCheck, QrCode, Key, Lock, CheckCircle2, AlertCircle, Loader2, Copy, Check, Trash2, Eye, EyeOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SecuritySettingsModal({ isOpen, onClose }: Props) {
  const {
    user,
    profile,
    aal,
    mfaFactors,
    isMfaEnrolled,
    enrollMfa,
    verifyMfaEnrollment,
    unenrollMfa,
    updatePassword,
    error,
    clearError,
    isLoading
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'mfa' | 'password'>('mfa');

  // MFA Enrollment State
  const [enrollmentData, setEnrollmentData] = useState<{ id: string; qr_code: string; secret: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [mfaSuccessMsg, setMfaSuccessMsg] = useState<string | null>(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordLocalError, setPasswordLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEnrollment = async () => {
    clearError();
    setMfaSuccessMsg(null);
    setIsEnrolling(true);
    try {
      const res = await enrollMfa();
      setEnrollmentData({
        id: res.id,
        qr_code: res.totp.qr_code,
        secret: res.totp.secret,
      });
    } catch (err: any) {
      console.error('Erro ao iniciar MFA:', err);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleVerifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentData || verificationCode.length !== 6) return;

    clearError();
    setIsVerifying(true);
    try {
      await verifyMfaEnrollment(enrollmentData.id, verificationCode);
      setEnrollmentData(null);
      setVerificationCode('');
      setMfaSuccessMsg('Autenticação de Dois Fatores (MFA) ativada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao verificar código MFA:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnenroll = async (factorId: string) => {
    if (!window.confirm('Tem certeza de que deseja desativar a Autenticação de Dois Fatores (MFA)?')) return;
    clearError();
    try {
      await unenrollMfa(factorId);
      setMfaSuccessMsg('MFA desativado com sucesso.');
    } catch (err: any) {
      console.error('Erro ao desativar MFA:', err);
    }
  };

  const handleCopySecret = () => {
    if (enrollmentData?.secret) {
      navigator.clipboard.writeText(enrollmentData.secret);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLocalError(null);
    setPasswordSuccessMsg(null);
    clearError();

    if (newPassword !== confirmPassword) {
      setPasswordLocalError('As senhas digitadas não coincidem.');
      return;
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      setPasswordLocalError('A nova senha deve ter no mínimo 12 caracteres e atender a todos os requisitos de segurança.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(newPassword);
      setPasswordSuccessMsg('Sua senha foi alterada com sucesso.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordLocalError(err.message || 'Erro ao alterar senha.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const strength = validatePasswordStrength(newPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Segurança da Conta</h2>
            <p className="text-xs text-slate-400">{profile?.full_name || user?.email} • Nível {aal.toUpperCase()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('mfa')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'mfa' ? 'bg-cyan-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Autenticação em 2 Etapas (MFA)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'password' ? 'bg-cyan-600 text-white shadow-md' : 'text-white/70 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Alterar Senha</span>
          </button>
        </div>

        {/* Tab 1: MFA */}
        {activeTab === 'mfa' && (
          <div className="space-y-4 text-xs">
            {mfaSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{mfaSuccessMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {isMfaEnrolled ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>MFA TOTP Ativo e Protegido</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    AAL2 ATIVO
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Sua conta está protegida por um segundo fator de autenticação. Sempre que realizar login ou ações críticas societárias, será solicitado o código do seu aplicativo autenticador.
                </p>
                {mfaFactors.map(factor => (
                  <div key={factor.id} className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[11px] font-mono">Fator ID: {factor.id.slice(0, 8)}...</span>
                    <button
                      type="button"
                      onClick={() => handleUnenroll(factor.id)}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded-xl transition-colors flex items-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Desativar MFA</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : enrollmentData ? (
              <form onSubmit={handleVerifyEnrollment} className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <p className="font-semibold text-slate-200">1. Escaneie o QR Code no seu aplicativo autenticador</p>
                  
                  {/* QR Code Render */}
                  <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto">
                    <img
                      src={enrollmentData.qr_code}
                      alt="MFA QR Code"
                      className="w-44 h-44 mx-auto block"
                    />
                  </div>

                  {/* Secret Backup */}
                  <div className="pt-1">
                    <p className="text-[11px] text-slate-400 pb-1.5">Ou digite o código manual no app:</p>
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300">
                      <span>{enrollmentData.secret}</span>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2: Code Verification */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">2. Digite o código de 6 dígitos gerado pelo app:</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-lg font-mono tracking-widest text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEnrollmentData(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying || verificationCode.length !== 6}
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
                  >
                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Confirmar e Ativar</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <Key className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200">Aumente a proteção do seu patrimônio</h3>
                  <p className="text-slate-400 leading-relaxed text-xs max-w-sm mx-auto">
                    A Autenticação em 2 Etapas adiciona uma camada extra de segurança impedindo acessos não autorizados mesmo que sua senha seja descoberta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartEnrollment}
                  disabled={isEnrolling}
                  className="py-3 px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all inline-flex items-center space-x-2"
                >
                  {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                  <span>Configurar Autenticador TOTP</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Password Change */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            {passwordSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {(passwordLocalError || error) && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{passwordLocalError || error}</span>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Nova Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 12 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 pl-10 pr-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Confirmar Nova Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 pl-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword || !newPassword || !confirmPassword}
              className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 pt-2"
            >
              {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Atualizar Minha Senha</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
