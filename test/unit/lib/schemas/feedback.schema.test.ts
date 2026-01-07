import { describe, it, expect } from 'vitest';
import { submitFeedbackSchema } from '@/lib/schemas/feedback.schema';

describe('feedback.schema', () => {
  describe('submitFeedbackSchema - valid data', () => {
    it('should accept thumbs_up rating', () => {
      const data = {
        rating: 'thumbs_up' as const,
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept thumbs_down rating', () => {
      const data = {
        rating: 'thumbs_down' as const,
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept rating with comment', () => {
      const data = {
        rating: 'thumbs_up' as const,
        comment: 'Great experience!',
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.comment).toBe('Great experience!');
      }
    });

    it('should accept rating without comment', () => {
      const data = {
        rating: 'thumbs_up' as const,
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept rating with null comment', () => {
      const data = {
        rating: 'thumbs_down' as const,
        comment: null,
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept rating with empty string comment', () => {
      const data = {
        rating: 'thumbs_up' as const,
        comment: '',
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept long comment', () => {
      const data = {
        rating: 'thumbs_down' as const,
        comment: 'a'.repeat(1000),
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('submitFeedbackSchema - validation errors', () => {
    it('should reject missing rating', () => {
      const data = {
        comment: 'Some comment',
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('rating');
        // Zod 4 returns "Invalid option" for missing enum fields
        expect(result.error.issues[0].message).toMatch(/Invalid option|required/);
      }
    });

    it('should reject invalid rating value', () => {
      const data = {
        rating: 'invalid_rating',
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject numeric rating', () => {
      const data = {
        rating: 5,
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject boolean rating', () => {
      const data = {
        rating: true,
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty object', () => {
      const data = {};

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('submitFeedbackSchema - edge cases', () => {
    it('should handle comment with special characters', () => {
      const data = {
        rating: 'thumbs_up' as const,
        comment: 'Great! 👍 Works perfectly. 100% satisfied.',
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle comment with newlines', () => {
      const data = {
        rating: 'thumbs_down' as const,
        comment: 'Line 1\nLine 2\nLine 3',
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle comment with unicode characters', () => {
      const data = {
        rating: 'thumbs_up' as const,
        comment: 'Świetna aplikacja! Très bien! 素晴らしい',
      };

      const result = submitFeedbackSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
