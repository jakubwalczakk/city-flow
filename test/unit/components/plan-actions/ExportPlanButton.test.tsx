import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportPlanButton from '@/components/plan-actions/ExportPlanButton';
import * as useExportPlanModule from '@/hooks/useExportPlan';

// Mock hooks
vi.mock('@/hooks/useExportPlan');

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Download: ({ className }: { className?: string }) => (
    <span className={className} data-testid='download-icon'>
      Download
    </span>
  ),
  Loader2: ({ className }: { className?: string }) => (
    <span className={className} data-testid='loader-icon'>
      Loading
    </span>
  ),
}));

// Types for mock components
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
};

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, 'data-testid': dataTestId }: ButtonProps) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid={dataTestId}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-tooltip-trigger>{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid='tooltip-content'>{children}</div>,
}));

describe('ExportPlanButton', () => {
  const defaultProps = {
    planId: 'plan-123',
    planName: 'Paris Trip',
    className: 'custom-class',
  };

  const mockHandleExport = vi.fn();

  const mockUseExportPlan = {
    handleExport: mockHandleExport,
    isLoading: false,
    isDisabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useExportPlanModule.useExportPlan).mockReturnValue(mockUseExportPlan);
  });

  describe('rendering', () => {
    it('should render export button with default text', () => {
      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Eksportuj do PDF');
    });

    it('should render download icon when not loading', () => {
      render(<ExportPlanButton {...defaultProps} />);

      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
    });

    it('should render tooltip content', () => {
      render(<ExportPlanButton {...defaultProps} />);

      expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Pobierz plan jako plik PDF');
    });

    it('should apply custom className', () => {
      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      expect(button).toHaveClass('custom-class');
    });

    it('should work without custom className', () => {
      const { planId, planName } = defaultProps;
      render(<ExportPlanButton planId={planId} planName={planName} />);

      expect(screen.getByTestId('export-pdf-button')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading state when isLoading is true', () => {
      vi.mocked(useExportPlanModule.useExportPlan).mockReturnValue({
        ...mockUseExportPlan,
        isLoading: true,
      });

      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      expect(button).toHaveTextContent('Eksportowanie...');
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('download-icon')).not.toBeInTheDocument();
    });

    it('should have animate-spin class on loader icon', () => {
      vi.mocked(useExportPlanModule.useExportPlan).mockReturnValue({
        ...mockUseExportPlan,
        isLoading: true,
      });

      render(<ExportPlanButton {...defaultProps} />);

      const loader = screen.getByTestId('loader-icon');
      expect(loader).toHaveClass('animate-spin');
    });
  });

  describe('disabled state', () => {
    it('should disable button when isDisabled is true', () => {
      vi.mocked(useExportPlanModule.useExportPlan).mockReturnValue({
        ...mockUseExportPlan,
        isDisabled: true,
      });

      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      expect(button).toBeDisabled();
    });

    it('should not disable button by default', () => {
      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      expect(button).not.toBeDisabled();
    });

    it('should disable button when both loading and disabled', () => {
      vi.mocked(useExportPlanModule.useExportPlan).mockReturnValue({
        ...mockUseExportPlan,
        isLoading: true,
        isDisabled: true,
      });

      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      expect(button).toBeDisabled();
    });
  });

  describe('export functionality', () => {
    it('should call handleExport when button is clicked', async () => {
      const user = userEvent.setup();

      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      await user.click(button);

      expect(mockHandleExport).toHaveBeenCalledTimes(1);
    });

    it('should not call handleExport when button is disabled', async () => {
      const user = userEvent.setup();

      vi.mocked(useExportPlanModule.useExportPlan).mockReturnValue({
        ...mockUseExportPlan,
        isDisabled: true,
      });

      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      await user.click(button);

      expect(mockHandleExport).not.toHaveBeenCalled();
    });

    it('should not call handleExport when loading', async () => {
      const user = userEvent.setup();

      vi.mocked(useExportPlanModule.useExportPlan).mockReturnValue({
        ...mockUseExportPlan,
        isLoading: true,
        isDisabled: true,
      });

      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      await user.click(button);

      expect(mockHandleExport).not.toHaveBeenCalled();
    });

    it('should allow multiple clicks when enabled', async () => {
      const user = userEvent.setup();

      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockHandleExport).toHaveBeenCalledTimes(3);
    });
  });

  describe('hook integration', () => {
    it('should pass planId to useExportPlan hook', () => {
      render(<ExportPlanButton {...defaultProps} />);

      expect(useExportPlanModule.useExportPlan).toHaveBeenCalledWith({
        planId: 'plan-123',
        planName: 'Paris Trip',
      });
    });

    it('should pass planName to useExportPlan hook', () => {
      render(<ExportPlanButton {...defaultProps} />);

      expect(useExportPlanModule.useExportPlan).toHaveBeenCalledWith({
        planId: 'plan-123',
        planName: 'Paris Trip',
      });
    });

    it('should handle different plan IDs', () => {
      const props = { ...defaultProps, planId: 'different-plan', planName: 'Berlin Adventure' };
      render(<ExportPlanButton {...props} />);

      expect(useExportPlanModule.useExportPlan).toHaveBeenCalledWith({
        planId: 'different-plan',
        planName: 'Berlin Adventure',
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper button role', () => {
      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should provide tooltip for additional context', () => {
      render(<ExportPlanButton {...defaultProps} />);

      expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Pobierz plan jako plik PDF');
    });

    it('should have descriptive text content', () => {
      render(<ExportPlanButton {...defaultProps} />);

      const button = screen.getByTestId('export-pdf-button');
      expect(button.textContent).toContain('Eksportuj do PDF');
    });
  });

  describe('edge cases', () => {
    it('should handle empty planName', () => {
      const props = { ...defaultProps, planName: '' };
      render(<ExportPlanButton {...props} />);

      expect(useExportPlanModule.useExportPlan).toHaveBeenCalledWith({
        planId: 'plan-123',
        planName: '',
      });
    });

    it('should handle special characters in planName', () => {
      const props = { ...defaultProps, planName: 'Trip #1 @Paris (2024)' };
      render(<ExportPlanButton {...props} />);

      expect(useExportPlanModule.useExportPlan).toHaveBeenCalledWith({
        planId: 'plan-123',
        planName: 'Trip #1 @Paris (2024)',
      });
    });

    it('should handle very long plan names', () => {
      const longName = 'A'.repeat(200);
      const props = { ...defaultProps, planName: longName };
      render(<ExportPlanButton {...props} />);

      expect(useExportPlanModule.useExportPlan).toHaveBeenCalledWith({
        planId: 'plan-123',
        planName: longName,
      });
    });
  });
});
