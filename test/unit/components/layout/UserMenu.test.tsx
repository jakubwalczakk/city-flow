import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from '@/components/layout/UserMenu';
import * as useLogoutModule from '@/hooks/useLogout';

vi.mock('@/hooks/useLogout');

describe('UserMenu', () => {
  const mockUserEmail = 'test@example.com';
  const mockHandleLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useLogoutModule, 'useLogout').mockReturnValue({
      handleLogout: mockHandleLogout,
      isLoggingOut: false,
    });
    vi.spyOn(useLogoutModule, 'getUserInitials').mockReturnValue('TE');
  });

  describe('Rendering', () => {
    it('renders user menu trigger button', () => {
      render(<UserMenu userEmail={mockUserEmail} />);

      expect(screen.getByTestId('user-menu-trigger')).toBeInTheDocument();
    });

    it('displays user initials in avatar', () => {
      render(<UserMenu userEmail={mockUserEmail} />);

      expect(screen.getByText('TE')).toBeInTheDocument();
    });
  });

  describe('Menu interaction', () => {
    it('opens menu when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<UserMenu userEmail={mockUserEmail} />);

      const trigger = screen.getByTestId('user-menu-trigger');
      await user.click(trigger);

      expect(screen.getByText('Moje konto')).toBeInTheDocument();
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUserEmail);
    });

    it('displays profile link', async () => {
      const user = userEvent.setup();
      render(<UserMenu userEmail={mockUserEmail} />);

      const trigger = screen.getByTestId('user-menu-trigger');
      await user.click(trigger);

      const profileLink = screen.getByText('Profil').closest('a');
      expect(profileLink).toHaveAttribute('href', '/profile');
    });

    it('displays logout button', async () => {
      const user = userEvent.setup();
      render(<UserMenu userEmail={mockUserEmail} />);

      const trigger = screen.getByTestId('user-menu-trigger');
      await user.click(trigger);

      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });
  });

  describe('Logout functionality', () => {
    it('calls handleLogout when logout button is clicked', async () => {
      const user = userEvent.setup();
      render(<UserMenu userEmail={mockUserEmail} />);

      // Open menu
      const trigger = screen.getByTestId('user-menu-trigger');
      await user.click(trigger);

      // Click logout
      const logoutButton = screen.getByTestId('logout-button');
      await user.click(logoutButton);

      expect(mockHandleLogout).toHaveBeenCalledTimes(1);
    });

    it('disables logout button when logging out', async () => {
      vi.spyOn(useLogoutModule, 'useLogout').mockReturnValue({
        handleLogout: mockHandleLogout,
        isLoggingOut: true,
      });

      const user = userEvent.setup();
      render(<UserMenu userEmail={mockUserEmail} />);

      // Open menu
      const trigger = screen.getByTestId('user-menu-trigger');
      await user.click(trigger);

      const logoutButton = screen.getByTestId('logout-button');
      expect(logoutButton).toHaveAttribute('data-disabled');
    });

    it('shows loading spinner when logging out', async () => {
      vi.spyOn(useLogoutModule, 'useLogout').mockReturnValue({
        handleLogout: mockHandleLogout,
        isLoggingOut: true,
      });

      const user = userEvent.setup();
      render(<UserMenu userEmail={mockUserEmail} />);

      // Open menu
      const trigger = screen.getByTestId('user-menu-trigger');
      await user.click(trigger);

      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });
  });
});
