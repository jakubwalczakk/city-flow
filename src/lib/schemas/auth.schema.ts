import { z } from 'zod';

/**
 * Schema for login form validation
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email jest wymagany' })
    .min(1, 'Email jest wymagany')
    .email('Nieprawidłowy format email'),
  password: z.string({ required_error: 'Hasło jest wymagane' }).min(1, 'Hasło jest wymagane'),
});

/**
 * Schema for registration form validation
 */
export const registerSchema = z
  .object({
    email: z
      .string({ required_error: 'Email jest wymagany' })
      .min(1, 'Email jest wymagany')
      .email('Nieprawidłowy format email'),
    password: z
      .string({ required_error: 'Hasło jest wymagane' })
      .min(8, 'Hasło musi mieć minimum 8 znaków')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Hasło musi zawierać wielką literę, małą literę i cyfrę'),
    confirmPassword: z
      .string({ required_error: 'Potwierdzenie hasła jest wymagane' })
      .min(1, 'Potwierdzenie hasła jest wymagane'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  });

/**
 * Schema for forgot password form validation
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email jest wymagany' })
    .min(1, 'Email jest wymagany')
    .email('Nieprawidłowy format email'),
});

/**
 * Schema for update password form validation
 */
export const updatePasswordSchema = z
  .object({
    password: z
      .string({ required_error: 'Hasło jest wymagane' })
      .min(8, 'Hasło musi mieć minimum 8 znaków')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Hasło musi zawierać wielką literę, małą literę i cyfrę'),
    confirmPassword: z
      .string({ required_error: 'Potwierdzenie hasła jest wymagane' })
      .min(1, 'Potwierdzenie hasła jest wymagane'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
