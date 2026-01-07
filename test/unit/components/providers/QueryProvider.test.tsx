import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryProvider } from '@/components/providers/QueryProvider';

// Mock QueryClientProvider
vi.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='query-client-provider'>{children}</div>
  ),
}));

// Mock queryClient
vi.mock('@/lib/queryClient', () => ({
  queryClient: {},
}));

describe('QueryProvider', () => {
  describe('rendering', () => {
    it('should render children within QueryClientProvider', () => {
      render(
        <QueryProvider>
          <div data-testid='child-component'>Test Child</div>
        </QueryProvider>
      );

      expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should wrap multiple children', () => {
      render(
        <QueryProvider>
          <div data-testid='child-1'>Child 1</div>
          <div data-testid='child-2'>Child 2</div>
        </QueryProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should render without children', () => {
      const { container } = render(<QueryProvider>{null}</QueryProvider>);

      expect(container).toBeInTheDocument();
    });
  });
});
