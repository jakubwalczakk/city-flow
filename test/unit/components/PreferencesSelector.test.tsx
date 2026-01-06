import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesSelector } from '@/components/PreferencesSelector';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock UI components
vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, onClick, variant, className, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} className={className} {...props}>
      {children}
    </button>
  ),
}));

// Mock types - need to provide the values that would come from @/types
vi.mock('@/types', async () => {
  const actual = await vi.importActual('@/types');
  return {
    ...actual,
    AVAILABLE_PREFERENCES: ['culture', 'food', 'nature', 'nightlife', 'shopping', 'adventure', 'relaxation'],
    PREFERENCE_LABELS: {
      culture: 'Kultura',
      food: 'Jedzenie',
      nature: 'Natura',
      nightlife: 'Życie nocne',
      shopping: 'Zakupy',
      adventure: 'Przygoda',
      relaxation: 'Relaks',
    },
  };
});
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('PreferencesSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render preferences selector container', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} />);

      expect(screen.getByTestId('preferences-selector')).toBeInTheDocument();
    });

    it('should render label', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} />);

      expect(screen.getByTestId('preferences-label')).toBeInTheDocument();
      expect(screen.getByText('Preferencje turystyczne')).toBeInTheDocument();
    });

    it('should render info text with min and max', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} />);

      expect(screen.getByTestId('preferences-info')).toBeInTheDocument();
      expect(screen.getByText('Wybierz od 2 do 5 preferencji')).toBeInTheDocument();
    });

    it('should render badges container', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} />);

      expect(screen.getByTestId('preferences-badges')).toBeInTheDocument();
    });

    it('should render all preference badges', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} />);

      expect(screen.getByText('Kultura')).toBeInTheDocument();
      expect(screen.getByText('Jedzenie')).toBeInTheDocument();
      expect(screen.getByText('Natura')).toBeInTheDocument();
      expect(screen.getByText('Życie nocne')).toBeInTheDocument();
      expect(screen.getByText('Zakupy')).toBeInTheDocument();
      expect(screen.getByText('Przygoda')).toBeInTheDocument();
      expect(screen.getByText('Relaks')).toBeInTheDocument();
    });

    it('should render counter', () => {
      render(<PreferencesSelector value={['culture', 'food']} onChange={mockOnChange} />);

      expect(screen.getByTestId('preferences-counter')).toBeInTheDocument();
      expect(screen.getByText('Wybrano: 2/5')).toBeInTheDocument();
    });
  });

  describe('badge selection states', () => {
    it('should show selected badges with default variant', () => {
      render(<PreferencesSelector value={['culture', 'food']} onChange={mockOnChange} />);

      const cultureBadge = screen.getByTestId('preference-badge-culture');
      const foodBadge = screen.getByTestId('preference-badge-food');

      expect(cultureBadge).toHaveAttribute('data-variant', 'default');
      expect(foodBadge).toHaveAttribute('data-variant', 'default');
    });

    it('should show unselected badges with outline variant', () => {
      render(<PreferencesSelector value={['culture']} onChange={mockOnChange} />);

      const natureBadge = screen.getByTestId('preference-badge-nature');

      expect(natureBadge).toHaveAttribute('data-variant', 'outline');
    });

    it('should update counter when preferences are selected', () => {
      render(<PreferencesSelector value={['culture', 'food', 'nature']} onChange={mockOnChange} />);

      expect(screen.getByText('Wybrano: 3/5')).toBeInTheDocument();
    });

    it('should show 0/5 when no preferences selected', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} />);

      expect(screen.getByText('Wybrano: 0/5')).toBeInTheDocument();
    });
  });

  describe('toggle functionality', () => {
    it('should add preference when unselected badge is clicked', async () => {
      const user = userEvent.setup();
      render(<PreferencesSelector value={['culture']} onChange={mockOnChange} />);

      const foodBadge = screen.getByTestId('preference-badge-food');
      await user.click(foodBadge);

      expect(mockOnChange).toHaveBeenCalledWith(['culture', 'food']);
    });

    it('should remove preference when selected badge is clicked', async () => {
      const user = userEvent.setup();
      render(<PreferencesSelector value={['culture', 'food']} onChange={mockOnChange} />);

      const foodBadge = screen.getByTestId('preference-badge-food');
      await user.click(foodBadge);

      expect(mockOnChange).toHaveBeenCalledWith(['culture']);
    });

    it('should handle multiple toggles', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<PreferencesSelector value={[]} onChange={mockOnChange} />);

      // Add first preference
      const cultureBadge = screen.getByTestId('preference-badge-culture');
      await user.click(cultureBadge);
      expect(mockOnChange).toHaveBeenLastCalledWith(['culture']);

      // Rerender with updated value
      rerender(<PreferencesSelector value={['culture']} onChange={mockOnChange} />);

      // Add second preference
      const foodBadge = screen.getByTestId('preference-badge-food');
      await user.click(foodBadge);
      expect(mockOnChange).toHaveBeenLastCalledWith(['culture', 'food']);
    });
  });

  describe('max limit enforcement', () => {
    it('should not add preference when max limit is reached', async () => {
      const user = userEvent.setup();
      const maxPreferences = ['culture', 'food', 'nature', 'nightlife', 'shopping'];
      render(<PreferencesSelector value={maxPreferences} onChange={mockOnChange} />);

      const adventureBadge = screen.getByTestId('preference-badge-adventure');
      await user.click(adventureBadge);

      // onChange should not be called since max is reached
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should disable unselected badges when max is reached', () => {
      const maxPreferences = ['culture', 'food', 'nature', 'nightlife', 'shopping'];
      render(<PreferencesSelector value={maxPreferences} onChange={mockOnChange} />);

      const adventureBadge = screen.getByTestId('preference-badge-adventure');

      expect(adventureBadge.className).toContain('opacity-50');
      expect(adventureBadge.className).toContain('cursor-not-allowed');
    });

    it('should not disable selected badges when max is reached', () => {
      const maxPreferences = ['culture', 'food', 'nature', 'nightlife', 'shopping'];
      render(<PreferencesSelector value={maxPreferences} onChange={mockOnChange} />);

      const cultureBadge = screen.getByTestId('preference-badge-culture');

      expect(cultureBadge.className).not.toContain('opacity-50');
      expect(cultureBadge.className).not.toContain('cursor-not-allowed');
    });

    it('should still allow removing preferences when max is reached', async () => {
      const user = userEvent.setup();
      const maxPreferences = ['culture', 'food', 'nature', 'nightlife', 'shopping'];
      render(<PreferencesSelector value={maxPreferences} onChange={mockOnChange} />);

      const cultureBadge = screen.getByTestId('preference-badge-culture');
      await user.click(cultureBadge);

      expect(mockOnChange).toHaveBeenCalledWith(['food', 'nature', 'nightlife', 'shopping']);
    });

    it('should show max count in counter', () => {
      const maxPreferences = ['culture', 'food', 'nature', 'nightlife', 'shopping'];
      render(<PreferencesSelector value={maxPreferences} onChange={mockOnChange} />);

      expect(screen.getByText('Wybrano: 5/5')).toBeInTheDocument();
    });
  });

  describe('error display', () => {
    it('should not show error when error prop is not provided', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} />);

      expect(screen.queryByTestId('preferences-error')).not.toBeInTheDocument();
    });

    it('should not show error when error is null', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} error={null} />);

      expect(screen.queryByTestId('preferences-error')).not.toBeInTheDocument();
    });

    it('should show error message when error prop is provided', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} error='Wybierz co najmniej 2 preferencje' />);

      expect(screen.getByTestId('preferences-error')).toBeInTheDocument();
      expect(screen.getByText('Wybierz co najmniej 2 preferencje')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty value array', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} />);

      expect(screen.getByText('Wybrano: 0/5')).toBeInTheDocument();
    });

    it('should handle single preference', () => {
      render(<PreferencesSelector value={['culture']} onChange={mockOnChange} />);

      expect(screen.getByText('Wybrano: 1/5')).toBeInTheDocument();
    });

    it('should maintain preference order when removing', async () => {
      const user = userEvent.setup();
      render(<PreferencesSelector value={['culture', 'food', 'nature']} onChange={mockOnChange} />);

      const foodBadge = screen.getByTestId('preference-badge-food');
      await user.click(foodBadge);

      expect(mockOnChange).toHaveBeenCalledWith(['culture', 'nature']);
    });
  });

  describe('accessibility', () => {
    it('should have clickable badges', () => {
      render(<PreferencesSelector value={[]} onChange={mockOnChange} />);

      const badges = screen.getAllByRole('button');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should have cursor-pointer class on enabled badges', () => {
      render(<PreferencesSelector value={['culture']} onChange={mockOnChange} />);

      const foodBadge = screen.getByTestId('preference-badge-food');
      expect(foodBadge.className).toContain('cursor-pointer');
    });
  });
});
