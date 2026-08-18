/**
 * AuraFin — Telemetry, Error Normalization & Domain Invariants
 */

import { AuraLogger } from './logger';

export type ErrorCategory =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'VALIDATION_ERROR'
  | 'CONFLICT_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface NormalizedError {
  category: ErrorCategory;
  code: string;
  userMessage: string;
  originalMessage: string;
  isRecoverable: boolean;
  correlationId: string;
  supportReference: string;
}

/**
 * Generates a unique correlation ID for tracing operations across contexts and RPCs.
 */
export function generateCorrelationId(prefix = 'corr'): string {
  const rand = Math.random().toString(36).substring(2, 9);
  const time = Date.now().toString(36).substring(4);
  return `${prefix}_${time}${rand}`;
}

/**
 * Generates a short, human-friendly Support Error Reference (e.g. ERR-A7B8C9)
 * for users to report without disclosing sensitive technical details.
 */
export function generateSupportReference(prefix = 'ERR'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = '';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${ref}`;
}

/**
 * Normalizes any error object (PostgREST, GoTrue, JavaScript Exception) into a safe, structured format.
 */
export function normalizeError(error: any, correlationId?: string): NormalizedError {
  const corrId = correlationId || generateCorrelationId();
  const supportRef = generateSupportReference();
  const rawMsg = error?.message || (typeof error === 'string' ? error : 'Erro desconhecido');
  const code = error?.code || error?.status || 'UNKNOWN';

  let category: ErrorCategory = 'UNKNOWN_ERROR';
  let userMessage = 'Ocorreu uma falha inesperada. Tente novamente em alguns instantes.';
  let isRecoverable = true;

  const isBrowserOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

  // 1. Network / Offline
  if (isBrowserOffline || rawMsg.includes('Failed to fetch') || rawMsg.includes('NetworkError') || rawMsg.includes('ERR_CONNECTION')) {
    category = 'NETWORK_ERROR';
    userMessage = 'Sem conexão com a internet ou servidor inacessível. Verifique sua rede.';
  }
  // 2. Permission & RLS (42501)
  else if (code === '42501' || rawMsg.includes('row-level security') || rawMsg.includes('permission denied')) {
    category = 'PERMISSION_ERROR';
    userMessage = 'Você não possui autorização para executar esta ação nesta organização.';
    isRecoverable = false;
  }
  // 3. Auth & Session
  else if (code === 'PGRST301' || rawMsg.includes('JWT expired') || rawMsg.includes('invalid_grant') || rawMsg.includes('Invalid login')) {
    category = 'AUTH_ERROR';
    userMessage = 'Sua sessão expirou ou as credenciais são inválidas. Faça login novamente.';
  }
  // 4. Rate Limiting (429)
  else if (code === 429 || rawMsg.includes('rate limit')) {
    category = 'CONFLICT_ERROR';
    userMessage = 'Muitas requisições simultâneas. Por favor, aguarde alguns instantes.';
  }
  // 5. Validation & Input
  else if (code === '23502' || code === '23514' || rawMsg.includes('violates check constraint')) {
    category = 'VALIDATION_ERROR';
    userMessage = 'Os dados informados não atendem aos critérios de validação financeira.';
  }
  // 6. Server / Database
  else if (code.toString().startsWith('5') || rawMsg.includes('internal error')) {
    category = 'SERVER_ERROR';
    userMessage = 'Falha no processamento remoto. Nossa equipe técnica já foi notificada.';
  }

  return {
    category,
    code: String(code),
    userMessage,
    originalMessage: rawMsg,
    isRecoverable,
    correlationId: corrId,
    supportReference: supportRef,
  };
}

/**
 * Validates domain invariant: Monetary values must be finite, safe integers representing cents.
 */
export function checkMoneyInvariant(amountCents: number, contextDescription: string): boolean {
  const isInvalid = !Number.isFinite(amountCents) || Number.isNaN(amountCents) || !Number.isSafeInteger(amountCents);

  if (isInvalid) {
    AuraLogger.fatal('Violação crítica de invariante monetário detectada', {
      module: 'money_invariants',
      event: 'invalid_money_cents',
      contextDescription,
      amountCents: String(amountCents),
    });
    return false;
  }

  return true;
}

/**
 * Validates domain invariant: Tenant isolation guard against cross-organization or cross-user memory leakage.
 */
export function checkTenantIsolationInvariant(expectedTenantId: string, actualTenantId: string, resource: string): boolean {
  if (expectedTenantId !== actualTenantId) {
    AuraLogger.fatal('Violação crítica de isolamento de organização/inquilino', {
      module: 'security_invariants',
      event: 'cross_tenant_leak_blocked',
      resource,
      expectedTenantId,
      actualTenantId,
    });
    return false;
  }

  return true;
}
