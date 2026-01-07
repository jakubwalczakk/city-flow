import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordUpdateSuccess } from '@/components/auth/password-update/PasswordUpdateSuccess';

describe('PasswordUpdateSuccess', () => {
  let originalLocation: Location;

  beforeEach(() => {
    vi.useFakeTimers();
    originalLocation = window.location;
    // @ts-expect-error - Mocking window.location for testing
    delete window.location;
    // @ts-expect-error - Mocking window.location for testing
    window.location = { ...originalLocation, href: '' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // @ts-expect-error - Restoring window.location after testing
    window.location = originalLocation;
  });

  it('renders success message', () => {
    render(<PasswordUpdateSuccess />);

    expect(screen.getByText('Hasło zostało zmienione!')).toBeInTheDocument();
    expect(screen.getByText(/Twoje hasło zostało pomyślnie zaktualizowane/i)).toBeInTheDocument();
  });

  it('redirects to login page after 2 seconds', () => {
    render(<PasswordUpdateSuccess />);

    expect(window.location.href).toBe('');

    // Fast-forward time by 2 seconds
    vi.advanceTimersByTime(2000);

    // Check that location was set
    expect(window.location.href).toBe('/login');
  });

  it('clears timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount } = render(<PasswordUpdateSuccess />);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
