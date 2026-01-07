import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/EmptyState';

// Mock window.location
// @ts-expect-error - Mocking window.location for testing
delete window.location;
// @ts-expect-error - Mocking window.location for testing
window.location = { href: '' };

describe('EmptyState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
  });

  describe('rendering', () => {
    it('should render empty state container', () => {
      render(<EmptyState />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should render heading', () => {
      render(<EmptyState />);

      const heading = screen.getByTestId('empty-state-heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Nie masz jeszcze żadnych planów');
    });

    it('should render description', () => {
      render(<EmptyState />);

      const description = screen.getByTestId('empty-state-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(/Zacznij planować swoją przygodę/);
    });

    it('should render create plan button', () => {
      render(<EmptyState />);

      const button = screen.getByTestId('create-first-plan-btn');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Utwórz swój pierwszy plan');
    });

    it('should render map icon', () => {
      const { container } = render(<EmptyState />);

      const icon = container.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should have proper styling classes', () => {
      render(<EmptyState />);

      const container = screen.getByTestId('empty-state');
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });

  describe('interactions', () => {
    it('should call onCreatePlan callback when button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCreatePlan = vi.fn();

      render(<EmptyState onCreatePlan={mockOnCreatePlan} />);

      const button = screen.getByTestId('create-first-plan-btn');
      await user.click(button);

      expect(mockOnCreatePlan).toHaveBeenCalledTimes(1);
    });

    it('should navigate to /plans/new when button clicked without callback', async () => {
      const user = userEvent.setup();

      render(<EmptyState />);

      const button = screen.getByTestId('create-first-plan-btn');
      await user.click(button);

      expect(window.location.href).toBe('/plans/new');
    });

    it('should not navigate when callback is provided', async () => {
      const user = userEvent.setup();
      const mockOnCreatePlan = vi.fn();

      render(<EmptyState onCreatePlan={mockOnCreatePlan} />);

      const button = screen.getByTestId('create-first-plan-btn');
      await user.click(button);

      expect(window.location.href).toBe('');
      expect(mockOnCreatePlan).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-hidden on decorative icon', () => {
      const { container } = render(<EmptyState />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have semantic heading structure', () => {
      render(<EmptyState />);

      const heading = screen.getByTestId('empty-state-heading');
      expect(heading.tagName).toBe('H3');
    });
  });
});
