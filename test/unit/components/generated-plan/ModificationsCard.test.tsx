import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModificationsCard } from '@/components/generated-plan/ModificationsCard';

describe('ModificationsCard', () => {
  const mockModifications = [
    'Zmieniono kolejność atrakcji dla lepszego przepływu',
    'Dodano przerwę na lunch między muzeami',
    'Uwzględniono czas na transport między lokalizacjami',
  ];

  describe('rendering', () => {
    it('should render card title', () => {
      render(<ModificationsCard modifications={mockModifications} />);

      expect(screen.getByText('Dostosowania planu')).toBeInTheDocument();
    });

    it('should render card description', () => {
      render(<ModificationsCard modifications={mockModifications} />);

      expect(screen.getByText('Zmiany wprowadzone w celu optymalizacji planu')).toBeInTheDocument();
    });

    it('should render Info icon', () => {
      const { container } = render(<ModificationsCard modifications={mockModifications} />);

      const infoIcon = container.querySelector('svg.lucide-info');
      expect(infoIcon).toBeInTheDocument();
    });

    it('should render all modifications', () => {
      render(<ModificationsCard modifications={mockModifications} />);

      mockModifications.forEach((modification) => {
        expect(screen.getByText(modification)).toBeInTheDocument();
      });
    });

    it('should render modifications as list items', () => {
      render(<ModificationsCard modifications={mockModifications} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(mockModifications.length);
    });

    it('should render bullet points for each modification', () => {
      const { container } = render(<ModificationsCard modifications={mockModifications} />);

      const bullets = container.querySelectorAll('li span:first-child');
      expect(bullets).toHaveLength(mockModifications.length);
      bullets.forEach((bullet) => {
        expect(bullet.textContent).toBe('•');
      });
    });

    it('should have data-testid attribute', () => {
      render(<ModificationsCard modifications={mockModifications} />);

      expect(screen.getByTestId('generation-warning')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should not render when modifications is empty array', () => {
      const { container } = render(<ModificationsCard modifications={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when modifications is undefined', () => {
      const { container } = render(<ModificationsCard modifications={undefined as unknown as string[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when modifications is null', () => {
      const { container } = render(<ModificationsCard modifications={null as unknown as string[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render when there is one modification', () => {
      render(<ModificationsCard modifications={['Single modification']} />);

      expect(screen.getByText('Single modification')).toBeInTheDocument();
    });

    it('should render when there are many modifications', () => {
      const manyModifications = Array.from({ length: 10 }, (_, i) => `Modification ${i + 1}`);
      render(<ModificationsCard modifications={manyModifications} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(10);
    });
  });

  describe('styling', () => {
    it('should have blue-themed styling', () => {
      const { container } = render(<ModificationsCard modifications={mockModifications} />);

      const card = container.firstChild;
      expect(card).toHaveClass('border-blue-200', 'bg-blue-50');
    });

    it('should have dark mode styling', () => {
      const { container } = render(<ModificationsCard modifications={mockModifications} />);

      const card = container.firstChild;
      expect(card).toHaveClass('dark:border-blue-900', 'dark:bg-blue-950/20');
    });

    it('should have blue colored title', () => {
      render(<ModificationsCard modifications={mockModifications} />);

      const title = screen.getByText('Dostosowania planu');
      expect(title).toHaveClass('text-blue-900', 'dark:text-blue-100');
    });

    it('should have blue colored icon', () => {
      const { container } = render(<ModificationsCard modifications={mockModifications} />);

      const icon = container.querySelector('svg.lucide-info');
      expect(icon).toHaveClass('text-blue-600', 'dark:text-blue-500');
    });

    it('should have blue colored description', () => {
      render(<ModificationsCard modifications={mockModifications} />);

      const description = screen.getByText('Zmiany wprowadzone w celu optymalizacji planu');
      expect(description).toHaveClass('text-blue-800', 'dark:text-blue-200');
    });

    it('should have blue colored bullets', () => {
      const { container } = render(<ModificationsCard modifications={mockModifications} />);

      const bullets = container.querySelectorAll('li span:first-child');
      bullets.forEach((bullet) => {
        expect(bullet).toHaveClass('text-blue-600', 'dark:text-blue-500');
      });
    });

    it('should have blue colored list items', () => {
      render(<ModificationsCard modifications={mockModifications} />);

      const listItems = screen.getAllByRole('listitem');
      listItems.forEach((item) => {
        expect(item).toHaveClass('text-blue-900', 'dark:text-blue-100');
      });
    });
  });

  describe('layout', () => {
    it('should have proper icon and content layout', () => {
      const { container } = render(<ModificationsCard modifications={mockModifications} />);

      const headerLayout = container.querySelector('.flex.items-start.gap-3');
      expect(headerLayout).toBeInTheDocument();
    });

    it('should have spaced list items', () => {
      const { container } = render(<ModificationsCard modifications={mockModifications} />);

      const list = container.querySelector('ul');
      expect(list).toHaveClass('space-y-2');
    });

    it('should have flex-shrink-0 class on icon', () => {
      const { container } = render(<ModificationsCard modifications={mockModifications} />);

      const icon = container.querySelector('svg.lucide-info');
      expect(icon).toHaveClass('flex-shrink-0');
    });
  });

  describe('content variations', () => {
    it('should handle modification with special characters', () => {
      const specialModifications = ['Modification with "quotes" and \'apostrophes\''];
      render(<ModificationsCard modifications={specialModifications} />);

      expect(screen.getByText(specialModifications[0])).toBeInTheDocument();
    });

    it('should handle long modification text', () => {
      const longModification = ['Lorem ipsum dolor sit amet, '.repeat(20).trim()];
      render(<ModificationsCard modifications={longModification} />);

      // Check that list item exists with the long text
      const listItems = screen.getAllByRole('listitem');
      expect(listItems[0].textContent).toContain('Lorem ipsum dolor sit amet');
    });

    it('should handle empty string modification', () => {
      render(<ModificationsCard modifications={['']} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(1);
    });
  });

  describe('accessibility', () => {
    it('should use semantic list structure', () => {
      render(<ModificationsCard modifications={mockModifications} />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<ModificationsCard modifications={mockModifications} />);

      const title = screen.getByText('Dostosowania planu');
      expect(title).toBeInTheDocument();
    });
  });
});
