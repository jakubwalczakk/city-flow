import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlanFormApiService } from '@/lib/services/planFormApi.service';
import type { CreatePlanCommand, PlanDetailsDto, FixedPointDto, FixedPointFormItem } from '@/types';

// Mock fetch globally
global.fetch = vi.fn();

describe('PlanFormApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchPlanDetails', () => {
    it('should successfully fetch plan details', async () => {
      const mockPlan: PlanDetailsDto = {
        id: 'plan-123',
        name: 'My Trip',
        destination: 'Paris',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
        status: 'draft',
        user_id: 'user-1',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        notes: null,
        content: null,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockPlan,
      } as Response);

      const result = await PlanFormApiService.fetchPlanDetails('plan-123');

      expect(result).toEqual(mockPlan);
      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123');
    });

    it('should throw error when fetch fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Plan not found' }),
      } as Response);

      await expect(PlanFormApiService.fetchPlanDetails('plan-123')).rejects.toThrow('Plan not found');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(PlanFormApiService.fetchPlanDetails('plan-123')).rejects.toThrow();
    });
  });

  describe('fetchFixedPoints', () => {
    it('should successfully fetch fixed points', async () => {
      const mockFixedPoints: FixedPointDto[] = [
        {
          id: 'fp-1',
          plan_id: 'plan-123',
          location: 'Eiffel Tower',
          event_at: '2024-02-01T10:00:00Z',
          event_duration: 120,
          description: 'Visit tower',
          created_at: '2024-01-15',
        },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockFixedPoints,
      } as Response);

      const result = await PlanFormApiService.fetchFixedPoints('plan-123');

      expect(result).toEqual(mockFixedPoints);
      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123/fixed-points');
    });

    it('should throw error when fetch fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Fixed points not found' }),
      } as Response);

      await expect(PlanFormApiService.fetchFixedPoints('plan-123')).rejects.toThrow('Fixed points not found');
    });
  });

  describe('createPlan', () => {
    it('should successfully create a plan', async () => {
      const command: CreatePlanCommand = {
        name: 'New Trip',
        destination: 'London',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        notes: 'Some notes',
      };

      const mockResponse: PlanDetailsDto = {
        id: 'plan-new',
        ...command,
        status: 'draft',
        user_id: 'user-1',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        content: null,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await PlanFormApiService.createPlan(command);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
    });

    it('should throw error when creation fails', async () => {
      const command: CreatePlanCommand = {
        name: 'New Trip',
        destination: 'London',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        notes: null,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid data' }),
      } as Response);

      await expect(PlanFormApiService.createPlan(command)).rejects.toThrow('Invalid data');
    });
  });

  describe('updatePlan', () => {
    it('should successfully update a plan', async () => {
      const updateData = {
        name: 'Updated Trip',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        notes: 'Updated notes',
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response);

      await expect(PlanFormApiService.updatePlan('plan-123', updateData)).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
    });

    it('should throw error when update fails', async () => {
      const updateData = {
        name: 'Updated Trip',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        notes: null,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Update failed' }),
      } as Response);

      await expect(PlanFormApiService.updatePlan('plan-123', updateData)).rejects.toThrow('Update failed');
    });
  });

  describe('createFixedPoint', () => {
    it('should successfully create a fixed point', async () => {
      const point: Omit<FixedPointFormItem, 'id'> = {
        location: 'Big Ben',
        event_at: '2024-03-01T14:00:00Z',
        event_duration: 60,
        description: 'See Big Ben',
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response);

      await expect(PlanFormApiService.createFixedPoint('plan-123', point)).resolves.not.toThrow();

      const callArgs = vi.mocked(fetch).mock.calls[0];
      expect(callArgs[0]).toBe('/api/plans/plan-123/fixed-points');
      expect(callArgs[1]?.method).toBe('POST');
      expect(callArgs[1]?.headers).toEqual({ 'Content-Type': 'application/json' });

      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.location).toBe(point.location);
      expect(body.event_at).toMatch(/^2024-03-01T14:00:00/);
      expect(body.event_duration).toBe(point.event_duration);
      expect(body.description).toBe(point.description);
    });

    it('should normalize date to ISO format', async () => {
      const point: Omit<FixedPointFormItem, 'id'> = {
        location: 'Big Ben',
        event_at: '2024-03-01T14:00:00',
        event_duration: 60,
        description: null,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response);

      await PlanFormApiService.createFixedPoint('plan-123', point);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.event_at).toMatch(/Z$/); // Should end with Z (ISO format)
    });

    it('should throw error when creation fails', async () => {
      const point: Omit<FixedPointFormItem, 'id'> = {
        location: 'Big Ben',
        event_at: '2024-03-01T14:00:00Z',
        event_duration: 60,
        description: null,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid fixed point' }),
      } as Response);

      await expect(PlanFormApiService.createFixedPoint('plan-123', point)).rejects.toThrow('Invalid fixed point');
    });
  });

  describe('updateFixedPoint', () => {
    it('should successfully update a fixed point', async () => {
      const point: Omit<FixedPointFormItem, 'id'> = {
        location: 'Updated Location',
        event_at: '2024-03-01T15:00:00Z',
        event_duration: 90,
        description: 'Updated description',
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response);

      await expect(PlanFormApiService.updateFixedPoint('plan-123', 'fp-1', point)).resolves.not.toThrow();

      const callArgs = vi.mocked(fetch).mock.calls[0];
      expect(callArgs[0]).toBe('/api/plans/plan-123/fixed-points/fp-1');
      expect(callArgs[1]?.method).toBe('PATCH');
      expect(callArgs[1]?.headers).toEqual({ 'Content-Type': 'application/json' });

      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.location).toBe(point.location);
      expect(body.event_at).toMatch(/^2024-03-01T15:00:00/);
      expect(body.event_duration).toBe(point.event_duration);
      expect(body.description).toBe(point.description);
    });

    it('should throw error when update fails', async () => {
      const point: Omit<FixedPointFormItem, 'id'> = {
        location: 'Updated Location',
        event_at: '2024-03-01T15:00:00Z',
        event_duration: 90,
        description: null,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Update failed' }),
      } as Response);

      await expect(PlanFormApiService.updateFixedPoint('plan-123', 'fp-1', point)).rejects.toThrow('Update failed');
    });
  });

  describe('deleteFixedPoint', () => {
    it('should successfully delete a fixed point', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response);

      await expect(PlanFormApiService.deleteFixedPoint('plan-123', 'fp-1')).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123/fixed-points/fp-1', {
        method: 'DELETE',
      });
    });

    it('should throw error when deletion fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Fixed point not found' }),
      } as Response);

      await expect(PlanFormApiService.deleteFixedPoint('plan-123', 'fp-1')).rejects.toThrow('Fixed point not found');
    });
  });

  describe('syncFixedPoints', () => {
    it('should sync fixed points successfully', async () => {
      const formPoints: FixedPointFormItem[] = [
        {
          id: 'fp-1',
          location: 'Existing Point',
          event_at: '2024-03-01T10:00:00Z',
          event_duration: 60,
          description: null,
        },
        {
          location: 'New Point',
          event_at: '2024-03-01T14:00:00Z',
          event_duration: 90,
          description: 'New',
        },
      ];

      // Mock fetch for fetching existing points
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'fp-1',
            plan_id: 'plan-123',
            location: 'Old Location',
            event_at: '2024-03-01T10:00:00Z',
            event_duration: 60,
            description: null,
            created_at: '2024-01-15',
          },
          {
            id: 'fp-2',
            plan_id: 'plan-123',
            location: 'To Delete',
            event_at: '2024-03-01T12:00:00Z',
            event_duration: 60,
            description: null,
            created_at: '2024-01-15',
          },
        ],
      } as Response);

      // Mock fetch for update
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      // Mock fetch for create
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      // Mock fetch for delete
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await PlanFormApiService.syncFixedPoints('plan-123', formPoints);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(fetch).toHaveBeenCalledTimes(4); // fetch existing + update + create + delete
    });

    it('should handle errors during sync', async () => {
      const formPoints: FixedPointFormItem[] = [
        {
          id: 'fp-1',
          location: 'Point',
          event_at: '2024-03-01T10:00:00Z',
          event_duration: 60,
          description: null,
        },
      ];

      // Mock fetch for fetching existing points
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'fp-1',
            plan_id: 'plan-123',
            location: 'Old Location',
            event_at: '2024-03-01T10:00:00Z',
            event_duration: 60,
            description: null,
            created_at: '2024-01-15',
          },
        ],
      } as Response);

      // Mock fetch for update - fails
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Update failed' }),
      } as Response);

      const result = await PlanFormApiService.syncFixedPoints('plan-123', formPoints);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty form points', async () => {
      // Mock fetch for fetching existing points
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await PlanFormApiService.syncFixedPoints('plan-123', []);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('generatePlan', () => {
    it('should successfully trigger plan generation', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response);

      await expect(PlanFormApiService.generatePlan('plan-123')).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith('/api/plans/plan-123/generate', {
        method: 'POST',
      });
    });

    it('should throw error when generation fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Generation failed' }),
      } as Response);

      await expect(PlanFormApiService.generatePlan('plan-123')).rejects.toThrow(
        'The plan could not be generated: Generation failed'
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(PlanFormApiService.generatePlan('plan-123')).rejects.toThrow();
    });
  });
});
