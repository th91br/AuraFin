const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
const APP_ENVIRONMENTS = new Set(['development', 'staging', 'production']);

function fail(message) {
  throw new Error(`[build-env] ${message}`);
}

function decodeLegacyRole(key, variableName) {
  const parts = key.split('.');
  if (parts.length !== 3) {
    fail(`${variableName} is not a valid legacy JWT.`);
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload.role;
  } catch {
    fail(`${variableName} is not a valid legacy JWT.`);
  }
}

function validateSupabaseUrl(rawValue, isVercelDeployment) {
  const value = rawValue?.trim();
  if (!value) {
    fail('VITE_SUPABASE_URL is required. Configure it in Vercel for every environment.');
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    fail('VITE_SUPABASE_URL must be a valid absolute URL.');
  }

  const isLocal = LOCAL_HOSTNAMES.has(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLocal)) {
    fail('VITE_SUPABASE_URL must use HTTPS outside local development.');
  }
  if (isVercelDeployment && isLocal) {
    fail('A Vercel deployment cannot point to a local Supabase URL.');
  }
  if (isVercelDeployment && !parsed.hostname.endsWith('.supabase.co')) {
    fail('The deployed Supabase hostname is not covered by the current Content Security Policy.');
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    fail('VITE_SUPABASE_URL must not contain credentials, query parameters, or fragments.');
  }
  if (/your-project|example\.supabase/i.test(parsed.hostname)) {
    fail('VITE_SUPABASE_URL still contains a placeholder hostname.');
  }

  return { hostname: parsed.hostname };
}

function validateSupabasePublicKey(rawValue, variableName) {
  const key = rawValue?.trim();
  if (!key) {
    fail(`${variableName} is required. Configure a publishable or legacy anon key.`);
  }
  if (/your-(?:anon|public|publishable)-key|placeholder/i.test(key)) {
    fail(`${variableName} still contains a placeholder value.`);
  }
  if (key.startsWith('sb_secret_') || key.startsWith('sb_service_role_')) {
    fail('A secret/service-role key must never be embedded in the browser bundle.');
  }

  if (key.startsWith('sb_publishable_')) {
    if (key.length < 24) {
      fail(`${variableName} is not a valid publishable key.`);
    }
    return 'publishable';
  }

  if (key.startsWith('eyJ')) {
    if (decodeLegacyRole(key, variableName) !== 'anon') {
      fail('A legacy browser key must contain the anon role.');
    }
    return 'legacy-anon';
  }

  fail(`${variableName} must be a publishable or legacy anon key.`);
}

function selectSupabasePublicKey(env) {
  const candidates = [
    ['VITE_SUPABASE_PUBLISHABLE_KEY', env.VITE_SUPABASE_PUBLISHABLE_KEY],
    ['VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY],
  ];
  const configured = candidates.filter(([, value]) => Boolean(value?.trim()));

  if (configured.length === 0) {
    fail(
      'VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY is required. Configure a browser-safe public key.',
    );
  }

  const validated = configured.map(([variableName, value]) => ({
    keyType: validateSupabasePublicKey(value, variableName),
    variableName,
  }));

  return validated[0];
}

function expectedAppEnvironment(env) {
  if (env.VERCEL_ENV === 'production' || env.VERCEL_TARGET_ENV === 'production') {
    return 'production';
  }
  if (env.VERCEL_ENV === 'preview' || env.VERCEL_TARGET_ENV === 'preview' || env.VERCEL_TARGET_ENV === 'staging') {
    return 'staging';
  }
  if (env.VERCEL_ENV === 'development' || env.VERCEL_TARGET_ENV === 'development') {
    return 'development';
  }
  return undefined;
}

export function validatePublicBuildEnvironment(env) {
  const isVercelDeployment = env.VERCEL === '1' || Boolean(env.VERCEL_ENV || env.VERCEL_TARGET_ENV);
  const appEnvironment = env.VITE_APP_ENV?.trim();
  const { hostname } = validateSupabaseUrl(env.VITE_SUPABASE_URL, isVercelDeployment);
  const { keyType, variableName: keyVariable } = selectSupabasePublicKey(env);

  if (appEnvironment && !APP_ENVIRONMENTS.has(appEnvironment)) {
    fail('VITE_APP_ENV must be development, staging, or production.');
  }

  const expectedEnvironment = expectedAppEnvironment(env);
  if (isVercelDeployment && !appEnvironment) {
    fail('VITE_APP_ENV is required on Vercel. Use production for Production and staging for Preview.');
  }
  if (expectedEnvironment && appEnvironment !== expectedEnvironment) {
    fail(`VITE_APP_ENV must be ${expectedEnvironment} for this Vercel environment.`);
  }

  for (const flag of ['VITE_ENABLE_DEMO_MODE', 'VITE_ENABLE_LEGACY_IMPORT']) {
    if (env[flag]?.trim().toLowerCase() === 'true' && (isVercelDeployment || appEnvironment !== 'development')) {
      fail(`${flag}=true is forbidden in deployed/non-development builds.`);
    }
  }

  return { appEnvironment: appEnvironment || 'development', hostname, keyType, keyVariable };
}
