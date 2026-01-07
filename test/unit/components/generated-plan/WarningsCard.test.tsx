import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WarningsCard } from '@/components/generated-plan/WarningsCard';

describe('WarningsCard', () => {
  const mockWarnings = [
    'Sprawdź godziny otwarcia muzeów przed wizytą',
    'Niektóre atrakcje mogą wymagać wcześniejszej rezerwacji',
    'Przygotuj się na długie kolejki w okresie wakacyjnym',
  ];

  describe('rendering', () => {
    it('should render card title', () => {
      render(<WarningsCard warnings={mockWarnings} />);

      expect(screen.getByText('Ważne przypomnienia')).toBeInTheDocument();
    });

    it('should render card description', () => {
      render(<WarningsCard warnings={mockWarnings} />);

      expect(screen.getByText('Przejrzyj te notatki przed podróżą')).toBeInTheDocument();
    });

    it('should render AlertTriangle icon', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      const alertIcon = container.querySelector('svg.lucide-triangle-alert');
      expect(alertIcon).toBeInTheDocument();
    });

    it('should render all warnings', () => {
      render(<WarningsCard warnings={mockWarnings} />);

      mockWarnings.forEach((warning) => {
        expect(screen.getByText(warning)).toBeInTheDocument();
      });
    });

    it('should render warnings as list items', () => {
      render(<WarningsCard warnings={mockWarnings} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(mockWarnings.length);
    });

    it('should render bullet points for each warning', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      const bullets = container.querySelectorAll('li span:first-child');
      expect(bullets).toHaveLength(mockWarnings.length);
      bullets.forEach((bullet) => {
        expect(bullet.textContent).toBe('•');
      });
    });

    it('should have data-testid attribute', () => {
      render(<WarningsCard warnings={mockWarnings} />);

      expect(screen.getByTestId('generation-warning')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should not render when warnings is empty array', () => {
      const { container } = render(<WarningsCard warnings={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when warnings is undefined', () => {
      const { container } = render(<WarningsCard warnings={undefined as unknown as string[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when warnings is null', () => {
      const { container } = render(<WarningsCard warnings={null as unknown as string[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render when there is one warning', () => {
      render(<WarningsCard warnings={['Single warning']} />);

      expect(screen.getByText('Single warning')).toBeInTheDocument();
    });

    it('should render when there are many warnings', () => {
      const manyWarnings = Array.from({ length: 10 }, (_, i) => `Warning ${i + 1}`);
      render(<WarningsCard warnings={manyWarnings} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(10);
    });
  });

  describe('styling', () => {
    it('should have amber-themed styling', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      const card = container.firstChild;
      expect(card).toHaveClass('border-amber-200', 'bg-amber-50');
    });

    it('should have dark mode styling', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      const card = container.firstChild;
      expect(card).toHaveClass('dark:border-amber-900', 'dark:bg-amber-950/20');
    });

    it('should have amber colored title', () => {
      render(<WarningsCard warnings={mockWarnings} />);

      const title = screen.getByText('Ważne przypomnienia');
      expect(title).toHaveClass('text-amber-900', 'dark:text-amber-100');
    });

    it('should have amber colored icon', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      const icon = container.querySelector('svg.lucide-triangle-alert');
      expect(icon).toHaveClass('text-amber-600', 'dark:text-amber-500');
    });

    it('should have amber colored description', () => {
      render(<WarningsCard warnings={mockWarnings} />);

      const description = screen.getByText('Przejrzyj te notatki przed podróżą');
      expect(description).toHaveClass('text-amber-800', 'dark:text-amber-200');
    });

    it('should have amber colored bullets', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      const bullets = container.querySelectorAll('li span:first-child');
      bullets.forEach((bullet) => {
        expect(bullet).toHaveClass('text-amber-600', 'dark:text-amber-500');
      });
    });

    it('should have amber colored list items', () => {
      render(<WarningsCard warnings={mockWarnings} />);

      const listItems = screen.getAllByRole('listitem');
      listItems.forEach((item) => {
        expect(item).toHaveClass('text-amber-900', 'dark:text-amber-100');
      });
    });
  });

  describe('layout', () => {
    it('should have proper icon and content layout', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      const headerLayout = container.querySelector('.flex.items-start.gap-3');
      expect(headerLayout).toBeInTheDocument();
    });

    it('should have spaced list items', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      const list = container.querySelector('ul');
      expect(list).toHaveClass('space-y-2');
    });

    it('should have flex-shrink-0 class on icon', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      const icon = container.querySelector('svg.lucide-triangle-alert');
      expect(icon).toHaveClass('flex-shrink-0');
    });
  });

  describe('content variations', () => {
    it('should handle warning with special characters', () => {
      const specialWarnings = ['Warning with "quotes" and \'apostrophes\''];
      render(<WarningsCard warnings={specialWarnings} />);

      expect(screen.getByText(specialWarnings[0])).toBeInTheDocument();
    });

    it('should handle long warning text', () => {
      const longWarning = ['Lorem ipsum dolor sit amet, '.repeat(20).trim()];
      render(<WarningsCard warnings={longWarning} />);

      // Check that list item exists with the long text
      const listItems = screen.getAllByRole('listitem');
      expect(listItems[0].textContent).toContain('Lorem ipsum dolor sit amet');
    });

    it('should handle empty string warning', () => {
      render(<WarningsCard warnings={['']} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(1);
    });
  });

  describe('accessibility', () => {
    it('should use semantic list structure', () => {
      render(<WarningsCard warnings={mockWarnings} />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<WarningsCard warnings={mockWarnings} />);

      const title = screen.getByText('Ważne przypomnienia');
      expect(title).toBeInTheDocument();
    });
  });

  describe('comparison with ModificationsCard', () => {
    it('should use AlertTriangle icon instead of Info', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      expect(container.querySelector('svg.lucide-triangle-alert')).toBeInTheDocument();
      expect(container.querySelector('svg.lucide-info')).not.toBeInTheDocument();
    });

    it('should use amber theme instead of blue', () => {
      const { container } = render(<WarningsCard warnings={mockWarnings} />);

      const card = container.firstChild;
      expect(card).toHaveClass('border-amber-200');
      expect(card).not.toHaveClass('border-blue-200');
    });
  });
});
