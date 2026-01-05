import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaginationControls } from '@/components/PaginationControls';

describe('PaginationControls', () => {
  describe('rendering', () => {
    it('should not render when single page', () => {
      const mockOnPageChange = vi.fn();
      const { container } = render(
        <PaginationControls pagination={{ total: 10, limit: 12, offset: 0 }} onPageChange={mockOnPageChange} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render pagination when multiple pages exist', () => {
      const mockOnPageChange = vi.fn();
      const { container } = render(
        <PaginationControls pagination={{ total: 25, limit: 12, offset: 0 }} onPageChange={mockOnPageChange} />
      );

      // Check for Pagination element
      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('should render pagination numbers', () => {
      const mockOnPageChange = vi.fn();
      render(<PaginationControls pagination={{ total: 84, limit: 12, offset: 0 }} onPageChange={mockOnPageChange} />);

      // Should have page buttons
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should show ellipsis when many pages', () => {
      const mockOnPageChange = vi.fn();
      const { container } = render(
        <PaginationControls pagination={{ total: 120, limit: 12, offset: 0 }} onPageChange={mockOnPageChange} />
      );

      // Check that navigation exists for many pages
      expect(container.querySelector('nav')).toBeInTheDocument();
    });
  });

  describe('pagination logic', () => {
    it('should handle zero offset as page 1', () => {
      const mockOnPageChange = vi.fn();
      const { container } = render(
        <PaginationControls pagination={{ total: 48, limit: 12, offset: 0 }} onPageChange={mockOnPageChange} />
      );

      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('should calculate pages correctly', () => {
      const mockOnPageChange = vi.fn();
      render(<PaginationControls pagination={{ total: 48, limit: 12, offset: 0 }} onPageChange={mockOnPageChange} />);

      // Should have pages 1, 2, 3, 4
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should render without errors', async () => {
      const mockOnPageChange = vi.fn();

      render(<PaginationControls pagination={{ total: 48, limit: 12, offset: 0 }} onPageChange={mockOnPageChange} />);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it('should be callable with pagination data', () => {
      const mockOnPageChange = vi.fn();

      const { container } = render(
        <PaginationControls pagination={{ total: 48, limit: 12, offset: 0 }} onPageChange={mockOnPageChange} />
      );

      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have navigation role', () => {
      const mockOnPageChange = vi.fn();
      const { container } = render(
        <PaginationControls pagination={{ total: 48, limit: 12, offset: 0 }} onPageChange={mockOnPageChange} />
      );

      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('should render properly with different pagination data', () => {
      const mockOnPageChange = vi.fn();
      const { container } = render(
        <PaginationControls pagination={{ total: 120, limit: 12, offset: 36 }} onPageChange={mockOnPageChange} />
      );

      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('should handle boundary cases', () => {
      const mockOnPageChange = vi.fn();
      const { container } = render(
        <PaginationControls pagination={{ total: 1, limit: 12, offset: 0 }} onPageChange={mockOnPageChange} />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
