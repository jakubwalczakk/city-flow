import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { ReactNode } from 'react';

type QueryProviderProps = {
  children: ReactNode;
};

/**
 * Wraps children with React Query's QueryClientProvider
 * Should be placed high in the component tree
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
