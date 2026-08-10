import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { Database } from '../integrations/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isPasswordRecoveryMode: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
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
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsPasswordRecoveryMode(false);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (err) {
        setError(err.message.includes('Invalid login credentials') ? 'E-mail ou senha incorretos.' : err.message);
      }
    } catch (e) {
      setError('Erro de conexão ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { full_name: fullName }
        }
      });
      if (err) {
        setError(err.message);
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
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (err) setError(err.message);
    } catch (e) {
      setError('Erro de conexão ao solicitar recuperação de senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setError(null);
    setIsLoading(true);
    try {
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
        signInWithEmail,
        signUpWithEmail,
        signOut,
        requestPasswordReset,
        updatePassword,
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
