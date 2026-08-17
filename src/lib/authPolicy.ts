export const AUTH_PASSWORD_MIN_LENGTH = 8;

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number;
  message: string;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export const AUTH_PASSWORD_REQUIREMENTS_MESSAGE =
  'A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números.';

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= AUTH_PASSWORD_MIN_LENGTH;
  const has12Plus = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial || has12Plus) score++;

  let message = 'Senha fraca';
  if (score === 2) message = 'Senha razoável';
  if (score === 3) message = 'Senha boa';
  if (score === 4) message = 'Senha excelente e forte';

  return {
    isValid: hasMinLength && hasUpper && hasLower && hasNumber,
    score,
    message,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}
