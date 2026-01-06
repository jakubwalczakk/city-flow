import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNewPlanForm } from '@/hooks/useNewPlanForm';
import { PlanFormApiService } from '@/lib/services/planFormApi.service';
import type { PlanListItemDto, FixedPointDto } from '@/types';

// Mock PlanFormApiService
vi.mock('@/lib/services/planFormApi.service', () => ({
  PlanFormApiService: {
    fetchPlanDetails: vi.fn(),
    fetchFixedPoints: vi.fn(),
    createPlan: vi.fn(),
    updatePlan: vi.fn(),
    syncFixedPoints: vi.fn(),
    generatePlan: vi.fn(),
  },
}));

// Mock planFormHelpers
vi.mock('@/lib/utils/planFormHelpers', () => ({
  getDefaultStartDate: vi.fn(() => new Date('2024-06-01')),
  getDefaultEndDate: vi.fn(() => new Date('2024-06-08')),
  determineStartingStep: vi.fn(() => 1),
  convertFixedPointsToFormItems: vi.fn((points) =>
    points.map((p: FixedPointDto) => ({
      id: p.id,
      location: p.location,
      event_at: p.event_at,
      event_duration: p.event_duration,
      description: p.description || '',
    }))
  ),
  generateDefaultPlanName: vi.fn((destination) => `Trip to ${destination}`),
}));

