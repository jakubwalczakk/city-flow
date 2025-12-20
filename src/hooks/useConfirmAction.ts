import { useState, useCallback, useTransition } from 'react';

type UseConfirmActionOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

/**
 * Custom hook for managing confirmation dialog state and async action execution.
 * Uses useTransition for non-blocking UI updates during async operations.
 *
 * @param action - Async function to execute upon confirmation
 * @param options - Optional callbacks for success/error handling
 */
export function useConfirmAction(action: () => Promise<void>, options: UseConfirmActionOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const execute = useCallback(() => {
    startTransition(async () => {
      try {
        await action();
        setIsOpen(false);
        options.onSuccess?.();
      } catch (error) {
        options.onError?.(error);
      }
    });
  }, [action, options]);

  return {
    isOpen,
    isPending,
    open,
    close,
    execute,
    setIsOpen,
  };
}
