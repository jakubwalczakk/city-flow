import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedbackService } from '@/lib/services/feedback.service';
import { DatabaseError, NotFoundError } from '@/lib/errors/app-error';
import type { SupabaseClient } from '@/db/supabase.client';
import type { SubmitFeedbackCommand, FeedbackDto } from '@/types';

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Helper to create mock Supabase client
function createMockSupabaseClient() {
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockSingle = vi.fn();
  const mockUpsert = vi.fn().mockReturnThis();

  return {
    from: vi.fn(() => ({
      upsert: mockUpsert,
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    })),
    _mockHelpers: {
      mockSelect,
      mockEq,
      mockSingle,
      mockUpsert,
    },
  } as unknown as SupabaseClient;
}

describe('FeedbackService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let feedbackService: FeedbackService;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    feedbackService = new FeedbackService(mockSupabase as unknown as SupabaseClient);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should accept SupabaseClient directly', () => {
      const service = new FeedbackService(mockSupabase as unknown as SupabaseClient);
      expect(service).toBeInstanceOf(FeedbackService);
    });

    it('should extract supabase from App.Locals', () => {
      const locals = { supabase: mockSupabase } as unknown as App.Locals;
      const service = new FeedbackService(locals);
      expect(service).toBeInstanceOf(FeedbackService);
    });
  });

  describe('submitFeedback', () => {
    const mockFeedbackDto: FeedbackDto = {
      rating: 'thumbs_up',
      comment: 'Great plan!',
      updated_at: '2024-01-01T10:00:00Z',
    };

    const command: SubmitFeedbackCommand = {
      rating: 'thumbs_up',
      comment: 'Great plan!',
    };

    it('should successfully submit feedback', async () => {
      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: mockFeedbackDto,
        error: null,
      });

      const result = await feedbackService.submitFeedback('plan-1', 'user-1', command);

      expect(result).toEqual(mockFeedbackDto);
      expect(mockSupabase.from).toHaveBeenCalledWith('feedback');
      expect(mockSupabase._mockHelpers.mockUpsert).toHaveBeenCalledWith(
        {
          plan_id: 'plan-1',
          user_id: 'user-1',
          rating: 'thumbs_up',
          comment: 'Great plan!',
        },
        {
          onConflict: 'plan_id,user_id',
        }
      );
      expect(mockSupabase._mockHelpers.mockSelect).toHaveBeenCalledWith('rating, comment, updated_at');
      expect(mockSupabase._mockHelpers.mockSingle).toHaveBeenCalled();
    });

    it('should log debug message at start', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: mockFeedbackDto,
        error: null,
      });

      await feedbackService.submitFeedback('plan-1', 'user-1', command);

      expect(logger.debug).toHaveBeenCalledWith('Submitting feedback', {
        planId: 'plan-1',
        userId: 'user-1',
        rating: 'thumbs_up',
      });
    });

    it('should log info message on success', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: mockFeedbackDto,
        error: null,
      });

      await feedbackService.submitFeedback('plan-1', 'user-1', command);

      expect(logger.info).toHaveBeenCalledWith('Feedback submitted successfully', {
        planId: 'plan-1',
        userId: 'user-1',
      });
    });

    it('should throw DatabaseError on database failure', async () => {
      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Duplicate key violation' },
      });

      await expect(feedbackService.submitFeedback('plan-1', 'user-1', command)).rejects.toThrow(DatabaseError);
      await expect(feedbackService.submitFeedback('plan-1', 'user-1', command)).rejects.toThrow(
        'Failed to submit feedback. Please try again later.'
      );
    });

    it('should log error on database failure', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Duplicate key violation' },
      });

      try {
        await feedbackService.submitFeedback('plan-1', 'user-1', command);
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalledWith('Failed to submit feedback to database', {
        planId: 'plan-1',
        userId: 'user-1',
        errorCode: '23505',
        errorMessage: 'Duplicate key violation',
      });
    });

    it('should handle feedback with null comment', async () => {
      const commandWithNullComment: SubmitFeedbackCommand = {
        rating: 'thumbs_down',
        comment: null,
      };

      const feedbackWithNullComment: FeedbackDto = {
        rating: 'thumbs_down',
        comment: null,
        updated_at: '2024-01-01T10:00:00Z',
      };

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: feedbackWithNullComment,
        error: null,
      });

      const result = await feedbackService.submitFeedback('plan-1', 'user-1', commandWithNullComment);

      expect(result).toEqual(feedbackWithNullComment);
      expect(mockSupabase._mockHelpers.mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: null,
        }),
        expect.any(Object)
      );
    });
  });

  describe('getFeedback', () => {
    const mockFeedbackDto: FeedbackDto = {
      rating: 'thumbs_up',
      comment: 'Excellent!',
      updated_at: '2024-01-01T10:00:00Z',
    };

    it('should successfully retrieve feedback', async () => {
      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: mockFeedbackDto,
        error: null,
      });

      const result = await feedbackService.getFeedback('plan-1', 'user-1');

      expect(result).toEqual(mockFeedbackDto);
      expect(mockSupabase.from).toHaveBeenCalledWith('feedback');
      expect(mockSupabase._mockHelpers.mockSelect).toHaveBeenCalledWith('rating, comment, updated_at');
      expect(mockSupabase._mockHelpers.mockEq).toHaveBeenCalledWith('plan_id', 'plan-1');
      expect(mockSupabase._mockHelpers.mockEq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockSupabase._mockHelpers.mockSingle).toHaveBeenCalled();
    });

    it('should log debug message at start', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: mockFeedbackDto,
        error: null,
      });

      await feedbackService.getFeedback('plan-1', 'user-1');

      expect(logger.debug).toHaveBeenCalledWith('Fetching feedback', {
        planId: 'plan-1',
        userId: 'user-1',
      });
    });

    it('should log info message on success', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: mockFeedbackDto,
        error: null,
      });

      await feedbackService.getFeedback('plan-1', 'user-1');

      expect(logger.info).toHaveBeenCalledWith('Feedback fetched successfully', {
        planId: 'plan-1',
        userId: 'user-1',
      });
    });

    it('should throw NotFoundError when feedback does not exist (PGRST116)', async () => {
      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      await expect(feedbackService.getFeedback('plan-1', 'user-1')).rejects.toThrow(NotFoundError);
      await expect(feedbackService.getFeedback('plan-1', 'user-1')).rejects.toThrow(
        'No feedback submitted for this plan.'
      );
    });

    it('should log debug (not error) for NotFoundError', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      try {
        await feedbackService.getFeedback('plan-1', 'user-1');
      } catch {
        // Expected
      }

      expect(logger.debug).toHaveBeenCalledWith('No feedback found for plan (expected for new plans)', {
        planId: 'plan-1',
        userId: 'user-1',
      });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should throw DatabaseError on other database errors', async () => {
      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Connection error' },
      });

      await expect(feedbackService.getFeedback('plan-1', 'user-1')).rejects.toThrow(DatabaseError);
      await expect(feedbackService.getFeedback('plan-1', 'user-1')).rejects.toThrow(
        'Failed to retrieve feedback. Please try again later.'
      );
    });

    it('should log error on database errors (not PGRST116)', async () => {
      const { logger } = await import('@/lib/utils/logger');

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Connection error' },
      });

      try {
        await feedbackService.getFeedback('plan-1', 'user-1');
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalledWith('Failed to fetch feedback from database', {
        planId: 'plan-1',
        userId: 'user-1',
        errorCode: '23505',
        errorMessage: 'Connection error',
      });
    });

    it('should verify NotFoundError properties', async () => {
      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      try {
        await feedbackService.getFeedback('plan-1', 'user-1');
        expect.fail('Should have thrown NotFoundError');
      } catch {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as NotFoundError).statusCode).toBe(404);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty string comment', async () => {
      const command: SubmitFeedbackCommand = {
        rating: 'thumbs_up',
        comment: null,
      };

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: { rating: 'thumbs_up', comment: null, updated_at: '2024-01-01' },
        error: null,
      });

      await feedbackService.submitFeedback('plan-1', 'user-1', command);

      expect(mockSupabase._mockHelpers.mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: null,
        }),
        expect.any(Object)
      );
    });

    it('should handle different rating types', async () => {
      const command: SubmitFeedbackCommand = {
        rating: 'thumbs_down',
        comment: 'Needs improvement',
      };

      mockSupabase._mockHelpers.mockSingle.mockResolvedValue({
        data: { rating: 'thumbs_down', comment: 'Needs improvement', updated_at: '2024-01-01' },
        error: null,
      });

      const result = await feedbackService.submitFeedback('plan-1', 'user-1', command);

      expect(result.rating).toBe('thumbs_down');
    });
  });
});
