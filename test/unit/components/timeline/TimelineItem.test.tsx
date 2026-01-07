import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimelineItem } from '@/components/timeline/TimelineItem';
import * as timelineCategories from '@/lib/constants/timelineCategories';
import type { TimelineItem as TimelineItemType } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
// Mock category helpers
vi.mock('@/lib/constants/timelineCategories', () => ({
  getCategoryIcon: vi.fn(() => {
    const MockIcon = ({ className }: { className: string }) => <span className={className}>CategoryIcon</span>;
    MockIcon.displayName = 'MockCategoryIcon';
    return MockIcon;
  }),
  getCategoryLabel: vi.fn((category: string) => `Label-${category}`),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  MoreVertical: ({ className }: { className?: string }) => <span className={className}>MoreVertical</span>,
  Pencil: ({ className }: { className?: string }) => <span className={className}>Pencil</span>,
  Trash2: ({ className }: { className?: string }) => <span className={className}>Trash2</span>,
  MapPin: ({ className }: { className?: string }) => <span className={className}>MapPin</span>,
  Clock: ({ className }: { className?: string }) => <span className={className}>Clock</span>,
}));

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <div data-testid='badge' {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid='dropdown-menu'>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick, ...props }: any) => (
    <div onClick={onClick} {...props}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable jsx-a11y/click-events-have-key-events */
/* eslint-enable jsx-a11y/no-static-element-interactions */

describe('TimelineItem', () => {
  const baseItem: TimelineItemType = {
    id: '1',
    type: 'activity',
    title: 'Visit Eiffel Tower',
    time: '09:00',
    category: 'culture',
    description: 'Visit the famous landmark',
    location: 'Champ de Mars, Paris',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering - basic fields', () => {
    it('should render activity item container', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.getByTestId('activity-item')).toBeInTheDocument();
    });

    it('should render activity title', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.getByTestId('activity-title')).toHaveTextContent('Visit Eiffel Tower');
    });

    it('should render activity time', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.getByTestId('activity-time')).toBeInTheDocument();
      expect(screen.getByTestId('activity-time')).toHaveTextContent('09:00');
    });

    it('should render category badge', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.getByTestId('badge')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toHaveTextContent('Label-culture');
    });

    it('should render category icon', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.getByTestId('badge')).toHaveTextContent('CategoryIcon');
      expect(timelineCategories.getCategoryIcon).toHaveBeenCalledWith('culture');
    });

    it('should call getCategoryLabel with correct category', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(timelineCategories.getCategoryLabel).toHaveBeenCalledWith('culture');
    });
  });

  describe('rendering - optional fields', () => {
    it('should render location when provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.getByTestId('activity-location')).toHaveTextContent('Champ de Mars, Paris');
      expect(screen.getByTestId('activity-location')).toHaveTextContent('MapPin');
    });

    it('should not render location when not provided', () => {
      const itemWithoutLocation = { ...baseItem, location: undefined };
      render(<TimelineItem item={itemWithoutLocation} currency='EUR' />);

      expect(screen.queryByTestId('activity-location')).not.toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.getByTestId('activity-description')).toHaveTextContent('Visit the famous landmark');
    });

    it('should not render description when not provided', () => {
      const itemWithoutDescription = { ...baseItem, description: undefined };
      render(<TimelineItem item={itemWithoutDescription} currency='EUR' />);

      expect(screen.queryByTestId('activity-description')).not.toBeInTheDocument();
    });

    it('should render notes when provided', () => {
      const itemWithNotes = { ...baseItem, notes: 'Bring camera' };
      render(<TimelineItem item={itemWithNotes} currency='EUR' />);

      expect(screen.getByTestId('activity-notes-label')).toHaveTextContent('Notatka:');
      expect(screen.getByTestId('activity-notes')).toHaveTextContent('Bring camera');
    });

    it('should not render notes when not provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.queryByTestId('activity-notes')).not.toBeInTheDocument();
    });

    it('should render time badge when time is provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.getByTestId('activity-time')).toBeInTheDocument();
    });

    it('should not render time badge when time is not provided', () => {
      const itemWithoutTime = { ...baseItem, time: undefined };
      render(<TimelineItem item={itemWithoutTime} currency='EUR' />);

      expect(screen.queryByTestId('activity-time')).not.toBeInTheDocument();
    });
  });

  describe('rendering - estimated price', () => {
    it('should render estimated price when provided and not zero', () => {
      const itemWithPrice = { ...baseItem, estimated_price: '25' };
      render(<TimelineItem item={itemWithPrice} currency='EUR' />);

      expect(screen.getByTestId('activity-price')).toHaveTextContent('25 EUR');
    });

    it('should use provided currency for price', () => {
      const itemWithPrice = { ...baseItem, estimated_price: '25' };
      render(<TimelineItem item={itemWithPrice} currency='USD' />);

      expect(screen.getByTestId('activity-price')).toHaveTextContent('25 USD');
    });

    it('should not render price when zero', () => {
      const itemWithZeroPrice = { ...baseItem, estimated_price: '0' };
      render(<TimelineItem item={itemWithZeroPrice} currency='EUR' />);

      expect(screen.queryByTestId('activity-price')).not.toBeInTheDocument();
    });

    it('should not render price when not provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.queryByTestId('activity-price')).not.toBeInTheDocument();
    });
  });

  describe('actions menu', () => {
    it('should render dropdown menu when onEdit or onDelete is provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' onEdit={mockOnEdit} />);

      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('should not render dropdown menu when neither onEdit nor onDelete is provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' />);

      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
    });

    it('should render edit action when onEdit is provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' onEdit={mockOnEdit} />);

      expect(screen.getByTestId('edit-activity')).toBeInTheDocument();
      expect(screen.getByTestId('edit-activity')).toHaveTextContent('Edytuj');
    });

    it('should call onEdit with item when edit is clicked', async () => {
      const user = userEvent.setup();
      render(<TimelineItem item={baseItem} currency='EUR' onEdit={mockOnEdit} />);

      const editButton = screen.getByTestId('edit-activity');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(baseItem);
    });

    it('should render delete action when onDelete is provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' onDelete={mockOnDelete} />);

      expect(screen.getByTestId('delete-activity')).toBeInTheDocument();
      expect(screen.getByTestId('delete-activity')).toHaveTextContent('Usuń');
    });

    it('should call onDelete with item id when delete is clicked', async () => {
      const user = userEvent.setup();
      render(<TimelineItem item={baseItem} currency='EUR' onDelete={mockOnDelete} />);

      const deleteButton = screen.getByTestId('delete-activity');
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('should render both edit and delete actions when both callbacks are provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('edit-activity')).toBeInTheDocument();
      expect(screen.getByTestId('delete-activity')).toBeInTheDocument();
    });

    it('should not render edit action when onEdit is not provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' onDelete={mockOnDelete} />);

      expect(screen.queryByTestId('edit-activity')).not.toBeInTheDocument();
    });

    it('should not render delete action when onDelete is not provided', () => {
      render(<TimelineItem item={baseItem} currency='EUR' onEdit={mockOnEdit} />);

      expect(screen.queryByTestId('delete-activity')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have screen reader text for menu button', () => {
      render(<TimelineItem item={baseItem} currency='EUR' onEdit={mockOnEdit} />);

      expect(screen.getByTestId('menu-sr-label')).toHaveTextContent('Otwórz menu');
    });
  });

  describe('different categories', () => {
    it('should handle food category', () => {
      const foodItem = { ...baseItem, category: 'food' as const };
      render(<TimelineItem item={foodItem} currency='EUR' />);

      expect(timelineCategories.getCategoryIcon).toHaveBeenCalledWith('food');
      expect(timelineCategories.getCategoryLabel).toHaveBeenCalledWith('food');
    });

    it('should handle culture category', () => {
      const cultureItem = { ...baseItem, category: 'culture' as const };
      render(<TimelineItem item={cultureItem} currency='EUR' />);

      expect(timelineCategories.getCategoryIcon).toHaveBeenCalledWith('culture');
      expect(timelineCategories.getCategoryLabel).toHaveBeenCalledWith('culture');
    });

    it('should handle transport category', () => {
      const transportItem = { ...baseItem, category: 'transport' as const };
      render(<TimelineItem item={transportItem} currency='EUR' />);

      expect(timelineCategories.getCategoryIcon).toHaveBeenCalledWith('transport');
      expect(timelineCategories.getCategoryLabel).toHaveBeenCalledWith('transport');
    });
  });

  describe('complete item rendering', () => {
    it('should render item with all fields populated', () => {
      const completeItem: TimelineItemType = {
        ...baseItem,
        estimated_price: '50',
        estimated_duration: '2 hours',
        notes: 'Book tickets in advance',
      };

      render(<TimelineItem item={completeItem} currency='EUR' onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByTestId('activity-title')).toHaveTextContent('Visit Eiffel Tower');
      expect(screen.getByTestId('activity-time')).toHaveTextContent('09:00');
      expect(screen.getByTestId('activity-location')).toHaveTextContent('Champ de Mars, Paris');
      expect(screen.getByTestId('activity-description')).toHaveTextContent('Visit the famous landmark');
      expect(screen.getByTestId('activity-notes')).toHaveTextContent('Book tickets in advance');
      expect(screen.getByTestId('activity-price')).toHaveTextContent('50 EUR');
      expect(screen.getByTestId('edit-activity')).toBeInTheDocument();
      expect(screen.getByTestId('delete-activity')).toBeInTheDocument();
    });
  });
});
