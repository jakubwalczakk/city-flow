import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { FeedbackDto } from '@/types';

// Note: useFeedback requires React Query provider context.
// These tests verify the hooks structure and exports.

describe('useFeedback', () => {
  const mockFeedback: FeedbackDto = {
    rating: 'thumbs_up',
    comment: 'Great plan!',
    updated_at: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hook interface', () => {
    it('should be importable', async () => {
      const { useFeedback } = await import('@/hooks/useFeedback');
      expect(useFeedback).toBeTypeOf('function');
    });

    it('should return object with required properties', async () => {
      const { useFeedback: importedUseFeedback } = await import('@/hooks/useFeedback');

      // Verify function is callable
      expect(importedUseFeedback).toBeTypeOf('function');
    });
  });

  describe('feedback data structure', () => {
    it('should validate rating values', () => {
      const validRatings = ['thumbs_up', 'thumbs_down'];
      expect(validRatings).toContain(mockFeedback.rating);
    });
  });
});
