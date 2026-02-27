import { z } from 'zod';

export const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,28}[a-z0-9]$/;

const PASSWORD_UPPERCASE = /[A-Z]/;
const PASSWORD_LOWERCASE = /[a-z]/;
const PASSWORD_NUMBER = /\d/;

export const loginSchema = z.object({
  email: z.string().min(1, 'auth.errors.emailRequired').email('auth.errors.emailInvalid').max(255),
  password: z.string().min(1, 'auth.errors.passwordRequired'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().min(1, 'auth.errors.emailRequired').email('auth.errors.emailInvalid').max(255),
    password: z
      .string()
      .min(8, 'auth.errors.passwordMinLength')
      .max(128, 'auth.errors.passwordMaxLength')
      .refine((v) => PASSWORD_UPPERCASE.test(v), 'auth.errors.passwordUppercase')
      .refine((v) => PASSWORD_LOWERCASE.test(v), 'auth.errors.passwordLowercase')
      .refine((v) => PASSWORD_NUMBER.test(v), 'auth.errors.passwordNumber'),
    confirmPassword: z.string().min(1, 'auth.errors.confirmPasswordRequired'),
    displayName: z.string().min(1, 'auth.errors.displayNameRequired').max(100, 'auth.errors.displayNameMaxLength'),
    handle: z
      .string()
      .min(3, 'auth.errors.handleMinLength')
      .max(30, 'auth.errors.handleMaxLength')
      .regex(HANDLE_PATTERN, 'auth.errors.handleFormat'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'auth.errors.passwordsMismatch',
    path: ['confirmPassword'],
  });
export type RegisterFormData = z.infer<typeof registerSchema>;

export const chooseHandleSchema = z.object({
  handle: z
    .string()
    .min(3, 'auth.errors.handleMinLength')
    .max(30, 'auth.errors.handleMaxLength')
    .regex(HANDLE_PATTERN, 'auth.errors.handleFormat'),
  displayName: z.string().min(1, 'auth.errors.displayNameRequired').max(100, 'auth.errors.displayNameMaxLength'),
});
export type ChooseHandleFormData = z.infer<typeof chooseHandleSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'auth.errors.emailRequired').email('auth.errors.emailInvalid').max(255),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const pokSchema = z.object({
  title: z.string().max(255, 'poks.errors.titleMaxLength').optional(),
  content: z.string().min(1, 'poks.errors.contentRequired').max(50000, 'poks.errors.contentMaxLength'),
});
export type PokFormData = z.infer<typeof pokSchema>;

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
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
