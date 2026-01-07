import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotesSection } from '@/components/draft-plan/NotesSection';

describe('NotesSection', () => {
  const mockOnChange = vi.fn();
  const mockNotes = 'Test travel notes';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render section title', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      expect(screen.getByText('Notatki i preferencje podróży')).toBeInTheDocument();
    });

    it('should render textarea with correct id', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'notes');
    });

    it('should render textarea with placeholder', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      const textarea = screen.getByPlaceholderText(/Dodaj notatki o swoim stylu podróżowania/);
      expect(textarea).toBeInTheDocument();
    });

    it('should render help text', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      expect(screen.getByText(/Podziel się swoimi preferencjami/)).toBeInTheDocument();
    });

    it('should display current notes value', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(mockNotes);
    });

    it('should render empty textarea when notes are empty', () => {
      render(<NotesSection notes='' onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should have label associated with textarea', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      const label = screen.getByText('Notatki i preferencje podróży');
      expect(label).toHaveAttribute('for', 'notes');
    });
  });

  describe('interactions', () => {
    it('should call onChange when text is typed', async () => {
      const user = userEvent.setup();
      render(<NotesSection notes='' onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'New notes');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should call onChange with correct value', async () => {
      const user = userEvent.setup();
      render(<NotesSection notes='' onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'A');

      // Check the last call
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
      expect(lastCall[0]).toBe('A');
    });

    it('should update value as user types', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<NotesSection notes='' onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');

      // Simulate parent component updating the notes prop
      rerender(<NotesSection notes='Test' onChange={mockOnChange} />);

      expect((textarea as HTMLTextAreaElement).value).toBe('Test');
    });

    it('should handle clearing the textarea', async () => {
      const user = userEvent.setup();
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should handle multi-line text', async () => {
      const user = userEvent.setup();
      render(<NotesSection notes='' onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{Enter}Line 2');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('textarea attributes', () => {
    it('should have 8 rows', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '8');
    });

    it('should have resize-none class', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-none');
    });

    it('should be a textarea element', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('accessibility', () => {
    it('should have proper label for screen readers', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      const label = screen.getByLabelText('Notatki i preferencje podróży');
      expect(label).toBeInTheDocument();
    });

    it('should have descriptive help text', () => {
      render(<NotesSection notes={mockNotes} onChange={mockOnChange} />);

      const helpText = screen.getByText(/obowiązkowe atrakcje, preferencje żywieniowe/);
      expect(helpText).toBeInTheDocument();
    });
  });
});