describe('useNewPlanForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.href
    delete (window as unknown as { location: unknown }).location;
    (window as unknown as { location: { href: string } }).location = { href: '' };
  });

  describe('initialization', () => {
    it('should initialize with default values for new plan', () => {
      const { result } = renderHook(() => useNewPlanForm());

      expect(result.current.currentStep).toBe(1);
      expect(result.current.formData.basicInfo.name).toBe('');
      expect(result.current.formData.basicInfo.destination).toBe('');
      expect(result.current.formData.fixedPoints).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should initialize with default dates', () => {
      const { result } = renderHook(() => useNewPlanForm());

      expect(result.current.formData.basicInfo.start_date).toEqual(new Date('2024-06-01'));
      expect(result.current.formData.basicInfo.end_date).toEqual(new Date('2024-06-08'));
    });

    it('should load plan data when editing', async () => {
      const mockEditingPlan: PlanListItemDto = {
        id: 'plan-1',
        name: 'Existing Plan',
        destination: 'Paris',
        start_date: '2024-07-01',
        end_date: '2024-07-05',
        status: 'draft',
        created_at: '2024-01-01',
      };

      const mockPlanDetails = {
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Existing Plan',
        destination: 'Paris',
        start_date: '2024-07-01',
        end_date: '2024-07-05',
        notes: 'Visit museums',
        status: 'draft' as const,
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockFixedPoints: FixedPointDto[] = [
        {
          id: 'fp-1',
          plan_id: 'plan-1',
          location: 'Eiffel Tower',
          event_at: '2024-07-02T14:00:00Z',
          event_duration: 120,
          description: 'Visit',
        },
      ];

      vi.mocked(PlanFormApiService.fetchPlanDetails).mockResolvedValue(mockPlanDetails);
      vi.mocked(PlanFormApiService.fetchFixedPoints).mockResolvedValue(mockFixedPoints);

      const { result } = renderHook(() => useNewPlanForm({ editingPlan: mockEditingPlan }));

      // Should start loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.formData.basicInfo.name).toBe('Existing Plan');
      expect(result.current.formData.basicInfo.destination).toBe('Paris');
      expect(result.current.formData.basicInfo.notes).toBe('Visit museums');
      expect(result.current.formData.fixedPoints).toHaveLength(1);
    });

    it('should handle error when loading plan fails', async () => {
      const mockEditingPlan: PlanListItemDto = {
        id: 'plan-1',
        name: 'Existing Plan',
        destination: 'Paris',
        start_date: '2024-07-01',
        end_date: '2024-07-05',
        status: 'draft',
        created_at: '2024-01-01',
      };

      vi.mocked(PlanFormApiService.fetchPlanDetails).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useNewPlanForm({ editingPlan: mockEditingPlan }));

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });
  });

  describe('form data updates', () => {
    it('should update basic info', () => {
      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.updateBasicInfo({
          name: 'Summer Vacation',
          destination: 'Barcelona',
        });
      });

      expect(result.current.formData.basicInfo.name).toBe('Summer Vacation');
      expect(result.current.formData.basicInfo.destination).toBe('Barcelona');
    });

    it('should preserve other basic info fields when updating', () => {
      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.updateBasicInfo({
          notes: 'Bring sunscreen',
        });
      });

      expect(result.current.formData.basicInfo.notes).toBe('Bring sunscreen');
      expect(result.current.formData.basicInfo.name).toBe(''); // Unchanged
    });

    it('should add fixed point', () => {
      const { result } = renderHook(() => useNewPlanForm());

      const fixedPoint = {
        location: 'Museum Visit',
        event_at: '2024-06-02T10:00:00Z',
        event_duration: 120,
        description: 'Art museum',
      };

      act(() => {
        result.current.addFixedPoint(fixedPoint);
      });

      expect(result.current.formData.fixedPoints).toHaveLength(1);
      expect(result.current.formData.fixedPoints[0].location).toBe('Museum Visit');
    });

    it('should remove fixed point by index', () => {
      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.addFixedPoint({
          location: 'Point 1',
          event_at: '2024-06-02T10:00:00Z',
          event_duration: 120,
          description: '',
        });
        result.current.addFixedPoint({
          location: 'Point 2',
          event_at: '2024-06-03T14:00:00Z',
          event_duration: 120,
          description: '',
        });
      });

      expect(result.current.formData.fixedPoints).toHaveLength(2);

      act(() => {
        result.current.removeFixedPoint(0);
      });

      expect(result.current.formData.fixedPoints).toHaveLength(1);
      expect(result.current.formData.fixedPoints[0].location).toBe('Point 2');
    });

    it('should update fixed point by index', () => {
      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.addFixedPoint({
          id: 'fp-1',
          location: 'Original',
          event_at: '2024-06-02T10:00:00Z',
          event_duration: 120,
          description: '',
        });
      });

      act(() => {
        result.current.updateFixedPoint(0, {
          location: 'Updated',
          event_at: '2024-06-02T11:00:00Z',
          event_duration: 90,
          description: 'New description',
        });
      });

      expect(result.current.formData.fixedPoints[0].location).toBe('Updated');
      expect(result.current.formData.fixedPoints[0].event_at).toBe('2024-06-02T11:00:00Z');
      // Should preserve ID
      expect(result.current.formData.fixedPoints[0].id).toBe('fp-1');
    });
  });

  describe('step navigation', () => {
    it('should navigate to next step', () => {
      const { result } = renderHook(() => useNewPlanForm());

      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.nextStep();
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(3);

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should not go beyond step 3', () => {
      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.nextStep();
        result.current.nextStep();
        result.current.nextStep();
        result.current.nextStep(); // Try to go beyond
      });

      expect(result.current.currentStep).toBe(3);
    });

    it('should not go below step 1', () => {
      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.prevStep();
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should go to specific step within allowed range', () => {
      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.nextStep();
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(3);

      act(() => {
        result.current.goToStep(1);
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not allow jumping to future steps', () => {
      const { result } = renderHook(() => useNewPlanForm());

      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.goToStep(3); // Try to jump ahead
      });

      expect(result.current.currentStep).toBe(1); // Should stay at 1
    });

    it('should clear error when navigating', () => {
      const { result } = renderHook(() => useNewPlanForm());

      // Navigate to next step
      act(() => {
        result.current.nextStep();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('saveDraft', () => {
    it('should save basic info on step 1', async () => {
      vi.mocked(PlanFormApiService.createPlan).mockResolvedValue({
        id: 'new-plan-id',
        user_id: 'user-1',
        name: 'Trip to Paris',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        notes: null,
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      const onFinished = vi.fn();
      const { result } = renderHook(() => useNewPlanForm({ onFinished }));

      act(() => {
        result.current.updateBasicInfo({
          destination: 'Paris',
          notes: 'Summer trip',
        });
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(PlanFormApiService.createPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: 'Paris',
          notes: 'Summer trip',
        })
      );
      expect(onFinished).toHaveBeenCalled();
    });

    it('should save fixed points on step 2', async () => {
      vi.mocked(PlanFormApiService.createPlan).mockResolvedValue({
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Trip to Paris',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        notes: null,
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      vi.mocked(PlanFormApiService.syncFixedPoints).mockResolvedValue({
        success: true,
        errors: [],
      });

      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.updateBasicInfo({ destination: 'Paris' });
        result.current.nextStep(); // Go to step 2
        result.current.addFixedPoint({
          location: 'Museum',
          event_at: '2024-06-02T10:00:00Z',
          event_duration: 120,
          description: '',
        });
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(PlanFormApiService.syncFixedPoints).toHaveBeenCalled();
    });

    it('should handle save error', async () => {
      vi.mocked(PlanFormApiService.createPlan).mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.updateBasicInfo({ destination: 'Paris' });
      });

      await act(async () => {
        await result.current.saveDraft();
      });

      expect(result.current.error).toBe('Save failed');
    });
  });

  describe('handleSubmit', () => {
    it('should create plan and generate', async () => {
      vi.mocked(PlanFormApiService.createPlan).mockResolvedValue({
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Trip to Rome',
        destination: 'Rome',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        notes: null,
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      vi.mocked(PlanFormApiService.generatePlan).mockResolvedValue(undefined);

      const onFinished = vi.fn();
      const { result } = renderHook(() => useNewPlanForm({ onFinished }));

      act(() => {
        result.current.updateBasicInfo({ destination: 'Rome' });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(PlanFormApiService.createPlan).toHaveBeenCalled();
      expect(PlanFormApiService.generatePlan).toHaveBeenCalledWith('plan-1');
      expect(onFinished).toHaveBeenCalled();
    });

    it('should set isGenerating during generation', async () => {
      vi.mocked(PlanFormApiService.createPlan).mockResolvedValue({
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        notes: null,
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      vi.mocked(PlanFormApiService.generatePlan).mockResolvedValue(undefined);

      const onFinished = vi.fn();
      const { result } = renderHook(() => useNewPlanForm({ onFinished }));

      act(() => {
        result.current.updateBasicInfo({ destination: 'Paris' });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      // isGenerating remains true after successful generation (component unmounts/navigates)
      expect(result.current.isGenerating).toBe(true);
      expect(onFinished).toHaveBeenCalled();
    });

    it('should handle submission error', async () => {
      vi.mocked(PlanFormApiService.createPlan).mockRejectedValue(new Error('Submission failed'));

      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.updateBasicInfo({ destination: 'Paris' });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Submission failed');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should redirect when no onFinished callback', async () => {
      vi.mocked(PlanFormApiService.createPlan).mockResolvedValue({
        id: 'plan-123',
        user_id: 'user-1',
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        notes: null,
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      vi.mocked(PlanFormApiService.generatePlan).mockResolvedValue(undefined);

      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.updateBasicInfo({ destination: 'Paris' });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(window.location.href).toBe('/plans/plan-123');
    });

    it('should sync fixed points if they exist', async () => {
      vi.mocked(PlanFormApiService.createPlan).mockResolvedValue({
        id: 'plan-1',
        user_id: 'user-1',
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        notes: null,
        generated_content: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      vi.mocked(PlanFormApiService.syncFixedPoints).mockResolvedValue({
        success: true,
        errors: [],
      });

      vi.mocked(PlanFormApiService.generatePlan).mockResolvedValue(undefined);

      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.updateBasicInfo({ destination: 'Paris' });
        result.current.addFixedPoint({
          location: 'Museum',
          event_at: '2024-06-02T10:00:00Z',
          event_duration: 120,
          description: '',
        });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(PlanFormApiService.syncFixedPoints).toHaveBeenCalledWith('plan-1', expect.any(Array));
    });
  });
});
