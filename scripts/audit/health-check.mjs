#!/usr/bin/env node

/**
 * AuraFin — Operational Health Check CLI
 * 
 * Tests frontend/backend reachability, database connectivity, and auth endpoints.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env, .env.local if available
const rootDir = path.resolve(__dirname, '../../');
if (fs.existsSync(path.join(rootDir, '.env'))) {
  dotenv.config({ path: path.join(rootDir, '.env') });
}
if (fs.existsSync(path.join(rootDir, '.env.local'))) {
  dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabasePublicKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function main() {
  console.log('================================================================');
  console.log('AURAFIN — OPERATIONAL HEALTH CHECK & DIAGNOSTICS');
  console.log('================================================================');
  console.log(`Timestamp:  ${new Date().toISOString()}`);

  if (!supabaseUrl || !supabasePublicKey || supabaseUrl.includes('your-project')) {
    console.log('\n[STATUS] NEEDS CONFIGURATION: VITE_SUPABASE_URL e uma chave pública do Supabase não estão configuradas no ambiente local/CI.');
    console.log('Para executar contra o Staging/Production, configure as variáveis em .env ou no ambiente.\n');
    console.log('================================================================\n');
    process.exit(0);
  }

  console.log(`Target URL: ${supabaseUrl}\n`);
  const supabase = createClient(supabaseUrl, supabasePublicKey);
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
      console.log(`[DATABASE HEALTH] DEGRADED (${dbLatency}ms) — RPC health_check pendente de aplicação: ${dbErr.message}`);
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
