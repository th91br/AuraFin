import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { Database } from '../integrations/supabase/database.types';
import { AuraLogger } from '../lib/logger';
import {
  AUTH_PASSWORD_REQUIREMENTS_MESSAGE,
  validatePasswordStrength,
} from '../lib/authPolicy';
import {
  AuthErrorLike,
  getAuthErrorCode,
  mapAuthError,
  sanitizeAuthErrorMessage,
} from '../lib/authErrors';

export { validatePasswordStrength } from '../lib/authPolicy';

type Profile = Database['public']['Tables']['profiles']['Row'];

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
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  isPasswordRecoveryMode: boolean;
  aal: 'aal1' | 'aal2';
  mfaFactors: any[];
  isMfaEnrolled: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; requiresMfa: boolean }>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<{ success: boolean; requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  resendConfirmationEmail: (email: string) => Promise<boolean>;
  enrollMfa: () => Promise<MfaEnrollmentResponse>;
  verifyMfaEnrollment: (factorId: string, code: string) => Promise<void>;
  unenrollMfa: (factorId: string) => Promise<void>;
  challengeAndVerifyMfa: (code: string) => Promise<void>;
  clearError: () => void;
  exitPasswordRecoveryMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function createCorrelationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `auth-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function authFailureContext(operation: string, correlationId: string, startedAt: number, authError: AuthErrorLike) {
  return {
    module: 'auth',
    event: `${operation}_failed`,
    correlation_id: correlationId,
    duration_ms: Math.round(performance.now() - startedAt),
    error_code: getAuthErrorCode(authError),
    error_status: authError.status ?? null,
    error_name: authError.name ?? null,
    error_message: sanitizeAuthErrorMessage(authError),
    status: 'failure' as const,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState<boolean>(false);
  const [aal, setAal] = useState<'aal1' | 'aal2'>('aal1');
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const authUserScopeRef = useRef<string | null>(null);
  const hydrationSequenceRef = useRef(0);

  const exitPasswordRecoveryMode = () => {
    setIsPasswordRecoveryMode(false);
    const cleanUrl = new URL(window.location.href);
    cleanUrl.hash = '';
    cleanUrl.searchParams.delete('code');
    cleanUrl.searchParams.delete('error');
    cleanUrl.searchParams.delete('error_code');
    cleanUrl.searchParams.delete('error_description');
    window.history.replaceState({}, document.title, `${cleanUrl.pathname}${cleanUrl.search}`);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error: profErr } = await supabase
        .from('profiles')
        .select('id,full_name,avatar_url,preferred_context,privacy_mode_default,created_at,updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (authUserScopeRef.current !== userId) return;

      if (profErr) {
        setProfile(null);
        AuraLogger.warn('[AuthProvider] Erro ao buscar perfil', {
          module: 'auth',
          event: 'fetch_profile_failed',
          error_code: profErr.code,
          error_message: sanitizeAuthErrorMessage(profErr),
          status: 'failure',
        });
      } else if (!data) {
        setProfile(null);
        AuraLogger.warn('[AuthProvider] Perfil autenticado não encontrado', {
          module: 'auth',
          event: 'profile_missing',
          status: 'failure',
        });
      } else {
        setProfile(data);
      }
    } catch (e: any) {
      if (authUserScopeRef.current !== userId) return;
      setProfile(null);
      AuraLogger.warn('[AuthProvider] Exceção ao buscar perfil', {
        module: 'auth',
        event: 'fetch_profile_exception',
        error_code: getAuthErrorCode(e),
        error_message: sanitizeAuthErrorMessage(e),
        status: 'failure',
      });
    }
  };

  const checkMfaStatus = async (userId?: string) => {
    try {
      const { data, error: mfaErr } = await supabase.auth.mfa.listFactors();
      if (userId && authUserScopeRef.current !== userId) return;
      if (!mfaErr && data) {
        const verifiedFactors = data.totp.filter(f => f.status === 'verified');
        setMfaFactors(verifiedFactors);
      }
      
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (userId && authUserScopeRef.current !== userId) return;
      if (aalData) {
        setAal(aalData.currentLevel as 'aal1' | 'aal2');
      }
    } catch (e: any) {
      AuraLogger.warn('[AuthProvider] Erro ao verificar status MFA', { module: 'auth', event: 'check_mfa_failed', error: e?.message });
    }
  };

  const scheduleSessionHydration = (userId: string, event: string, isMounted: () => boolean) => {
    const sequence = ++hydrationSequenceRef.current;
    window.setTimeout(() => {
      if (!isMounted() || authUserScopeRef.current !== userId || hydrationSequenceRef.current !== sequence) return;

      void Promise.all([fetchProfile(userId), checkMfaStatus(userId)]).then(() => {
        if (!isMounted() || authUserScopeRef.current !== userId || hydrationSequenceRef.current !== sequence) return;
        AuraLogger.info('[AuthProvider] Contexto autenticado carregado', {
          module: 'auth',
          event: 'session_hydrated',
          auth_event: event,
          status: 'success',
        });
      });
    }, 0);
  };

  useEffect(() => {
    let mounted = true;

    const recoveryType = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('type');
    if (recoveryType === 'recovery') {
      setIsPasswordRecoveryMode(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;

      const nextUserId = currentSession?.user.id ?? null;
      const userChanged = authUserScopeRef.current !== nextUserId;
      authUserScopeRef.current = nextUserId;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (userChanged) {
        hydrationSequenceRef.current += 1;
        setProfile(null);
        setMfaFactors([]);
        setAal('aal1');
      }

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecoveryMode(true);
      }

      if (
        currentSession?.user
        && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION' || event === 'PASSWORD_RECOVERY')
      ) {
        scheduleSessionHydration(currentSession.user.id, event, () => mounted);
      }

      if (event === 'SIGNED_OUT') {
        setIsPasswordRecoveryMode(false);
      }

      setIsInitializing(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<{ success: boolean; requiresMfa: boolean }> => {
    setError(null);
    setIsLoading(true);
    const correlationId = createCorrelationId();
    const startedAt = performance.now();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: pass,
      });

      if (authError) {
        setError(mapAuthError(authError, 'login'));
        AuraLogger.warn('[AuthProvider] Falha no login', authFailureContext('sign_in', correlationId, startedAt, authError));
        return { success: false, requiresMfa: false };
      }

      AuraLogger.info('[AuthProvider] Login concluído', {
        module: 'auth',
        event: 'sign_in_succeeded',
        correlation_id: correlationId,
        duration_ms: Math.round(performance.now() - startedAt),
        status: 'success',
      });

      // AAL1 is sufficient for normal login. Sensitive operations request AAL2
      // through their own MFA challenge and remain protected by database policy.
      return { success: true, requiresMfa: false };
    } catch (caughtError: any) {
      setError(mapAuthError(caughtError, 'login'));
      AuraLogger.warn('[AuthProvider] Exceção no login', authFailureContext('sign_in', correlationId, startedAt, caughtError));
      return { success: false, requiresMfa: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string): Promise<{ success: boolean; requiresEmailConfirmation: boolean }> => {
    setError(null);
    setIsLoading(true);
    const correlationId = createCorrelationId();
    const startedAt = performance.now();
    try {
      const strength = validatePasswordStrength(pass);
      if (!strength.isValid) {
        setError(AUTH_PASSWORD_REQUIREMENTS_MESSAGE);
        return { success: false, requiresEmailConfirmation: false };
      }

      const normalizedEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();
      if (!normalizedEmail || !cleanName) {
        setError('Informe nome completo e e-mail válidos.');
        return { success: false, requiresEmailConfirmation: false };
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: pass,
        options: {
          data: { full_name: cleanName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) {
        setError(mapAuthError(authError, 'signup'));
        AuraLogger.warn('[AuthProvider] Falha no cadastro', authFailureContext('sign_up', correlationId, startedAt, authError));
        return { success: false, requiresEmailConfirmation: false };
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        const duplicateError = { code: 'user_already_exists', status: 422, name: 'AuthApiError', message: 'Existing account' };
        setError(mapAuthError(duplicateError, 'signup'));
        AuraLogger.warn('[AuthProvider] Cadastro duplicado', authFailureContext('sign_up', correlationId, startedAt, duplicateError));
        return { success: false, requiresEmailConfirmation: false };
      }

      const requiresEmailConfirmation = !data.session && !!data.user;
      const success = !!data.user;
      AuraLogger.info('[AuthProvider] Cadastro aceito pelo Supabase', {
        module: 'auth',
        event: 'sign_up_succeeded',
        correlation_id: correlationId,
        duration_ms: Math.round(performance.now() - startedAt),
        confirmation_required: requiresEmailConfirmation,
        status: 'success',
      });
      return { success, requiresEmailConfirmation };
    } catch (caughtError: any) {
      setError(mapAuthError(caughtError, 'signup'));
      AuraLogger.warn('[AuthProvider] Exceção no cadastro', authFailureContext('sign_up', correlationId, startedAt, caughtError));
      return { success: false, requiresEmailConfirmation: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    setIsLoading(true);
    const correlationId = createCorrelationId();
    const startedAt = performance.now();
    try {
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
      if (signOutError) {
        AuraLogger.warn('[AuthProvider] Revogação global de sessão falhou', authFailureContext('sign_out', correlationId, startedAt, signOutError));
        await supabase.auth.signOut({ scope: 'local' });
        setError('A sessão foi encerrada neste dispositivo, mas a revogação global não pôde ser confirmada.');
      }

      authUserScopeRef.current = null;
      hydrationSequenceRef.current += 1;
      setUser(null);
      setSession(null);
      setProfile(null);
      setMfaFactors([]);
      setAal('aal1');
      localStorage.removeItem('aurafin_active_org_pref_v1');
      AuraLogger.info('[AuthProvider] Logout concluído', {
        module: 'auth',
        event: 'sign_out_succeeded',
        correlation_id: correlationId,
        duration_ms: Math.round(performance.now() - startedAt),
        status: 'success',
      });
    } catch (caughtError: any) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        localStorage.removeItem('aurafin_auth_session');
      }
      authUserScopeRef.current = null;
      hydrationSequenceRef.current += 1;
      setUser(null);
      setSession(null);
      setProfile(null);
      setMfaFactors([]);
      setAal('aal1');
      localStorage.removeItem('aurafin_active_org_pref_v1');
      setError('A sessão local foi limpa, mas o servidor não confirmou o logout.');
      AuraLogger.error('[AuthProvider] Erro ao fazer logout', authFailureContext('sign_out', correlationId, startedAt, caughtError));
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    const correlationId = createCorrelationId();
    const startedAt = performance.now();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: window.location.origin,
      });
      if (authError) {
        setError(mapAuthError(authError, 'recovery'));
        AuraLogger.warn('[AuthProvider] Falha na solicitação de reset de senha', authFailureContext('password_reset_request', correlationId, startedAt, authError));
        return false;
      }

      AuraLogger.info('[AuthProvider] Solicitação de reset aceita', {
        module: 'auth',
        event: 'password_reset_request_succeeded',
        correlation_id: correlationId,
        duration_ms: Math.round(performance.now() - startedAt),
        status: 'success',
      });
      return true;
    } catch (caughtError: any) {
      setError(mapAuthError(caughtError, 'recovery'));
      AuraLogger.warn('[AuthProvider] Exceção na solicitação de reset', authFailureContext('password_reset_request', correlationId, startedAt, caughtError));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    const correlationId = createCorrelationId();
    const startedAt = performance.now();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error: authError } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (authError) {
        setError(mapAuthError(authError, 'resend'));
        AuraLogger.warn('[AuthProvider] Falha ao reenviar confirmação', authFailureContext('confirmation_resend', correlationId, startedAt, authError));
        return false;
      }

      return true;
    } catch (caughtError: any) {
      setError(mapAuthError(caughtError, 'resend'));
      AuraLogger.warn('[AuthProvider] Exceção ao reenviar confirmação', authFailureContext('confirmation_resend', correlationId, startedAt, caughtError));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    const correlationId = createCorrelationId();
    const startedAt = performance.now();
    try {
      const strength = validatePasswordStrength(newPassword);
      if (!strength.isValid) {
        setError(AUTH_PASSWORD_REQUIREMENTS_MESSAGE);
        return false;
      }

      const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
      if (authError) {
        setError(mapAuthError(authError, 'update_password'));
        AuraLogger.warn('[AuthProvider] Falha ao atualizar senha', authFailureContext('password_update', correlationId, startedAt, authError));
        return false;
      }

      exitPasswordRecoveryMode();
      AuraLogger.info('[AuthProvider] Senha atualizada', {
        module: 'auth',
        event: 'password_update_succeeded',
        correlation_id: correlationId,
        duration_ms: Math.round(performance.now() - startedAt),
        status: 'success',
      });
      return true;
    } catch (caughtError: any) {
      setError(mapAuthError(caughtError, 'update_password'));
      AuraLogger.warn('[AuthProvider] Exceção ao atualizar senha', authFailureContext('password_update', correlationId, startedAt, caughtError));
      return false;
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
        isInitializing,
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
        exitPasswordRecoveryMode,
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
