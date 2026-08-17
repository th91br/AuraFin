import { loadEnv } from 'vite';
import { validatePublicBuildEnvironment } from './public-env-validation.mjs';

const mode = process.env.VITE_MODE || 'production';
const fileEnvironment = loadEnv(mode, process.cwd(), '');
const environment = { ...fileEnvironment, ...process.env };

try {
  const result = validatePublicBuildEnvironment(environment);
  console.log(
    `[build-env] PASS environment=${result.appEnvironment} supabase_host=${result.hostname} key_type=${result.keyType}`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : '[build-env] Invalid build environment.');
  process.exit(1);
}
