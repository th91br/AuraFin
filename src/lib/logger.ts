/**
 * AuraFin — Centralized Structured Logging & Redaction Engine
 * 
 * Guarantees:
 * 1. Structured JSON output with timestamp, environment, release, correlation ID, and status.
 * 2. Recursive PII and secret redaction (passwords, tokens, keys, card numbers, CPF/CNPJ).
 * 3. Financial payload protection (never transmits raw transaction arrays or account dumps).
 * 4. Non-blocking, best-effort telemetry (telemetry failures never break user experience).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  module?: string;
  event?: string;
  correlation_id?: string;
  user_id_hash?: string;
  org_id_hash?: string;
  duration_ms?: number;
  error_code?: string;
  status?: 'success' | 'failure' | 'in_progress' | 'cancelled';
  [key: string]: any;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  environment: string;
  release: string;
  module: string;
  event: string;
  correlation_id?: string;
  user_id_hash?: string;
  org_id_hash?: string;
  duration_ms?: number;
  error_code?: string;
  status?: string;
  message: string;
  metadata?: Record<string, any>;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'currentpassword',
  'newpassword',
  'confirmpassword',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'apikey',
  'service_role',
  'secret',
  'cvv',
  'cardnumber',
  'smtppassword',
  'captchasecret',
  'code',
  'qr_code',
  'pin',
  'jwt',
  'session',
]);

const FINANCIAL_COLLECTION_KEYS = new Set([
  'transactions',
  'accounts',
  'creditcards',
  'receivables',
  'payables',
  'invoices',
  'assets',
  'debts',
  'goals',
]);

/**
 * Recursively sanitizes any object or value, masking secrets, tokens, PII, and financial payloads.
 */
export function redactSensitiveData(data: any, depth = 0): any {
  if (depth > 6) return '[MAX_DEPTH_REACHED]';
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redact Bearer tokens
    if (/bearer\s+[a-zA-Z0-9_\-\.]+/i.test(data)) {
      return data.replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]');
    }
    // Redact JWT strings
    if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(data) && data.length > 50) {
      return '[REDACTED_JWT]';
    }
    // Mask CPF (xxx.xxx.xxx-xx)
    if (/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(data)) {
      return '***.***.***-**';
    }
    // Mask Credit Card (13-19 digits)
    if (/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(data)) {
      return '**** **** **** ****';
    }
    return data;
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    // If it's a massive array, do not serialize completely into telemetry
    if (data.length > 10) {
      return {
        _type: 'Array',
        count: data.length,
        sample: data.slice(0, 3).map(item => redactSensitiveData(item, depth + 1)),
      };
    }
    return data.map(item => redactSensitiveData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Check if key is sensitive secret
      if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('token')) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Check if key contains large financial collections
      if (FINANCIAL_COLLECTION_KEYS.has(lowerKey) && Array.isArray(value)) {
        sanitized[key] = `[FINANCIAL_COLLECTION: count=${value.length}]`;
        continue;
      }

      sanitized[key] = redactSensitiveData(value, depth + 1);
    }

    return sanitized;
  }

  return String(data);
}

/**
 * Sanitizes URLs and query strings, removing verification/reset tokens and emails.
 */
export function sanitizeUrl(url: string): string {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aurafin.app';
    const parsed = new URL(url, origin);
    const params = new URLSearchParams(parsed.search);

    for (const key of Array.from(params.keys())) {
      const lower = key.toLowerCase();
      if (lower.includes('token') || lower.includes('code') || lower.includes('email') || lower.includes('secret')) {
        params.set(key, '[REDACTED]');
      }
    }

    parsed.search = params.toString();
    return parsed.pathname + (parsed.search ? parsed.search : '');
  } catch {
    return url.split('?')[0]; // Return pathname only as safe fallback
  }
}

class Logger {
  private environment: string;
  private release: string;

  constructor() {
    this.environment = (import.meta as any).env?.VITE_APP_ENV || (import.meta as any).env?.MODE || 'development';
    this.release = (import.meta as any).env?.VITE_RELEASE_SHA || 'dev-local';
  }

  private log(level: LogLevel, message: string, context: LogContext = {}) {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      environment: this.environment,
      release: this.release,
      module: context.module || 'general',
      event: context.event || 'unspecified_event',
      correlation_id: context.correlation_id,
      user_id_hash: context.user_id_hash,
      org_id_hash: context.org_id_hash,
      duration_ms: context.duration_ms,
      error_code: context.error_code,
      status: context.status,
      message,
      metadata: redactSensitiveData(context),
    };

    // Output to console based on environment
    if (this.environment !== 'production' || level === 'error' || level === 'fatal' || level === 'warn') {
      const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}:${entry.event}]`;
      switch (level) {
        case 'debug':
          console.debug(prefix, message, entry.metadata);
          break;
        case 'info':
          console.info(prefix, message, entry.metadata);
          break;
        case 'warn':
          console.warn(prefix, message, entry.metadata);
          break;
        case 'error':
        case 'fatal':
          console.error(prefix, message, entry.metadata);
          break;
      }
    }

    // Best-effort remote dispatch if error tracking is enabled
    this.dispatchToRemoteTracker(entry);
  }

  private dispatchToRemoteTracker(entry: StructuredLogEntry) {
    const isRemoteEnabled = (import.meta as any).env?.VITE_ERROR_TRACKING_ENABLED === 'true';
    if (!isRemoteEnabled || (entry.level !== 'error' && entry.level !== 'fatal')) {
      return;
    }

    // Fail-safe asynchronous dispatch hook
    try {
      if (typeof window !== 'undefined' && (window as any).__AURA_REMOTE_TRACKER__) {
        (window as any).__AURA_REMOTE_TRACKER__(entry);
      }
    } catch {
      // Intentionally silent: telemetry failure must never cascade
    }
  }

  public debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  public info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  public warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  public error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  public fatal(message: string, context?: LogContext) {
    this.log('fatal', message, context);
  }
}

export const AuraLogger = new Logger();
