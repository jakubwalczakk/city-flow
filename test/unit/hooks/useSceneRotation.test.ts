import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSceneRotation } from '@/hooks/useSceneRotation';

describe('useSceneRotation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should start at scene 0', () => {
    const { result } = renderHook(() => useSceneRotation(3));

    expect(result.current.currentScene).toBe(0);
  });

  it('should rotate to next scene after interval', () => {
    const { result } = renderHook(() => useSceneRotation(3, 1000));

    expect(result.current.currentScene).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentScene).toBe(1);
  });

  it('should rotate through all scenes', () => {
    const { result } = renderHook(() => useSceneRotation(3, 1000));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.currentScene).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.currentScene).toBe(2);
  });

  it('should wrap back to scene 0 after last scene', () => {
    const { result } = renderHook(() => useSceneRotation(3, 1000));

    act(() => {
      vi.advanceTimersByTime(3000); // Advance through all 3 scenes
    });

    expect(result.current.currentScene).toBe(0);
  });

  it('should use default interval of 3000ms', () => {
    const { result } = renderHook(() => useSceneRotation(3));

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(result.current.currentScene).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.currentScene).toBe(1);
  });

  it('should handle single scene', () => {
    const { result } = renderHook(() => useSceneRotation(1, 1000));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should wrap to 0 (the only scene)
    expect(result.current.currentScene).toBe(0);
  });

  it('should cleanup interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useSceneRotation(3, 1000));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should restart interval when sceneCount changes', () => {
    const { result, rerender } = renderHook(({ count, interval }) => useSceneRotation(count, interval), {
      initialProps: { count: 3, interval: 1000 },
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.currentScene).toBe(2);

    // Change sceneCount
    rerender({ count: 5, interval: 1000 });

    // Scene doesn't reset, but interval restarts with new sceneCount
    expect(result.current.currentScene).toBe(2);

    // Next tick should wrap with new sceneCount (5)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.currentScene).toBe(3);
  });

  it('should restart interval when intervalMs changes', () => {
    const { result, rerender } = renderHook(({ count, interval }) => useSceneRotation(count, interval), {
      initialProps: { count: 3, interval: 1000 },
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.currentScene).toBe(1);

    // Change interval
    rerender({ count: 3, interval: 500 });

    // Should continue from current scene with new interval
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.currentScene).toBe(2);
  });

  it('should handle many scenes', () => {
    const { result } = renderHook(() => useSceneRotation(10, 100));

    act(() => {
      vi.advanceTimersByTime(950);
    });

    expect(result.current.currentScene).toBe(9);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.currentScene).toBe(0); // Wraps back
  });
});
