import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePublicBuildEnvironment } from '../../scripts/deployment/public-env-validation.mjs';

const publishableKey = `sb_publishable_${'a'.repeat(32)}`;

function legacyJwt(role) {
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ role })}.signature`;
}

test('accepts a local development environment', () => {
  const result = validatePublicBuildEnvironment({
    VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
    VITE_SUPABASE_ANON_KEY: publishableKey,
    VITE_APP_ENV: 'development',
  });

  assert.equal(result.hostname, '127.0.0.1');
  assert.equal(result.keyType, 'publishable');
});

test('accepts a hardened Vercel production environment', () => {
  const result = validatePublicBuildEnvironment({
    VERCEL: '1',
    VERCEL_ENV: 'production',
    VITE_APP_ENV: 'production',
    VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  });

  assert.equal(result.appEnvironment, 'production');
  assert.equal(result.keyVariable, 'VITE_SUPABASE_PUBLISHABLE_KEY');
});

test('prefers the modern publishable variable while retaining legacy compatibility', () => {
  const result = validatePublicBuildEnvironment({
    VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    VITE_SUPABASE_ANON_KEY: legacyJwt('anon'),
  });

  assert.equal(result.keyType, 'publishable');
  assert.equal(result.keyVariable, 'VITE_SUPABASE_PUBLISHABLE_KEY');
});

test('accepts a legacy anon JWT', () => {
  const result = validatePublicBuildEnvironment({
    VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
    VITE_SUPABASE_ANON_KEY: legacyJwt('anon'),
  });

  assert.equal(result.keyType, 'legacy-anon');
});

test('rejects a missing Supabase URL', () => {
  assert.throws(
    () => validatePublicBuildEnvironment({ VITE_SUPABASE_ANON_KEY: publishableKey }),
    /VITE_SUPABASE_URL is required/,
  );
});

test('rejects remote HTTP endpoints', () => {
  assert.throws(
    () =>
      validatePublicBuildEnvironment({
        VITE_SUPABASE_URL: 'http://project-ref.supabase.co',
        VITE_SUPABASE_ANON_KEY: publishableKey,
      }),
    /must use HTTPS/,
  );
});

test('rejects local endpoints on Vercel', () => {
  assert.throws(
    () =>
      validatePublicBuildEnvironment({
        VERCEL: '1',
        VERCEL_ENV: 'production',
        VITE_APP_ENV: 'production',
        VITE_SUPABASE_URL: 'http://localhost:54321',
        VITE_SUPABASE_ANON_KEY: publishableKey,
      }),
    /cannot point to a local Supabase URL/,
  );
});

test('rejects deployed hosts not covered by the Content Security Policy', () => {
  assert.throws(
    () =>
      validatePublicBuildEnvironment({
        VERCEL: '1',
        VERCEL_ENV: 'production',
        VITE_APP_ENV: 'production',
        VITE_SUPABASE_URL: 'https://supabase.internal.example.com',
        VITE_SUPABASE_ANON_KEY: publishableKey,
      }),
    /not covered by the current Content Security Policy/,
  );
});

test('rejects secret and service-role keys', () => {
  for (const key of ['sb_secret_sensitive', 'sb_service_role_sensitive', legacyJwt('service_role')]) {
    assert.throws(
      () =>
        validatePublicBuildEnvironment({
          VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
          VITE_SUPABASE_ANON_KEY: key,
        }),
      /secret\/service-role|anon role/,
    );
  }
});

test('rejects an unsafe secondary key even when the preferred key is safe', () => {
  assert.throws(
    () =>
      validatePublicBuildEnvironment({
        VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
        VITE_SUPABASE_ANON_KEY: 'sb_secret_sensitive',
      }),
    /secret\/service-role/,
  );
});

test('requires at least one supported public-key variable', () => {
  assert.throws(
    () => validatePublicBuildEnvironment({ VITE_SUPABASE_URL: 'https://project-ref.supabase.co' }),
    /VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY is required/,
  );
});

test('rejects a placeholder publishable key', () => {
  assert.throws(
    () =>
      validatePublicBuildEnvironment({
        VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_your-public-key-here',
      }),
    /placeholder value/,
  );
});

test('requires staging semantics for Vercel previews', () => {
  assert.throws(
    () =>
      validatePublicBuildEnvironment({
        VERCEL: '1',
        VERCEL_ENV: 'preview',
        VITE_APP_ENV: 'production',
        VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
        VITE_SUPABASE_ANON_KEY: publishableKey,
      }),
    /must be staging/,
  );
});

test('rejects runtime compatibility flags in deployments', () => {
  for (const flag of ['VITE_ENABLE_DEMO_MODE', 'VITE_ENABLE_LEGACY_IMPORT']) {
    assert.throws(
      () =>
        validatePublicBuildEnvironment({
          VERCEL: '1',
          VERCEL_ENV: 'production',
          VITE_APP_ENV: 'production',
          VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
          VITE_SUPABASE_ANON_KEY: publishableKey,
          [flag]: 'true',
        }),
      new RegExp(`${flag}=true is forbidden`),
    );
  }
});
