import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExportPlan } from '@/hooks/useExportPlan';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useExportPlan', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
  let mockLink: HTMLAnchorElement;
  let originalCreateElement: typeof document.createElement;
  let originalAppendChild: typeof document.body.appendChild;
  let originalRemoveChild: typeof document.body.removeChild;

  beforeEach(() => {
    // Mock fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock URL methods
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Store original DOM methods
    originalCreateElement = document.createElement.bind(document);
    originalAppendChild = document.body.appendChild.bind(document.body);
    originalRemoveChild = document.body.removeChild.bind(document.body);

    // Mock document.createElement to return our mock link only for 'a' elements
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'a') {
        mockLink = {
          href: '',
          download: '',
          click: vi.fn(),
        } as unknown as HTMLAnchorElement;
        return mockLink;
      }
      return originalCreateElement(tagName);
    });

    // Mock append/remove methods
    document.body.appendChild = vi.fn((node) => node) as typeof document.body.appendChild;
    document.body.removeChild = vi.fn((node) => node) as typeof document.body.removeChild;

    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original DOM methods
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with isLoading false', () => {
      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test Plan' }));

      expect(result.current.isLoading).toBe(false);
    });

    it('should compute isDisabled based on planId and isLoading', () => {
      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test Plan' }));

      expect(result.current.isDisabled).toBe(false);
    });

    it('should be disabled when planId is empty', () => {
      const { result } = renderHook(() => useExportPlan({ planId: '', planName: 'Test Plan' }));

      expect(result.current.isDisabled).toBe(true);
    });
  });

  describe('handleExport', () => {
    it('should successfully export plan and download PDF', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: new Headers({
          'Content-Disposition': 'attachment; filename="My-Trip.pdf"',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test Plan' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/plans/plan-1/export?format=pdf', {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toBe('My-Trip.pdf');
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(toast.success).toHaveBeenCalledWith('Plan został pomyślnie wyeksportowany', {
        description: 'Plik My-Trip.pdf został pobrany',
      });
    });

    it('should use fallback filename when Content-Disposition header is missing', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: new Headers(), // No Content-Disposition
      };

      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'My Trip' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(mockLink.download).toBe('My Trip.pdf');
      expect(toast.success).toHaveBeenCalledWith('Plan został pomyślnie wyeksportowany', {
        description: 'Plik My Trip.pdf został pobrany',
      });
    });

    it('should extract filename from Content-Disposition with quotes', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: new Headers({
          'Content-Disposition': 'attachment; filename="Paris-Trip-2024.pdf"',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(mockLink.download).toBe('Paris-Trip-2024.pdf');
    });

    it('should extract filename from Content-Disposition without quotes', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: new Headers({
          'Content-Disposition': 'attachment; filename=Paris-Trip.pdf',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(mockLink.download).toBe('Paris-Trip.pdf');
    });

    it('should set isLoading during export', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: new Headers(),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      // isLoading should be false after completion
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isDisabled).toBe(false);
    });

    it('should not export when planId is empty', async () => {
      const { result } = renderHook(() => useExportPlan({ planId: '', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle 404 error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(toast.error).toHaveBeenCalledWith('Błąd eksportu', {
        description: 'Nie znaleziono podanego planu.',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle 500 error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(toast.error).toHaveBeenCalledWith('Błąd eksportu', {
        description: 'Wystąpił błąd po stronie serwera. Prosimy spróbować ponownie później.',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle other HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
      });

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(toast.error).toHaveBeenCalledWith('Błąd eksportu', {
        description: 'Błąd eksportu: 403',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(toast.error).toHaveBeenCalledWith('Błąd eksportu', {
        description: 'Network connection failed',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(toast.error).toHaveBeenCalledWith('Błąd eksportu', {
        description: 'Nie udało się wyeksportować planu.',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should always reset isLoading after error', async () => {
      mockFetch.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isDisabled).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should clean up blob URL and DOM elements', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: new Headers(),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      // Verify cleanup
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should create and click link element', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
        headers: new Headers(),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      await act(async () => {
        await result.current.handleExport();
      });

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('isDisabled computed property', () => {
    it('should be disabled when planId is empty', () => {
      const { result } = renderHook(() => useExportPlan({ planId: '', planName: 'Test' }));

      expect(result.current.isDisabled).toBe(true);
    });

    it('should be enabled with valid planId and not loading', () => {
      const { result } = renderHook(() => useExportPlan({ planId: 'plan-1', planName: 'Test' }));

      expect(result.current.isDisabled).toBe(false);
    });

    it('should update when props change', () => {
      const { result, rerender } = renderHook((props) => useExportPlan(props), {
        initialProps: { planId: 'plan-1', planName: 'Test' },
      });

      expect(result.current.isDisabled).toBe(false);

      // Change to empty planId
      rerender({ planId: '', planName: 'Test' });

      expect(result.current.isDisabled).toBe(true);
    });
  });
});
