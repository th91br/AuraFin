import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { Database } from '../integrations/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0 to 4
  message: string;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length >= 8) score++;
  if (hasMinLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber && hasSpecial) score++;

  let message = 'Senha fraca';
  if (score === 2) message = 'Senha razoável';
  if (score === 3) message = 'Senha boa';
  if (score === 4) message = 'Senha forte';

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  return {
    isValid,
    score,
    message,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}

interface MfaEnrollmentResponse {
  id: string;
  type: string;
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isPasswordRecoveryMode: boolean;
  aal: 'aal1' | 'aal2';
  mfaFactors: any[];
  isMfaEnrolled: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ requiresMfa: boolean }>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  enrollMfa: () => Promise<MfaEnrollmentResponse>;
  verifyMfaEnrollment: (factorId: string, code: string) => Promise<void>;
  unenrollMfa: (factorId: string) => Promise<void>;
  challengeAndVerifyMfa: (code: string) => Promise<void>;
  clearError: () => void;
  exitPasswordRecoveryMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState<boolean>(false);
  const [aal, setAal] = useState<'aal1' | 'aal2'>('aal1');
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profErr) {
        console.warn('[AuthProvider] Erro ao buscar perfil:', profErr.message);
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.warn('[AuthProvider] Exceção ao buscar perfil:', e);
    }
  };

  const checkMfaStatus = async () => {
    try {
      const { data, error: mfaErr } = await supabase.auth.mfa.listFactors();
      if (!mfaErr && data) {
        const verifiedFactors = data.totp.filter(f => f.status === 'verified');
        setMfaFactors(verifiedFactors);
      }
      
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData) {
        setAal(aalData.currentLevel as 'aal1' | 'aal2');
      }
    } catch (e) {
      console.warn('[AuthProvider] Erro ao verificar status MFA:', e);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session: initSession }, error: initErr }) => {
      if (!mounted) return;
      if (initErr) {
        setError(initErr.message);
      }
      setSession(initSession);
      setUser(initSession?.user ?? null);
      if (initSession?.user) {
        fetchProfile(initSession.user.id);
        checkMfaStatus();
      }
      setIsLoading(false);
    });

    // Auth State Change Subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecoveryMode(true);
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
          await checkMfaStatus();
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
        setMfaFactors([]);
        setAal('aal1');
        setIsPasswordRecoveryMode(false);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<{ requiresMfa: boolean }> => {
    setError(null);
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: pass,
      });

      if (err) {
        if (err.message.includes('Invalid login credentials') || err.message.includes('invalid_grant')) {
          setError('E-mail ou senha incorretos.');
        } else if (err.message.includes('Email not confirmed')) {
          setError('Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.');
        } else if (err.message.includes('rate limit') || err.status === 429) {
          setError('Muitas tentativas de acesso. Aguarde alguns instantes e tente novamente.');
        } else {
          setError('Falha ao autenticar. Verifique suas credenciais.');
        }
        return { requiresMfa: false };
      }

      // Check if user requires MFA challenge
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const requiresMfa = aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2';

      return { requiresMfa: !!requiresMfa };
    } catch (e) {
      setError('Erro de conexão ao realizar login. Tente novamente.');
      return { requiresMfa: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const strength = validatePasswordStrength(pass);
      if (!strength.isValid) {
        setError('A senha deve conter no mínimo 12 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.');
        return { requiresEmailConfirmation: false };
      }

      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: err } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: pass,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}`,
        },
      });

      if (err) {
        if (err.message.includes('User already registered')) {
          // Generic message to prevent enumeration while still guiding legitimate user
          setError('Se este e-mail já estiver registrado, acesse sua conta ou solicite a recuperação de senha.');
        } else if (err.status === 429) {
          setError('Muitas tentativas. Aguarde alguns instantes.');
        } else {
          setError(err.message);
        }
        return { requiresEmailConfirmation: false };
      }

      const requiresEmailConfirmation = !data.session && !!data.user;
      return { requiresEmailConfirmation };
    } catch (e) {
      setError('Erro de conexão ao criar conta.');
      return { requiresEmailConfirmation: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setMfaFactors([]);
      setAal('aal1');
    } catch (e) {
      console.error('[AuthProvider] Erro ao fazer logout:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error: err } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}`,
      });
      if (err) {
        if (err.status === 429) {
          setError('Muitas solicitações recentes. Aguarde alguns instantes.');
        } else {
          // Do not leak existence of email
          console.warn('[AuthProvider] Erro reset senha:', err.message);
        }
      }
    } catch (e) {
      setError('Erro ao solicitar recuperação de senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error: err } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      });
      if (err) {
        if (err.status === 429) {
          setError('Aguarde antes de solicitar um novo e-mail de confirmação.');
        } else {
          setError('Falha ao reenviar e-mail de confirmação.');
        }
      }
    } catch (e) {
      setError('Erro de conexão ao reenviar e-mail.');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const strength = validatePasswordStrength(newPassword);
      if (!strength.isValid) {
        setError('A nova senha deve ter no mínimo 12 caracteres e atender a todos os requisitos de segurança.');
        return;
      }

      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) {
        setError(err.message);
      } else {
        setIsPasswordRecoveryMode(false);
      }
    } catch (e) {
      setError('Erro ao atualizar senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const enrollMfa = async (): Promise<MfaEnrollmentResponse> => {
    setError(null);
    const { data, error: err } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'AuraFin',
    });
    if (err) throw err;
    return data as MfaEnrollmentResponse;
  };

  const verifyMfaEnrollment = async (factorId: string, code: string) => {
    setError(null);
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) throw challenge.error;

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: code.trim(),
    });
    if (verify.error) throw verify.error;

    await checkMfaStatus();
  };

  const unenrollMfa = async (factorId: string) => {
    setError(null);
    const { error: err } = await supabase.auth.mfa.unenroll({ factorId });
    if (err) throw err;
    await checkMfaStatus();
  };

  const challengeAndVerifyMfa = async (code: string) => {
    setError(null);
    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) throw factors.error;

    const totpFactor = factors.data.totp.find(f => f.status === 'verified');
    if (!totpFactor) throw new Error('Nenhum fator MFA TOTP encontrado para esta conta.');

    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
    if (challenge.error) throw challenge.error;

    const verify = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challenge.data.id,
      code: code.trim(),
    });
    if (verify.error) throw verify.error;

    setAal('aal2');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAuthenticated: !!session && !!user,
        isLoading,
        error,
        isPasswordRecoveryMode,
        aal,
        mfaFactors,
        isMfaEnrolled: mfaFactors.length > 0,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        requestPasswordReset,
        updatePassword,
        resendConfirmationEmail,
        enrollMfa,
        verifyMfaEnrollment,
        unenrollMfa,
        challengeAndVerifyMfa,
        clearError: () => setError(null),
        exitPasswordRecoveryMode: () => setIsPasswordRecoveryMode(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
