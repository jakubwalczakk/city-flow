import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnboardingModal } from '@/hooks/useOnboardingModal';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import type { ProfileDto } from '@/types';

// Mock dependencies
vi.mock('@/hooks/useProfile');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useOnboardingModal', () => {
  let mockUpdateProfile: ReturnType<typeof vi.fn>;
  let mockProfile: ProfileDto;

  beforeEach(() => {
    mockUpdateProfile = vi.fn().mockResolvedValue(undefined);
    mockProfile = {
      id: 'user-1',
      travel_pace: null,
      preferences: [],
      onboarding_completed: false,
      generations_remaining: 5,
      created_at: '2024-01-01',
    };

    vi.mocked(useProfile).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      updateProfile: mockUpdateProfile,
    });

    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useOnboardingModal());

      expect(result.current.pace).toBeNull();
      expect(result.current.preferences).toEqual([]);
      expect(result.current.errors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should provide profile from useProfile', () => {
      const { result } = renderHook(() => useOnboardingModal());

      expect(result.current.profile).toEqual(mockProfile);
    });
  });

  describe('modal auto-opening', () => {
    it('should open modal when profile is loaded and onboarding not completed', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      await waitFor(() => {
        expect(result.current.isOpen).toBe(true);
      });
    });

    it('should not open modal when onboarding is completed', async () => {
      vi.mocked(useProfile).mockReturnValue({
        profile: { ...mockProfile, onboarding_completed: true },
        isLoading: false,
        updateProfile: mockUpdateProfile,
      });

      const { result } = renderHook(() => useOnboardingModal());

      expect(result.current.isOpen).toBe(false);
    });

    it('should not open modal when profile is still loading', async () => {
      vi.mocked(useProfile).mockReturnValue({
        profile: null,
        isLoading: true,
        updateProfile: mockUpdateProfile,
      });

      const { result } = renderHook(() => useOnboardingModal());

      expect(result.current.isOpen).toBe(false);
    });

    it('should not open modal when profile is null', async () => {
      vi.mocked(useProfile).mockReturnValue({
        profile: null,
        isLoading: false,
        updateProfile: mockUpdateProfile,
      });

      const { result } = renderHook(() => useOnboardingModal());

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('state management', () => {
    it('should update pace', () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPace('slow');
      });

      expect(result.current.pace).toBe('slow');
    });

    it('should update preferences', () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPreferences(['history', 'culture']);
      });

      expect(result.current.preferences).toEqual(['history', 'culture']);
    });

    it('should allow manual modal open/close', () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setIsOpen(false);
      });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.setIsOpen(true);
      });

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('validation', () => {
    it('should validate when pace is missing', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPreferences(['history', 'culture']);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.errors.pace).toBe('Wybierz preferowane tempo zwiedzania.');
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should validate when preferences are too few', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPace('moderate');
        result.current.setPreferences(['history']); // Only 1
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.errors.preferences).toBe('Wybierz od 2 do 5 preferencji.');
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should validate when preferences are too many', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPace('moderate');
        result.current.setPreferences(['history', 'culture', 'nature', 'food', 'sport', 'transport']); // 6
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.errors.preferences).toBe('Wybierz od 2 do 5 preferencji.');
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it('should pass validation with valid data', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPace('moderate');
        result.current.setPreferences(['history', 'culture', 'nature']);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.errors).toEqual({});
      expect(mockUpdateProfile).toHaveBeenCalled();
    });

    it('should allow exactly 2 preferences', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPace('fast');
        result.current.setPreferences(['history', 'culture']); // Exactly 2
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.errors).toEqual({});
      expect(mockUpdateProfile).toHaveBeenCalled();
    });

    it('should allow exactly 5 preferences', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPace('fast');
        result.current.setPreferences(['history', 'culture', 'nature', 'food', 'sport']); // Exactly 5
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.errors).toEqual({});
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });

  describe('handleSave', () => {
    it('should save valid onboarding data', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPace('moderate');
        result.current.setPreferences(['history', 'culture']);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        travel_pace: 'moderate',
        preferences: ['history', 'culture'],
        onboarding_completed: true,
      });
      expect(toast.success).toHaveBeenCalledWith('Profil zaktualizowany');
      expect(result.current.isOpen).toBe(false);
    });

    it('should reset isSubmitting after save', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPace('slow');
        result.current.setPreferences(['history', 'culture']);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      // isSubmitting should be false after operation completes
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle save errors', async () => {
      mockUpdateProfile.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useOnboardingModal());

      act(() => {
        result.current.setPace('moderate');
        result.current.setPreferences(['history', 'culture']);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(toast.error).toHaveBeenCalledWith('Wystąpił błąd podczas zapisywania profilu.');
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isOpen).toBe(true); // Modal stays open
    });

    it('should not proceed if validation fails', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      // Don't set pace - validation will fail
      act(() => {
        result.current.setPreferences(['history', 'culture']);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockUpdateProfile).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe('handleSkip', () => {
    it('should skip onboarding and mark as completed', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      await act(async () => {
        await result.current.handleSkip();
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        onboarding_completed: true,
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('should reset isSubmitting after skip', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      await act(async () => {
        await result.current.handleSkip();
      });

      // isSubmitting should be false after operation completes
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle skip errors', async () => {
      mockUpdateProfile.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useOnboardingModal());

      await act(async () => {
        await result.current.handleSkip();
      });

      expect(toast.error).toHaveBeenCalledWith('Wystąpił błąd.');
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isOpen).toBe(true); // Modal stays open
    });
  });

  describe('error clearing', () => {
    it('should clear errors on successful validation', async () => {
      const { result } = renderHook(() => useOnboardingModal());

      // First, trigger validation error
      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.errors.pace).toBeDefined();

      // Now fix the data
      act(() => {
        result.current.setPace('moderate');
        result.current.setPreferences(['history', 'culture']);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.errors).toEqual({});
    });
  });
});
