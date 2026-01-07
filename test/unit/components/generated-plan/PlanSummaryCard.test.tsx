import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanSummaryCard } from '@/components/generated-plan/PlanSummaryCard';

describe('PlanSummaryCard', () => {
  const mockSummary =
    'To jest szczegółowe podsumowanie planu podróży do Paryża, zawierające najważniejsze atrakcje i wskazówki.';

  describe('rendering', () => {
    it('should render card title', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      expect(screen.getByTestId('plan-summary-title')).toHaveTextContent('Podsumowanie planu');
    });

    it('should render AI badge', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      expect(screen.getByTestId('plan-summary-ai-label')).toHaveTextContent('Wygenerowano przez AI');
    });

    it('should render Sparkles icon in AI badge', () => {
      const { container } = render(<PlanSummaryCard summary={mockSummary} />);

      const sparklesIcon = container.querySelector('svg.lucide-sparkles');
      expect(sparklesIcon).toBeInTheDocument();
    });

    it('should render summary text', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      expect(screen.getByTestId('plan-summary-text')).toHaveTextContent(mockSummary);
    });

    it('should render disclaimer text', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      expect(screen.getByTestId('plan-summary-disclaimer')).toHaveTextContent(
        /Ten plan został wygenerowany przez sztuczną inteligencję/
      );
    });

    it('should render disclaimer with proper styling', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      const disclaimer = screen.getByTestId('plan-summary-disclaimer');
      expect(disclaimer).toHaveClass('text-xs', 'text-muted-foreground', 'italic', 'border-t', 'pt-2');
    });
  });

  describe('content variations', () => {
    it('should render short summary', () => {
      const shortSummary = 'Krótkie podsumowanie.';
      render(<PlanSummaryCard summary={shortSummary} />);

      expect(screen.getByTestId('plan-summary-text')).toHaveTextContent(shortSummary);
    });

    it('should render long summary', () => {
      const longSummary = 'Lorem ipsum dolor sit amet, '.repeat(50).trim();
      render(<PlanSummaryCard summary={longSummary} />);

      // Check that the summary container exists and contains part of the text
      const summaryElement = screen.getByTestId('plan-summary-text');
      expect(summaryElement).toBeInTheDocument();
      expect(summaryElement.textContent).toContain('Lorem ipsum dolor sit amet');
    });

    it('should render empty summary', () => {
      render(<PlanSummaryCard summary='' />);

      // Check that the component renders even with empty summary
      expect(screen.getByTestId('plan-summary-title')).toHaveTextContent('Podsumowanie planu');
      expect(screen.getByTestId('plan-summary-ai-label')).toHaveTextContent('Wygenerowano przez AI');
    });

    it('should render summary with special characters', () => {
      const specialSummary = 'Podsumowanie z "cudzysłowami", apostrofem\'s i & symbolami!';
      render(<PlanSummaryCard summary={specialSummary} />);

      expect(screen.getByTestId('plan-summary-text')).toHaveTextContent(specialSummary);
    });

    it('should render summary with line breaks', () => {
      const multilineSummary = 'Pierwsza linia\nDruga linia\nTrzecia linia';
      render(<PlanSummaryCard summary={multilineSummary} />);

      // Check that the summary contains the first line
      expect(screen.getByTestId('plan-summary-text')).toHaveTextContent(/Pierwsza linia/);
    });
  });

  describe('layout', () => {
    it('should have AI badge in header', () => {
      const { container } = render(<PlanSummaryCard summary={mockSummary} />);

      const header = container.querySelector('.flex.items-center.justify-between');
      expect(header).toBeInTheDocument();
      expect(header).toContainElement(screen.getByTestId('plan-summary-ai-label'));
    });

    it('should separate summary from disclaimer with border', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      const disclaimer = screen.getByTestId('plan-summary-disclaimer');
      expect(disclaimer).toHaveClass('border-t');
    });

    it('should have proper spacing between elements', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      const disclaimer = screen.getByTestId('plan-summary-disclaimer');
      expect(disclaimer).toHaveClass('mt-4');
    });
  });

  describe('styling', () => {
    it('should have primary colored AI badge', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      const badge = screen.getByTestId('plan-summary-ai-badge');
      expect(badge).toHaveClass('bg-primary/10', 'text-primary');
    });

    it('should have muted foreground color for summary', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      const summary = screen.getByTestId('plan-summary-text');
      expect(summary).toHaveClass('text-muted-foreground');
    });

    it('should have proper badge styling', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      const badge = screen.getByTestId('plan-summary-ai-badge');
      expect(badge).toHaveClass('rounded-full', 'px-3', 'py-1', 'text-xs', 'font-medium');
    });
  });

  describe('accessibility', () => {
    it('should render as card component', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      expect(screen.getByTestId('plan-summary-card')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<PlanSummaryCard summary={mockSummary} />);

      const title = screen.getByTestId('plan-summary-title');
      expect(title).toBeInTheDocument();
    });
  });
});
