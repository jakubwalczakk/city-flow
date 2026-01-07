import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, forgotPasswordSchema, updatePasswordSchema } from '@/lib/schemas/auth.schema';

describe('auth.schema', () => {
  describe('loginSchema', () => {
    describe('valid data', () => {
      it('should accept valid login credentials', () => {
        const data = {
          email: 'user@example.com',
          password: 'securePassword123',
        };

        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should accept various valid email formats', () => {
        const emails = [
          'test@example.com',
          'user.name@example.com',
          'user+tag@example.co.uk',
          'test123@test-domain.com',
        ];

        emails.forEach((email) => {
          const result = loginSchema.safeParse({
            email,
            password: 'password',
          });
          expect(result.success).toBe(true);
        });
      });
    });

    describe('validation errors', () => {
      it('should reject missing email', () => {
        const data = {
          password: 'password123',
        };

        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('email');
          expect(result.error.issues[0].message).toContain('wymagany');
        }
      });

      it('should reject empty email', () => {
        const data = {
          email: '',
          password: 'password123',
        };

        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('wymagany');
        }
      });

      it('should reject invalid email format', () => {
        const invalidEmails = ['not-an-email', 'test@', '@example.com', 'test @example.com'];

        invalidEmails.forEach((email) => {
          const result = loginSchema.safeParse({
            email,
            password: 'password',
          });
          expect(result.success).toBe(false);
        });
      });

      it('should reject missing password', () => {
        const data = {
          email: 'user@example.com',
        };

        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('password');
          expect(result.error.issues[0].message).toContain('wymagane');
        }
      });

      it('should reject empty password', () => {
        const data = {
          email: 'user@example.com',
          password: '',
        };

        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('wymagane');
        }
      });
    });
  });

  describe('registerSchema', () => {
    describe('valid data', () => {
      it('should accept valid registration data', () => {
        const data = {
          email: 'newuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should accept password with special characters', () => {
        const data = {
          email: 'user@example.com',
          password: 'SecurePass123!@#',
          confirmPassword: 'SecurePass123!@#',
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe('validation errors', () => {
      it('should reject password shorter than 8 characters', () => {
        const data = {
          email: 'user@example.com',
          password: 'Pass1',
          confirmPassword: 'Pass1',
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('8');
        }
      });

      it('should reject password without uppercase letter', () => {
        const data = {
          email: 'user@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('wielką');
        }
      });

      it('should reject password without lowercase letter', () => {
        const data = {
          email: 'user@example.com',
          password: 'PASSWORD123',
          confirmPassword: 'PASSWORD123',
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('małą');
        }
      });

      it('should reject password without digit', () => {
        const data = {
          email: 'user@example.com',
          password: 'PasswordOnly',
          confirmPassword: 'PasswordOnly',
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('cyfrę');
        }
      });

      it('should reject when passwords do not match', () => {
        const data = {
          email: 'user@example.com',
          password: 'SecurePass123',
          confirmPassword: 'DifferentPass123',
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          const confirmError = result.error.issues.find((issue) => issue.path.includes('confirmPassword'));
          expect(confirmError?.message).toContain('identyczne');
        }
      });

      it('should reject missing confirmPassword', () => {
        const data = {
          email: 'user@example.com',
          password: 'SecurePass123',
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('should reject empty confirmPassword', () => {
        const data = {
          email: 'user@example.com',
          password: 'SecurePass123',
          confirmPassword: '',
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('forgotPasswordSchema', () => {
    describe('valid data', () => {
      it('should accept valid email', () => {
        const data = {
          email: 'user@example.com',
        };

        const result = forgotPasswordSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe('validation errors', () => {
      it('should reject missing email', () => {
        const data = {};

        const result = forgotPasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('wymagany');
        }
      });

      it('should reject empty email', () => {
        const data = {
          email: '',
        };

        const result = forgotPasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('should reject invalid email format', () => {
        const data = {
          email: 'not-an-email',
        };

        const result = forgotPasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('updatePasswordSchema', () => {
    describe('valid data', () => {
      it('should accept valid password update', () => {
        const data = {
          password: 'NewSecure123',
          confirmPassword: 'NewSecure123',
        };

        const result = updatePasswordSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe('validation errors', () => {
      it('should reject password shorter than 8 characters', () => {
        const data = {
          password: 'Pass1',
          confirmPassword: 'Pass1',
        };

        const result = updatePasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('8');
        }
      });

      it('should reject password without required complexity', () => {
        const data = {
          password: 'simplepass',
          confirmPassword: 'simplepass',
        };

        const result = updatePasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('should reject when passwords do not match', () => {
        const data = {
          password: 'NewSecure123',
          confirmPassword: 'DifferentPass123',
        };

        const result = updatePasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          const confirmError = result.error.issues.find((issue) => issue.path.includes('confirmPassword'));
          expect(confirmError?.message).toContain('identyczne');
        }
      });

      it('should reject missing password', () => {
        const data = {
          confirmPassword: 'SecurePass123',
        };

        const result = updatePasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('should reject missing confirmPassword', () => {
        const data = {
          password: 'SecurePass123',
        };

        const result = updatePasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });
});
