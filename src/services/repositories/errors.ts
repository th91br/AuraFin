// Central Domain & Repository Error Handling
export class RepositoryError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class UnauthorizedError extends RepositoryError {
  constructor(message = 'Você não possui permissão para realizar esta ação.', originalError?: unknown) {
    super(message, originalError);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends RepositoryError {
  constructor(message = 'Dados inválidos para esta operação.', originalError?: unknown) {
    super(message, originalError);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends RepositoryError {
  constructor(message = 'Falha de conexão com os servidores do Supabase. Verifique sua internet e tente novamente.', originalError?: unknown) {
    super(message, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Normaliza erros brutos do Supabase/PostgREST para erros de domínio legíveis
 */
export function normalizeSupabaseError(error: unknown, fallbackMessage: string): RepositoryError {
  if (!error) return new RepositoryError(fallbackMessage);

  const errObj = error as { code?: string; message?: string; details?: string };
  const code = errObj.code || '';
  const message = errObj.message || '';

  // PostgREST / PostgreSQL error codes
  if (code === '42501' || message.includes('row-level security') || message.includes('permission denied')) {
    return new UnauthorizedError('Permissão negada pelo banco de dados (RLS). Acesso não autorizado.', error);
  }

  if (code === '23505') {
    return new ValidationError('Este registro já existe ou possui chave duplicada no sistema.', error);
  }

  if (code === '23503') {
    return new ValidationError('Operação não permitida: registro vinculado a outro cadastro.', error);
  }

  if (message.includes('FetchError') || message.includes('Failed to fetch') || message.includes('network')) {
    return new NetworkError('Erro de rede ao comunicar com o Supabase.', error);
  }

  return new RepositoryError(message || fallbackMessage, error);
}
