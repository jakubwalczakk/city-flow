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
      date: new Date(p.date),
      time: p.time,
      title: p.title,
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
    window.location = { href: '' } as unknown as Location;
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
        has_fixed_points: true,
      };

      const mockPlanDetails = {
        id: 'plan-1',
        name: 'Existing Plan',
        destination: 'Paris',
        start_date: '2024-07-01',
        end_date: '2024-07-05',
        notes: 'Visit museums',
        status: 'draft',
        created_at: '2024-01-01',
        timeline: [],
      };

      const mockFixedPoints: FixedPointDto[] = [
        {
          id: 'fp-1',
          plan_id: 'plan-1',
          date: '2024-07-02',
          time: '14:00',
          title: 'Eiffel Tower',
          description: 'Visit',
          created_at: '2024-01-01',
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
        has_fixed_points: false,
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
        date: new Date('2024-06-02'),
        time: '10:00',
        title: 'Museum Visit',
        description: 'Art museum',
      };

      act(() => {
        result.current.addFixedPoint(fixedPoint);
      });

      expect(result.current.formData.fixedPoints).toHaveLength(1);
      expect(result.current.formData.fixedPoints[0].title).toBe('Museum Visit');
    });

    it('should remove fixed point by index', () => {
      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.addFixedPoint({
          date: new Date('2024-06-02'),
          time: '10:00',
          title: 'Point 1',
          description: '',
        });
        result.current.addFixedPoint({
          date: new Date('2024-06-03'),
          time: '14:00',
          title: 'Point 2',
          description: '',
        });
      });

      expect(result.current.formData.fixedPoints).toHaveLength(2);

      act(() => {
        result.current.removeFixedPoint(0);
      });

      expect(result.current.formData.fixedPoints).toHaveLength(1);
      expect(result.current.formData.fixedPoints[0].title).toBe('Point 2');
    });

    it('should update fixed point by index', () => {
      const { result } = renderHook(() => useNewPlanForm());

      act(() => {
        result.current.addFixedPoint({
          id: 'fp-1',
          date: new Date('2024-06-02'),
          time: '10:00',
          title: 'Original',
          description: '',
        });
      });

      act(() => {
        result.current.updateFixedPoint(0, {
          date: new Date('2024-06-02'),
          time: '11:00',
          title: 'Updated',
          description: 'New description',
        });
      });

      expect(result.current.formData.fixedPoints[0].title).toBe('Updated');
      expect(result.current.formData.fixedPoints[0].time).toBe('11:00');
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
        name: 'Trip to Paris',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        created_at: '2024-01-01',
        has_fixed_points: false,
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
        name: 'Trip to Paris',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        created_at: '2024-01-01',
        has_fixed_points: false,
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
          date: new Date('2024-06-02'),
          time: '10:00',
          title: 'Museum',
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
        name: 'Trip to Rome',
        destination: 'Rome',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        created_at: '2024-01-01',
        has_fixed_points: false,
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
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        created_at: '2024-01-01',
        has_fixed_points: false,
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
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        created_at: '2024-01-01',
        has_fixed_points: false,
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
        name: 'Trip',
        destination: 'Paris',
        start_date: '2024-06-01',
        end_date: '2024-06-08',
        status: 'draft',
        created_at: '2024-01-01',
        has_fixed_points: false,
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
          date: new Date('2024-06-02'),
          time: '10:00',
          title: 'Museum',
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
