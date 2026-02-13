import { z } from 'zod';

/**
 * Handle validation pattern.
 * 3-30 chars, lowercase alphanumeric + hyphens, no consecutive hyphens,
 * must start and end with alphanumeric.
 */
export const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,28}[a-z0-9]$/;

/**
 * Password validation pattern.
 * At least 1 uppercase, 1 lowercase, 1 number.
 */
const PASSWORD_UPPERCASE = /[A-Z]/;
const PASSWORD_LOWERCASE = /[a-z]/;
const PASSWORD_NUMBER = /\d/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'auth.errors.emailRequired')
    .email('auth.errors.emailInvalid')
    .max(255),
  password: z
    .string()
    .min(1, 'auth.errors.passwordRequired'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'auth.errors.emailRequired')
      .email('auth.errors.emailInvalid')
      .max(255),
    password: z
      .string()
      .min(8, 'auth.errors.passwordMinLength')
      .max(128, 'auth.errors.passwordMaxLength')
      .refine((val) => PASSWORD_UPPERCASE.test(val), 'auth.errors.passwordUppercase')
      .refine((val) => PASSWORD_LOWERCASE.test(val), 'auth.errors.passwordLowercase')
      .refine((val) => PASSWORD_NUMBER.test(val), 'auth.errors.passwordNumber'),
    confirmPassword: z.string().min(1, 'auth.errors.confirmPasswordRequired'),
    displayName: z
      .string()
      .min(1, 'auth.errors.displayNameRequired')
      .max(100, 'auth.errors.displayNameMaxLength'),
    handle: z
      .string()
      .min(3, 'auth.errors.handleMinLength')
      .max(30, 'auth.errors.handleMaxLength')
      .regex(HANDLE_PATTERN, 'auth.errors.handleFormat'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.errors.passwordsMismatch',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Computes a simple password strength score.
 * Returns 'weak' | 'medium' | 'strong'.
 */
export function getPasswordStrength(
  password: string
): 'weak' | 'medium' | 'strong' {
  if (password.length === 0) return 'weak';

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (PASSWORD_UPPERCASE.test(password)) score++;
  if (PASSWORD_LOWERCASE.test(password)) score++;
  if (PASSWORD_NUMBER.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}
