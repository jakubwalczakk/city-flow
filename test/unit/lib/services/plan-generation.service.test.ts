import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlanGenerationService } from '@/lib/services/plan-generation.service';
import { AppError, ForbiddenError, NotFoundError } from '@/lib/errors/app-error';
import type { SupabaseClient } from '@/db/supabase.client';
import type { PlanDetailsDto, FixedPointDto, ProfileDto, GeneratedContentViewModel } from '@/types';

// Mock all service dependencies
vi.mock('@/lib/services/openrouter.service');
vi.mock('@/lib/services/plan.service');
vi.mock('@/lib/services/fixed-point.service');
vi.mock('@/lib/services/profile.service');
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create mock Supabase client
function createMockSupabaseClient(): Pick<SupabaseClient, 'from'> {
  return {
    from: vi.fn(),
  } as Pick<SupabaseClient, 'from'>;
}

describe('PlanGenerationService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with SupabaseClient and API key', () => {
      const service = new PlanGenerationService(mockSupabase as unknown as SupabaseClient, mockApiKey);
      expect(service).toBeInstanceOf(PlanGenerationService);
    });

    it('should extract supabase from App.Locals', () => {
      const locals = { supabase: mockSupabase } as unknown as App.Locals;
      const service = new PlanGenerationService(locals, mockApiKey);
      expect(service).toBeInstanceOf(PlanGenerationService);
    });

    it('should throw error if API key is missing', () => {
      expect(() => {
        new PlanGenerationService(mockSupabase as unknown as SupabaseClient, '');
      }).toThrow('OpenRouter API key is required for PlanGenerationService.');
    });

    it('should throw error if API key is undefined', () => {
      expect(() => {
        new PlanGenerationService(mockSupabase as unknown as SupabaseClient, undefined as unknown as string);
      }).toThrow('OpenRouter API key is required for PlanGenerationService.');
    });
  });

  describe('generatePlanContent', () => {
    const mockPlan: PlanDetailsDto = {
      id: 'plan-1',
      user_id: 'user-1',
      name: 'Paris Trip',
      destination: 'Paris',
      start_date: '2024-06-01',
      end_date: '2024-06-03',
      notes: 'Visit museums',
      status: 'draft',
      generated_content: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    const mockFixedPoints: FixedPointDto[] = [
      {
        id: 'fp-1',
        plan_id: 'plan-1',
        location: 'Paris',
        event_at: '2024-06-01',
        event_duration: 1,
        description: 'Must visit',
      },
    ];

    const mockProfile: ProfileDto = {
      id: 'profile-1',
      onboarding_completed: true,
      generations_remaining: 5,
      travel_pace: 'moderate',
      preferences: null,
      updated_at: '2024-01-01',
    };

    it('should successfully generate plan content', async () => {
      const { OpenRouterService } = await import('@/lib/services/openrouter.service');

      const mockAIResponse = {
        status: 'success' as const,
        summary: 'A wonderful 3-day trip to Paris',
        currency: 'EUR',
        itinerary: {
          destination: 'Paris',
          dates: {
            start: '2024-06-01',
            end: '2024-06-03',
          },
          days: [
            {
              date: '2024-06-01',
              activities: [
                {
                  time: '09:00',
                  activity: 'Breakfast at café',
                  category: 'food' as const,
                  description: 'Start your day with a traditional French breakfast. Enjoy croissants and café au lait.',
                  estimated_price: '15',
                  estimated_duration: '1 hour',
                },
              ],
            },
          ],
        },
      };

      // Mock OpenRouterService.getStructuredResponse
      vi.mocked(OpenRouterService.prototype.getStructuredResponse).mockResolvedValue(mockAIResponse);

      const service = new PlanGenerationService(mockSupabase as unknown as SupabaseClient, mockApiKey);
      const result = await service.generatePlanContent(mockPlan, mockFixedPoints, mockProfile);

      expect(result).toBeDefined();
      const content = result as unknown as GeneratedContentViewModel;
      expect(content.summary).toBe('A wonderful 3-day trip to Paris');
      expect(content.currency).toBe('EUR');
      expect(content.days).toBeDefined();
      expect(content.days).toHaveLength(1);
      expect(content.days[0].date).toBe('2024-06-01');
      expect(content.days[0].items).toBeDefined();
      expect(content.days[0].items).toHaveLength(1);
      expect(content.days[0].items[0].title).toBe('Breakfast at café');
      expect(content.days[0].items[0].category).toBe('food');
      expect(content.days[0].items[0].type).toBe('meal'); // food category maps to meal type
      expect(OpenRouterService.prototype.getStructuredResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: expect.any(String),
          userPrompt: expect.any(String),
          responseSchema: expect.any(Object),
        })
      );
    });

    it('should throw AppError when AI returns error response', async () => {
      const { OpenRouterService } = await import('@/lib/services/openrouter.service');

      const mockAIErrorResponse = {
        status: 'error' as const,
        error_type: 'unrealistic_plan' as const,
        error_message: 'The destination is too far for the given timeframe.',
      };

      vi.mocked(OpenRouterService.prototype.getStructuredResponse).mockResolvedValue(mockAIErrorResponse);

      const service = new PlanGenerationService(mockSupabase as unknown as SupabaseClient, mockApiKey);

      await expect(service.generatePlanContent(mockPlan, mockFixedPoints, mockProfile)).rejects.toThrow(AppError);
      await expect(service.generatePlanContent(mockPlan, mockFixedPoints, mockProfile)).rejects.toThrow(
        'The destination is too far for the given timeframe.'
      );
    });

    it('should log warning when AI returns error', async () => {
      const { OpenRouterService } = await import('@/lib/services/openrouter.service');
      const { logger } = await import('@/lib/utils/logger');

      const mockAIErrorResponse = {
        status: 'error' as const,
        error_type: 'invalid_location' as const,
        error_message: 'Invalid destination',
      };

      vi.mocked(OpenRouterService.prototype.getStructuredResponse).mockResolvedValue(mockAIErrorResponse);

      const service = new PlanGenerationService(mockSupabase as unknown as SupabaseClient, mockApiKey);

      try {
        await service.generatePlanContent(mockPlan, mockFixedPoints, mockProfile);
      } catch {
        // Expected
      }

      expect(logger.warn).toHaveBeenCalledWith('AI returned error for plan generation', {
        planId: 'plan-1',
        errorType: 'invalid_location',
        errorMessage: 'Invalid destination',
      });
    });

    it('should accept language parameter', async () => {
      const { OpenRouterService } = await import('@/lib/services/openrouter.service');

      const mockAIResponse = {
        status: 'success' as const,
        summary: 'A great trip',
        currency: 'EUR',
        itinerary: {
          destination: 'Paris',
          dates: { start: '2024-06-01', end: '2024-06-03' },
          days: [],
        },
      };

      vi.mocked(OpenRouterService.prototype.getStructuredResponse).mockResolvedValue(mockAIResponse);

      const service = new PlanGenerationService(mockSupabase as unknown as SupabaseClient, mockApiKey);
      await service.generatePlanContent(mockPlan, mockFixedPoints, mockProfile, 'English');

      // Verify that OpenRouter was called (language is used in system prompt)
      expect(OpenRouterService.prototype.getStructuredResponse).toHaveBeenCalled();
    });
  });

  describe('generateAndSavePlan - credit checks', () => {
    it('should throw NotFoundError if profile not found', async () => {
      const { ProfileService } = await import('@/lib/services/profile.service');

      // Mock profile not found
      vi.mocked(ProfileService.prototype.findProfileByUserId).mockResolvedValue(null);

      const service = new PlanGenerationService(mockSupabase as unknown as SupabaseClient, mockApiKey);

      await expect(service.generateAndSavePlan('plan-1', 'user-1')).rejects.toThrow(NotFoundError);
      await expect(service.generateAndSavePlan('plan-1', 'user-1')).rejects.toThrow('Profile not found.');
    });

    it('should throw ForbiddenError if no generations remaining', async () => {
      const { ProfileService } = await import('@/lib/services/profile.service');

      const mockProfile: ProfileDto = {
        id: 'user-1',
        onboarding_completed: true,
        generations_remaining: 0, // No credits!
        travel_pace: 'moderate',
        preferences: null,
        updated_at: '2024-01-01',
      };

      vi.mocked(ProfileService.prototype.findProfileByUserId).mockResolvedValue(mockProfile);

      const service = new PlanGenerationService(mockSupabase as unknown as SupabaseClient, mockApiKey);

      await expect(service.generateAndSavePlan('plan-1', 'user-1')).rejects.toThrow(ForbiddenError);
      await expect(service.generateAndSavePlan('plan-1', 'user-1')).rejects.toThrow(
        'You have no plan generations remaining.'
      );
    });
  });

  describe('error handling', () => {
    it('should handle OpenRouter service errors', async () => {
      const { OpenRouterService } = await import('@/lib/services/openrouter.service');

      vi.mocked(OpenRouterService.prototype.getStructuredResponse).mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      const mockPlan: PlanDetailsDto = {
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Test',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-03',
        notes: null,
        status: 'draft',
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const service = new PlanGenerationService(mockSupabase as unknown as SupabaseClient, mockApiKey);

      await expect(
        service.generatePlanContent(mockPlan, [], {
          id: 'user-1',
          onboarding_completed: true,
          generations_remaining: 5,
          travel_pace: 'moderate',
          preferences: null,
          updated_at: '2024-01-01',
        })
      ).rejects.toThrow('API rate limit exceeded');
    });
  });
});
