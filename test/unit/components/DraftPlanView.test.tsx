import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DraftPlanView from '@/components/DraftPlanView';
import * as useDraftPlanModule from '@/hooks/useDraftPlan';
import type { PlanDetailsDto } from '@/types';

// Mock hooks
vi.mock('@/hooks/useDraftPlan');

/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock child components
vi.mock('@/components/draft-plan/NotesSection', () => ({
  NotesSection: ({ notes, onChange }: { notes: string; onChange: (notes: string) => void }) => (
    <div data-testid='notes-section'>
      <textarea data-testid='notes-input' value={notes} onChange={(e) => onChange(e.target.value)} />
    </div>
  ),
}));

vi.mock('@/components/draft-plan/DatesSection', () => ({
  DatesSection: ({ startDate, endDate }: { startDate: string; endDate: string }) => (
    <div data-testid='dates-section'>
      <span>{startDate}</span> - <span>{endDate}</span>
    </div>
  ),
}));

vi.mock('@/components/draft-plan/FixedPointsSection', () => ({
  FixedPointsSection: ({ fixedPoints, isLoading, onEdit }: any) => (
    <div data-testid='fixed-points-section'>
      {isLoading ? 'Loading...' : `${fixedPoints.length} fixed points`}
      <button onClick={onEdit}>Edit</button>
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('DraftPlanView', () => {
  const mockPlan: PlanDetailsDto = {
    id: 'plan-1',
    user_id: 'user-1',
    name: 'Paris Trip',
    destination: 'Paris',
    status: 'draft',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    start_date: '2024-02-01',
    end_date: '2024-02-07',
    notes: 'Test notes',
    generated_content: null,
  };

  const mockOnGenerate = vi.fn();
  const mockOnEdit = vi.fn();

  const mockUseDraftPlan = {
    notes: 'Test notes',
    setNotes: vi.fn(),
    hasChanges: false,
    fixedPoints: [],
    isLoadingFixedPoints: false,
    fixedPointsError: null,
    handleSave: vi.fn(),
    handleGenerate: vi.fn(),
    isSaving: false,
    isGenerating: false,
    saveSuccess: false,
    saveError: null,
    generateError: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue(mockUseDraftPlan);
  });

  describe('rendering', () => {
    it('should render draft plan card', () => {
      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByText('Plan w wersji roboczej')).toBeInTheDocument();
    });

    it('should display destination as read-only', () => {
      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByText('Miejsce docelowe')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('Miejsca docelowego nie można zmienić po utworzeniu planu.')).toBeInTheDocument();
    });

    it('should render notes section', () => {
      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByTestId('notes-section')).toBeInTheDocument();
    });

    it('should render dates section', () => {
      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByTestId('dates-section')).toBeInTheDocument();
    });

    it('should render fixed points section', () => {
      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByTestId('fixed-points-section')).toBeInTheDocument();
    });

    it('should render save and generate buttons', () => {
      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByText('Zapisz zmiany')).toBeInTheDocument();
      expect(screen.getByTestId('generate-plan-button')).toBeInTheDocument();
    });
  });

  describe('save functionality', () => {
    it('should disable save button when no changes', () => {
      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      const saveButton = screen.getByText('Zapisz zmiany');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when there are changes', () => {
      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        hasChanges: true,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      const saveButton = screen.getByText('Zapisz zmiany');
      expect(saveButton).not.toBeDisabled();
    });

    it('should call handleSave when save button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleSave = vi.fn();

      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        hasChanges: true,
        handleSave: mockHandleSave,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      const saveButton = screen.getByText('Zapisz zmiany');
      await user.click(saveButton);

      expect(mockHandleSave).toHaveBeenCalled();
    });

    it('should show saving text when isSaving is true', () => {
      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        isSaving: true,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByText('Zapisywanie...')).toBeInTheDocument();
    });

    it('should disable save button when isSaving is true', () => {
      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        isSaving: true,
        hasChanges: true,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      const saveButton = screen.getByText('Zapisywanie...');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('generate functionality', () => {
    it('should call handleGenerate and onGenerate when generate button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleGenerate = vi.fn().mockResolvedValue(undefined);

      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        handleGenerate: mockHandleGenerate,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      const generateButton = screen.getByTestId('generate-plan-button');
      await user.click(generateButton);

      expect(mockHandleGenerate).toHaveBeenCalled();
      expect(mockOnGenerate).toHaveBeenCalled();
    });

    it('should show generating text when isGenerating is true', () => {
      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        isGenerating: true,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByText('Generowanie...')).toBeInTheDocument();
    });

    it('should disable generate button when isGenerating is true', () => {
      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        isGenerating: true,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      const generateButton = screen.getByTestId('generate-plan-button');
      expect(generateButton).toBeDisabled();
    });

    it('should disable generate button when isSaving is true', () => {
      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        isSaving: true,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      const generateButton = screen.getByTestId('generate-plan-button');
      expect(generateButton).toBeDisabled();
    });
  });

  describe('success and error messages', () => {
    it('should show success message when saveSuccess is true', () => {
      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        saveSuccess: true,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByText('Zmiany zostały zapisane!')).toBeInTheDocument();
    });

    it('should show error message when saveError is true', () => {
      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        saveError: new Error('Failed to save'),
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByText('Nie udało się zapisać zmian. Spróbuj ponownie.')).toBeInTheDocument();
    });

    it('should not show messages when both saveSuccess and saveError are false', () => {
      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.queryByText('Zmiany zostały zapisane!')).not.toBeInTheDocument();
      expect(screen.queryByText('Nie udało się zapisać zmian. Spróbuj ponownie.')).not.toBeInTheDocument();
    });
  });

  describe('fixed points section', () => {
    it('should show loading state for fixed points', () => {
      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        isLoadingFixedPoints: true,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display fixed points count', () => {
      vi.mocked(useDraftPlanModule.useDraftPlan).mockReturnValue({
        ...mockUseDraftPlan,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fixedPoints: [{ id: '1' }, { id: '2' }] as any,
      });

      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(screen.getByText('2 fixed points')).toBeInTheDocument();
    });
  });

  describe('props passing', () => {
    it('should pass plan to useDraftPlan hook', () => {
      render(<DraftPlanView plan={mockPlan} onGenerate={mockOnGenerate} onEdit={mockOnEdit} />);

      expect(useDraftPlanModule.useDraftPlan).toHaveBeenCalledWith({ plan: mockPlan });
    });
  });
});
