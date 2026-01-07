import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileHeader } from '@/components/ProfileHeader';

describe('ProfileHeader', () => {
  describe('rendering', () => {
    it('should render profile header container', () => {
      render(<ProfileHeader />);

      expect(screen.getByTestId('profile-header')).toBeInTheDocument();
    });

    it('should render page title', () => {
      render(<ProfileHeader />);

      expect(screen.getByTestId('profile-title')).toBeInTheDocument();
      expect(screen.getByText('Profil')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<ProfileHeader />);

      expect(screen.getByTestId('profile-description')).toBeInTheDocument();
      expect(screen.getByText('Zarządzaj swoimi preferencjami i danymi konta')).toBeInTheDocument();
    });

    it('should have correct heading level', () => {
      render(<ProfileHeader />);

      const title = screen.getByTestId('profile-title');
      expect(title.tagName).toBe('H1');
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<ProfileHeader />);

      const header = container.querySelector('h1');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('text-3xl', 'font-bold', 'tracking-tight');
    });
  });
});
