import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ToasterWrapper from '@/components/ToasterWrapper';

// Mock the sonner Toaster component
vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid='mocked-toaster'>Toaster</div>,
}));

describe('ToasterWrapper', () => {
  describe('rendering', () => {
    it('should render the Toaster component', () => {
      const { getByTestId } = render(<ToasterWrapper />);

      expect(getByTestId('mocked-toaster')).toBeInTheDocument();
    });

    it('should render without crashing', () => {
      const { container } = render(<ToasterWrapper />);

      expect(container).toBeInTheDocument();
    });
  });
});
