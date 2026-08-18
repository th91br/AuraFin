export interface AuthErrorLike {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
}

const NETWORK_ERROR_PATTERN = /failed to fetch|network|fetch failed|load failed/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

export function getAuthErrorCode(error: AuthErrorLike): string {
  if (error.code) return error.code;
  if (error.status === 429) return 'over_request_rate_limit';
  if (NETWORK_ERROR_PATTERN.test(error.message || '')) return 'network_error';
  return 'auth_unknown_error';
}

export function sanitizeAuthErrorMessage(error: AuthErrorLike): string {
  return (error.message || 'Auth error')
    .replace(EMAIL_PATTERN, '[REDACTED_EMAIL]')
    .replace(/bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .slice(0, 240);
}

export function mapAuthError(error: AuthErrorLike, operation: 'signup' | 'login' | 'recovery' | 'update_password' | 'resend'): string {
  const code = getAuthErrorCode(error);

  switch (code) {
    case 'weak_password':
      return 'A senha não atende aos requisitos de segurança. Use ao menos 8 caracteres, com maiúsculas, minúsculas e números.';
    case 'invalid_credentials':
    case 'invalid_grant':
      return 'E-mail ou senha incorretos.';
    case 'email_not_confirmed':
      return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Este e-mail já possui uma conta. Faça login ou recupere sua senha.';
    case 'signup_disabled':
      return 'Novos cadastros estão temporariamente indisponíveis.';
    case 'over_email_send_rate_limit':
      return 'Aguarde antes de solicitar um novo e-mail.';
    case 'over_request_rate_limit':
      return 'Muitas tentativas recentes. Aguarde alguns instantes e tente novamente.';
    case 'captcha_failed':
      return 'Não foi possível validar o CAPTCHA. Tente novamente.';
    case 'validation_failed':
      return 'Os dados informados não são válidos. Revise o formulário e tente novamente.';
    case 'network_error':
      return 'Não foi possível conectar ao Supabase. Verifique a conexão e a disponibilidade do ambiente.';
    case 'unexpected_failure':
    case 'database_error':
      return operation === 'signup'
        ? 'A conta não pôde ser concluída devido a uma falha interna. Tente novamente mais tarde.'
        : 'A operação de autenticação não pôde ser concluída.';
    default:
      if (operation === 'login') return 'Falha ao autenticar. Verifique suas credenciais.';
      if (operation === 'signup') return 'Não foi possível criar a conta.';
      if (operation === 'recovery' || operation === 'resend') return 'Não foi possível enviar o e-mail solicitado.';
      return 'Não foi possível atualizar a senha.';
  }
}
