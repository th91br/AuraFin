/**
 * AuraFin — Observability & Redaction Smoke Test
 * 
 * Verifies that:
 * 1. Recursive redaction masks passwords, tokens, authorization headers, card numbers, CPFs.
 * 2. Financial payloads are not serialized raw.
 * 3. Query string sanitizer strips secret reset/recovery tokens.
 * 4. Correlation IDs and Support references match format specifications.
 * 5. Domain invariant validator triggers on NaN / floating cent amounts.
 */

import { redactSensitiveData, sanitizeUrl } from '../../src/lib/logger';
import { generateCorrelationId, generateSupportReference, normalizeError, checkMoneyInvariant, checkTenantIsolationInvariant } from '../../src/lib/telemetry';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('AURAFIN — OBSERVABILITY & REDACTION SMOKE TEST');
console.log('================================================================\n');

// 1. Password & Secret Redaction
console.log('1. Testando Redaction Recursiva de Segredos & Senhas...');
const sensitivePayload = {
  user: {
    name: 'Carlos',
    password: 'SuperSecretPassword123!',
    currentPassword: 'OldPassword123!',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThis',
    metadata: {
      apiKey: 'sk_live_123456789abcdef',
      nested: {
        smtpPassword: 'emailPassword',
        authorization: 'Bearer secret_access_token_xyz',
      },
    },
  },
};

const sanitized = redactSensitiveData(sensitivePayload);
assert(sanitized.user.password === '[REDACTED]', 'Senha em primeiro nível redigida');
assert(sanitized.user.currentPassword === '[REDACTED]', 'currentPassword redigido');
assert(sanitized.user.token === '[REDACTED]', 'Token JWT em objeto redigido');
assert(sanitized.user.metadata.apiKey === '[REDACTED]', 'apiKey aninhada redigida');
assert(sanitized.user.metadata.nested.smtpPassword === '[REDACTED]', 'smtpPassword profundamente aninhada redigida');
assert(sanitized.user.metadata.nested.authorization === '[REDACTED]', 'Authorization header redigido');

// 2. Bearer & String Redaction
console.log('\n2. Testando Redaction de Strings Isoladas...');
const rawBearer = 'Bearer secret_token_value_here';
assert(redactSensitiveData(rawBearer) === 'Bearer [REDACTED]', 'Bearer token isolado redigido');

// 3. Card Number & CPF Redaction
console.log('\n3. Testando Redaction de Cartão de Crédito e CPF...');
const rawCard = '4532-1234-5678-9010';
const rawCpf = '123.456.789-00';
assert(redactSensitiveData(rawCard) === '**** **** **** ****', 'Número de cartão mascarado');
assert(redactSensitiveData(rawCpf) === '***.***.***-**', 'CPF mascarado');

// 4. Financial Array Payload Redaction
console.log('\n4. Testando Proteção de Coleções Financeiras...');
const financialData = {
  transactions: Array(25).fill({ id: 'tx_1', amount: 5000, description: 'Salário' }),
};
const sanitizedFinancial = redactSensitiveData(financialData);
assert(typeof sanitizedFinancial.transactions === 'string' && sanitizedFinancial.transactions.includes('count=25'), 'Array de 25 transações resumido com contagem');

// 5. Query String Redaction
console.log('\n5. Testando Sanitização de URLs & Tokens de Recuperação...');
const sensitiveUrl = 'https://app.aurafin.com.br/reset-password?token=secret_recovery_token_12345&email=user@aurafin.com&code=654321';
const sanitizedUrl = sanitizeUrl(sensitiveUrl);
assert(!sanitizedUrl.includes('secret_recovery_token_12345'), 'Token de recuperação removido da URL');
assert(!sanitizedUrl.includes('user@aurafin.com'), 'E-mail removido da URL');
assert(!sanitizedUrl.includes('654321'), 'Código removido da URL');

// 6. Correlation ID & Support Reference Format
console.log('\n6. Testando Formato de Correlation ID e Código de Suporte...');
const corrId = generateCorrelationId();
const supportRef = generateSupportReference();
assert(corrId.startsWith('corr_') && corrId.length > 10, `Correlation ID válido: ${corrId}`);
assert(/^ERR-[A-Z0-9]{6}$/.test(supportRef), `Support Reference válido: ${supportRef}`);

// 7. Error Normalization
console.log('\n7. Testando Normalização de Erros...');
const pgError = { code: '42501', message: 'new row violates row-level security policy for table "business_transactions"' };
const normalized = normalizeError(pgError);
assert(normalized.category === 'PERMISSION_ERROR', 'Erro 42501 categorizado como PERMISSION_ERROR');
assert(normalized.userMessage.includes('autorização'), 'Mensagem amigável para usuário sem expor SQL');

// 8. Domain Invariants
console.log('\n8. Testando Invariantes de Domínio e Inquilino...');
assert(checkMoneyInvariant(15000, 'Pagamento normal') === true, 'Valor em centavos inteiro válido');
assert(checkMoneyInvariant(NaN, 'Cálculo corrompido') === false, 'NaN detectado e rejeitado pelo invariante');
assert(checkMoneyInvariant(123.45, 'Centavos fracionários') === false, 'Valor fracionário detectado e rejeitado');
assert(checkTenantIsolationInvariant('org_1', 'org_1', 'accounts') === true, 'Inquilino correspondente aceito');
assert(checkTenantIsolationInvariant('org_1', 'org_2', 'accounts') === false, 'Vazamento entre inquilinos detectado e bloqueado');

console.log('\n================================================================');
console.log(`RESULTADO DO SMOKE TEST: ${failed === 0 ? 'PASS (100% dos testes aprovados)' : `FAIL (${failed} falhas)`}`);
console.log(`Total: ${passed + failed} | Aprovados: ${passed} | Falhas: ${failed}`);
console.log('================================================================\n');

process.exit(failed === 0 ? 0 : 1);
