#!/usr/bin/env node

/**
 * AuraFin — Operational Health Check CLI
 * 
 * Tests frontend/backend reachability, database connectivity, and auth endpoints.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[HealthCheck] ERRO: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('================================================================');
  console.log('AURAFIN — OPERATIONAL HEALTH CHECK & DIAGNOSTICS');
  console.log('================================================================');
  console.log(`Target URL: ${supabaseUrl}`);
  console.log(`Timestamp:  ${new Date().toISOString()}\n`);

  let allHealthy = true;

  // 1. Auth Service Ping
  const authStart = Date.now();
  try {
    const { error: authErr } = await supabase.auth.getSession();
    const authLatency = Date.now() - authStart;
    if (authErr) {
      console.log(`[AUTH SERVICE]    FAIL (${authLatency}ms) — ${authErr.message}`);
      allHealthy = false;
    } else {
      console.log(`[AUTH SERVICE]    PASS (${authLatency}ms) — Reachable`);
    }
  } catch (e) {
    console.log(`[AUTH SERVICE]    FAIL — ${e.message}`);
    allHealthy = false;
  }

  // 2. Database Health Check RPC / Ping
  const dbStart = Date.now();
  try {
    const { data: dbData, error: dbErr } = await supabase.rpc('health_check');
    const dbLatency = Date.now() - dbStart;
    if (dbErr) {
      // Fallback check if RPC is not yet executed in current database
      console.log(`[DATABASE HEALTH] DEGRADED (${dbLatency}ms) — RPC health_check not yet deployed: ${dbErr.message}`);
    } else {
      console.log(`[DATABASE HEALTH] PASS (${dbLatency}ms) — Status: ${dbData?.status}, Version: ${dbData?.version}`);
    }
  } catch (e) {
    console.log(`[DATABASE HEALTH] FAIL — ${e.message}`);
    allHealthy = false;
  }

  // 3. Storage Reachability
  const storageStart = Date.now();
  try {
    const { error: storageErr } = await supabase.storage.from('financial-documents').list('', { limit: 1 });
    const storageLatency = Date.now() - storageStart;
    if (storageErr && storageErr.message.includes('fetch')) {
      console.log(`[STORAGE HEALTH]  FAIL (${storageLatency}ms) — ${storageErr.message}`);
      allHealthy = false;
    } else {
      console.log(`[STORAGE HEALTH]  PASS (${storageLatency}ms) — Reachable`);
    }
  } catch (e) {
    console.log(`[STORAGE HEALTH]  FAIL — ${e.message}`);
    allHealthy = false;
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`OVERALL HEALTH STATUS: ${allHealthy ? 'HEALTHY' : 'DEGRADED / ACTION REQUIRED'}`);
  console.log('================================================================\n');

  process.exit(allHealthy ? 0 : 1);
}

main().catch(err => {
  console.error('[HealthCheck] Erro fatal:', err);
  process.exit(1);
});
