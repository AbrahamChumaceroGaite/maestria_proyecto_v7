import { z } from 'zod';
import { VALIDATION_MESSAGES, PASSWORD_CONFIG } from './constants';
import type { PasswordStrength, GeneratePasswordOptions } from '../types';

export const emailSchema = z
  .string()
  .min(1, VALIDATION_MESSAGES.EMAIL_REQUIRED)
  .email(VALIDATION_MESSAGES.EMAIL_INVALID);

export const passwordSchema = z
  .string()
  .min(PASSWORD_CONFIG.MIN_LENGTH, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH)
  .max(PASSWORD_CONFIG.MAX_LENGTH, VALIDATION_MESSAGES.PASSWORD_MAX_LENGTH);

export const masterPasswordSchema = z
  .string()
  .min(1, VALIDATION_MESSAGES.MASTER_PASSWORD_REQUIRED)
  .min(PASSWORD_CONFIG.MIN_LENGTH, VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);

export const loginSchema = z.object({
  email: emailSchema,
  masterPassword: masterPasswordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  masterPassword: masterPasswordSchema,
});

export const createPasswordSchema = z.object({
  service: z.string().min(1, VALIDATION_MESSAGES.SERVICE_REQUIRED),
  username: z.string().min(1, VALIDATION_MESSAGES.USERNAME_REQUIRED),
  password: passwordSchema,
  url: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
});

export const updatePasswordSchema = z.object({
  id: z.string().uuid(),
  service: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: passwordSchema.optional(),
  url: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
});

export const generatePasswordSchema = z.object({
  length: z.number().min(4).max(128),
  includeUppercase: z.boolean(),
  includeLowercase: z.boolean(),
  includeNumbers: z.boolean(),
  includeSymbols: z.boolean(),
  excludeSimilar: z.boolean(),
}) satisfies z.ZodSchema<GeneratePasswordOptions>;

export function validatePassword(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= PASSWORD_CONFIG.MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  let score = 0;
  const feedback: string[] = [];

  if (requirements.length) score += 1;
  else feedback.push('Debe tener al menos 8 caracteres');

  if (requirements.uppercase) score += 1;
  else feedback.push('Debe incluir al menos una mayúscula');

  if (requirements.lowercase) score += 1;
  else feedback.push('Debe incluir al menos una minúscula');

  if (requirements.numbers) score += 1;
  else feedback.push('Debe incluir al menos un número');

  if (requirements.symbols) score += 1;
  else feedback.push('Debe incluir al menos un símbolo');

  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  return {
    score: Math.min(score, 5),
    feedback,
    requirements,
  };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validateGeneratorOptions(options: GeneratePasswordOptions): boolean {
  try {
    generatePasswordSchema.parse(options);
    return options.includeUppercase || options.includeLowercase || 
           options.includeNumbers || options.includeSymbols;
  } catch {
    return false;
  }
}