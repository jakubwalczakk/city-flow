import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableTitle } from '@/components/plan-header/EditableTitle';
import * as useEditableTitleModule from '@/hooks/useEditableTitle';

vi.mock('@/hooks/useEditableTitle');

describe('EditableTitle', () => {
  const mockTitle = 'My Travel Plan';
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display mode', () => {
    it('renders title in display mode', () => {
      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: false,
        editedName: mockTitle,
        setEditedName: vi.fn(),
        isSaving: false,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        handleKeyDown: vi.fn(),
        canSave: true,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(mockTitle);
    });

    it('renders edit button', () => {
      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: false,
        editedName: mockTitle,
        setEditedName: vi.fn(),
        isSaving: false,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        handleKeyDown: vi.fn(),
        canSave: true,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      expect(screen.getByRole('button', { name: /edytuj nazwę planu/i })).toBeInTheDocument();
    });

    it('calls startEditing when edit button is clicked', async () => {
      const user = userEvent.setup();
      const startEditing = vi.fn();

      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: false,
        editedName: mockTitle,
        setEditedName: vi.fn(),
        isSaving: false,
        inputRef: { current: null },
        startEditing,
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        handleKeyDown: vi.fn(),
        canSave: true,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      const editButton = screen.getByRole('button', { name: /edytuj nazwę planu/i });
      await user.click(editButton);

      expect(startEditing).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edit mode', () => {
    it('renders input field in edit mode', () => {
      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: true,
        editedName: mockTitle,
        setEditedName: vi.fn(),
        isSaving: false,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        handleKeyDown: vi.fn(),
        canSave: true,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue(mockTitle);
      expect(input).toHaveAttribute('placeholder', 'Nazwa planu');
    });

    it('renders save and cancel buttons in edit mode', () => {
      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: true,
        editedName: mockTitle,
        setEditedName: vi.fn(),
        isSaving: false,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        handleKeyDown: vi.fn(),
        canSave: true,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      expect(screen.getByRole('button', { name: /zapisz/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /anuluj/i })).toBeInTheDocument();
    });

    it('hides heading and edit button in edit mode', () => {
      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: true,
        editedName: mockTitle,
        setEditedName: vi.fn(),
        isSaving: false,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        handleKeyDown: vi.fn(),
        canSave: true,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edytuj nazwę planu/i })).not.toBeInTheDocument();
    });

    it('calls setEditedName when input value changes', async () => {
      const user = userEvent.setup();
      const setEditedName = vi.fn();

      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: true,
        editedName: mockTitle,
        setEditedName,
        isSaving: false,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        handleKeyDown: vi.fn(),
        canSave: true,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'New Title');

      expect(setEditedName).toHaveBeenCalled();
    });

    it('calls handleSave when save button is clicked', async () => {
      const user = userEvent.setup();
      const handleSave = vi.fn();

      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: true,
        editedName: 'New Title',
        setEditedName: vi.fn(),
        isSaving: false,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave,
        handleCancel: vi.fn(),
        handleKeyDown: vi.fn(),
        canSave: true,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      const saveButton = screen.getByRole('button', { name: /zapisz/i });
      await user.click(saveButton);

      expect(handleSave).toHaveBeenCalledTimes(1);
    });

    it('calls handleCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();

      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: true,
        editedName: mockTitle,
        setEditedName: vi.fn(),
        isSaving: false,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave: vi.fn(),
        handleCancel,
        handleKeyDown: vi.fn(),
        canSave: true,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      const cancelButton = screen.getByRole('button', { name: /anuluj/i });
      await user.click(cancelButton);

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('disables save button when canSave is false', () => {
      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: true,
        editedName: '',
        setEditedName: vi.fn(),
        isSaving: false,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        handleKeyDown: vi.fn(),
        canSave: false,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      const saveButton = screen.getByRole('button', { name: /zapisz/i });
      expect(saveButton).toBeDisabled();
    });

    it('shows saving state when isSaving is true', () => {
      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: true,
        editedName: mockTitle,
        setEditedName: vi.fn(),
        isSaving: true,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        handleKeyDown: vi.fn(),
        canSave: false,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      expect(screen.getByText('Zapisywanie...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /anuluj/i })).toBeDisabled();
    });

    it('calls handleKeyDown on input keydown event', async () => {
      const user = userEvent.setup();
      const handleKeyDown = vi.fn();

      vi.spyOn(useEditableTitleModule, 'useEditableTitle').mockReturnValue({
        isEditing: true,
        editedName: mockTitle,
        setEditedName: vi.fn(),
        isSaving: false,
        inputRef: { current: null },
        startEditing: vi.fn(),
        handleSave: vi.fn(),
        handleCancel: vi.fn(),
        handleKeyDown,
        canSave: true,
      });

      render(<EditableTitle title={mockTitle} onSave={mockOnSave} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '{Enter}');

      expect(handleKeyDown).toHaveBeenCalled();
    });
  });
});
