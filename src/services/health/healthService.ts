/**
 * AuraFin — Dependency & Health Check Service
 */

import { supabase } from '../../integrations/supabase/client';
import { AuraLogger } from '../../lib/logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unavailable';
  timestamp: string;
  checks: {
    frontend: { status: 'healthy' | 'unavailable'; latencyMs: number };
    database: { status: 'healthy' | 'degraded' | 'unavailable'; latencyMs: number; error?: string };
    auth: { status: 'healthy' | 'unavailable'; latencyMs: number; error?: string };
    storage: { status: 'healthy' | 'unavailable'; latencyMs: number; error?: string };
  };
}

export class HealthService {
  /**
   * Executes a safe, minimal check across all core dependencies.
   */
  public static async runDiagnostics(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const result: HealthStatus = {
      status: 'healthy',
      timestamp,
      checks: {
        frontend: { status: 'healthy', latencyMs: 0 },
        database: { status: 'healthy', latencyMs: 0 },
        auth: { status: 'healthy', latencyMs: 0 },
        storage: { status: 'healthy', latencyMs: 0 },
      },
    };

    // 1. Database Check (via safe health_check RPC or minimal ping)
    const dbStart = performance.now();
    try {
      const { data, error } = await supabase.rpc('health_check' as any);
      result.checks.database.latencyMs = Math.round(performance.now() - dbStart);

      if (error) {
        result.checks.database.status = 'degraded';
        result.checks.database.error = 'Falha ao executar ping RPC';
        result.status = 'degraded';
      } else if (!data || (typeof data === 'object' && (data as any).status !== 'healthy')) {
        result.checks.database.status = 'degraded';
        result.status = 'degraded';
      }
    } catch (e: any) {
      result.checks.database.latencyMs = Math.round(performance.now() - dbStart);
      result.checks.database.status = 'unavailable';
      result.checks.database.error = 'Banco inacessível';
      result.status = 'unavailable';
    }

    // 2. Auth Service Check
    const authStart = performance.now();
    try {
      const { error } = await supabase.auth.getSession();
      result.checks.auth.latencyMs = Math.round(performance.now() - authStart);

      if (error) {
        result.checks.auth.status = 'unavailable';
        result.checks.auth.error = 'Serviço de autenticação retornou erro';
        result.status = 'degraded';
      }
    } catch {
      result.checks.auth.latencyMs = Math.round(performance.now() - authStart);
      result.checks.auth.status = 'unavailable';
      result.status = 'degraded';
    }

    // 3. Storage Reachability Check
    const storageStart = performance.now();
    try {
      const { error } = await supabase.storage.from('financial-documents').list('', { limit: 1 });
      result.checks.storage.latencyMs = Math.round(performance.now() - storageStart);

      // Note: 400 or empty is fine, network failure is unavailable
      if (error && error.message.includes('fetch')) {
        result.checks.storage.status = 'unavailable';
        result.checks.storage.error = 'Bucket inacessível';
        result.status = 'degraded';
      }
    } catch {
      result.checks.storage.latencyMs = Math.round(performance.now() - storageStart);
      result.checks.storage.status = 'unavailable';
      result.status = 'degraded';
    }

    AuraLogger.info('Diagnóstico de saúde executado', {
      module: 'health_check',
      event: 'diagnostics_run',
      health_status: result.status,
      status: result.status === 'healthy' ? 'success' : 'failure',
      db_latency_ms: result.checks.database.latencyMs,
      auth_latency_ms: result.checks.auth.latencyMs,
      storage_latency_ms: result.checks.storage.latencyMs,
    });

    return result;
  }
}
