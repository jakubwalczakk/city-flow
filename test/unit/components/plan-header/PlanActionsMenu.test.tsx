import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanActionsMenu } from '@/components/plan-header/PlanActionsMenu';
import * as usePlanActionsMenuModule from '@/hooks/usePlanActionsMenu';

vi.mock('@/hooks/usePlanActionsMenu');

describe('PlanActionsMenu', () => {
  const mockPlanName = 'Summer Trip to Paris';
  const mockOnArchive = vi.fn();
  const mockOnDelete = vi.fn();

  const defaultHookReturn = {
    dialogs: { delete: false, archive: false },
    loading: { delete: false, archive: false },
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    handleDelete: vi.fn(),
    handleArchive: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(usePlanActionsMenuModule, 'usePlanActionsMenu').mockReturnValue(defaultHookReturn);
  });

  describe('Rendering', () => {
    it('renders menu trigger button', () => {
      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });

    it('displays archive option for non-archived plans', async () => {
      const user = userEvent.setup();
      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      const trigger = screen.getByRole('button', { name: /open menu/i });
      await user.click(trigger);

      expect(screen.getByText('Przenieś do historii')).toBeInTheDocument();
    });

    it('hides archive option for archived plans', async () => {
      const user = userEvent.setup();
      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='archived'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      const trigger = screen.getByRole('button', { name: /open menu/i });
      await user.click(trigger);

      expect(screen.queryByText('Przenieś do historii')).not.toBeInTheDocument();
    });

    it('always displays delete option', async () => {
      const user = userEvent.setup();
      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      const trigger = screen.getByRole('button', { name: /open menu/i });
      await user.click(trigger);

      expect(screen.getByText('Usuń plan')).toBeInTheDocument();
    });
  });

  describe('Menu interactions', () => {
    it('calls openDialog with archive when archive option is clicked', async () => {
      const user = userEvent.setup();
      const openDialog = vi.fn();

      vi.spyOn(usePlanActionsMenuModule, 'usePlanActionsMenu').mockReturnValue({
        ...defaultHookReturn,
        openDialog,
      });

      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      const trigger = screen.getByRole('button', { name: /open menu/i });
      await user.click(trigger);

      const archiveOption = screen.getByText('Przenieś do historii');
      await user.click(archiveOption);

      expect(openDialog).toHaveBeenCalledWith('archive');
    });

    it('calls openDialog with delete when delete option is clicked', async () => {
      const user = userEvent.setup();
      const openDialog = vi.fn();

      vi.spyOn(usePlanActionsMenuModule, 'usePlanActionsMenu').mockReturnValue({
        ...defaultHookReturn,
        openDialog,
      });

      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      const trigger = screen.getByRole('button', { name: /open menu/i });
      await user.click(trigger);

      const deleteOption = screen.getByText('Usuń plan');
      await user.click(deleteOption);

      expect(openDialog).toHaveBeenCalledWith('delete');
    });
  });

  describe('Archive dialog', () => {
    it('renders archive dialog when dialogs.archive is true', () => {
      vi.spyOn(usePlanActionsMenuModule, 'usePlanActionsMenu').mockReturnValue({
        ...defaultHookReturn,
        dialogs: { delete: false, archive: true },
      });

      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Przenieść do historii?')).toBeInTheDocument();
    });

    it('calls handleArchive when archive confirm button is clicked', async () => {
      const user = userEvent.setup();
      const handleArchive = vi.fn();

      vi.spyOn(usePlanActionsMenuModule, 'usePlanActionsMenu').mockReturnValue({
        ...defaultHookReturn,
        dialogs: { delete: false, archive: true },
        handleArchive,
      });

      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /przenieś/i });
      await user.click(confirmButton);

      expect(handleArchive).toHaveBeenCalledTimes(1);
    });

    it('shows loading state when archiving', () => {
      vi.spyOn(usePlanActionsMenuModule, 'usePlanActionsMenu').mockReturnValue({
        ...defaultHookReturn,
        dialogs: { delete: false, archive: true },
        loading: { delete: false, archive: true },
      });

      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Przenoszenie...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /anuluj/i })).toBeDisabled();
    });
  });

  describe('Delete dialog', () => {
    it('renders delete dialog when dialogs.delete is true', () => {
      vi.spyOn(usePlanActionsMenuModule, 'usePlanActionsMenu').mockReturnValue({
        ...defaultHookReturn,
        dialogs: { delete: true, archive: false },
      });

      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('Czy na pewno?')).toBeInTheDocument();
      expect(screen.getByText(new RegExp(mockPlanName))).toBeInTheDocument();
    });

    it('calls handleDelete when delete confirm button is clicked', async () => {
      const user = userEvent.setup();
      const handleDelete = vi.fn();

      vi.spyOn(usePlanActionsMenuModule, 'usePlanActionsMenu').mockReturnValue({
        ...defaultHookReturn,
        dialogs: { delete: true, archive: false },
        handleDelete,
      });

      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /usuń/i });
      await user.click(confirmButton);

      expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it('shows loading state when deleting', () => {
      vi.spyOn(usePlanActionsMenuModule, 'usePlanActionsMenu').mockReturnValue({
        ...defaultHookReturn,
        dialogs: { delete: true, archive: false },
        loading: { delete: true, archive: false },
      });

      render(
        <PlanActionsMenu
          planName={mockPlanName}
          planStatus='generated'
          onArchive={mockOnArchive}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Usuwanie...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /anuluj/i })).toBeDisabled();
    });
  });
});
