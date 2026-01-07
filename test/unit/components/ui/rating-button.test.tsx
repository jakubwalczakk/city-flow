import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RatingButton } from '@/components/ui/rating-button';

describe('RatingButton', () => {
  describe('rendering', () => {
    it('should render button with correct aria label for thumbs_up', () => {
      const mockOnSelect = vi.fn();
      render(<RatingButton type='thumbs_up' selected={false} onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /kciuk w górę/i });
      expect(button).toBeInTheDocument();
    });

    it('should render button with correct aria label for thumbs_down', () => {
      const mockOnSelect = vi.fn();
      render(<RatingButton type='thumbs_down' selected={false} onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /kciuk w dół/i });
      expect(button).toBeInTheDocument();
    });

    it('should apply selected styling when selected', () => {
      const mockOnSelect = vi.fn();
      const { container } = render(<RatingButton type='thumbs_up' selected={true} onSelect={mockOnSelect} />);

      const button = container.querySelector('button');
      expect(button).toHaveClass('border-green-500');
    });

    it('should apply unselected styling when not selected', () => {
      const mockOnSelect = vi.fn();
      const { container } = render(<RatingButton type='thumbs_down' selected={false} onSelect={mockOnSelect} />);

      const button = container.querySelector('button');
      expect(button).toHaveClass('border-muted');
    });
  });

  describe('interactions', () => {
    it('should call onSelect with correct type when clicked', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn();

      render(<RatingButton type='thumbs_up' selected={false} onSelect={mockOnSelect} />);

      const button = screen.getByRole('button', { name: /kciuk w górę/i });
      await user.click(button);

      expect(mockOnSelect).toHaveBeenCalledWith('thumbs_up');
    });

    it('should not call onSelect when disabled', async () => {
      const user = userEvent.setup();
      const mockOnSelect = vi.fn();

      render(<RatingButton type='thumbs_down' selected={false} onSelect={mockOnSelect} disabled />);

      const button = screen.getByRole('button', { name: /kciuk w dół/i });
      await user.click(button);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-pressed attribute', () => {
      const mockOnSelect = vi.fn();
      const { container } = render(<RatingButton type='thumbs_up' selected={true} onSelect={mockOnSelect} />);

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-pressed false when not selected', () => {
      const mockOnSelect = vi.fn();
      const { container } = render(<RatingButton type='thumbs_up' selected={false} onSelect={mockOnSelect} />);

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should be disabled when disabled prop is true', () => {
      const mockOnSelect = vi.fn();
      const { container } = render(<RatingButton type='thumbs_up' selected={false} onSelect={mockOnSelect} disabled />);

      const button = container.querySelector('button');
      expect(button).toBeDisabled();
    });
  });
});
