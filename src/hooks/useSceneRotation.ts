import { useEffect, useState } from 'react';

/**
 * Hook for rotating through scenes at a specified interval.
 * Used for animated loading states.
 *
 * @param sceneCount - Number of scenes to rotate through
 * @param intervalMs - Interval in milliseconds between scene changes
 */
export function useSceneRotation(sceneCount: number, intervalMs = 3000) {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % sceneCount);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [sceneCount, intervalMs]);

  return { currentScene };
}
