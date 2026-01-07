import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvalidSession } from '@/components/auth/password-update/InvalidSession';

describe('InvalidSession', () => {
  it('renders error alert with message', () => {
    render(<InvalidSession />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Link wygasł lub jest nieprawidłowy')).toBeInTheDocument();
    expect(screen.getByText(/Ten link do resetowania hasła wygasł lub został już użyty/i)).toBeInTheDocument();
  });

  it('displays link to request new reset link', () => {
    render(<InvalidSession />);

    const link = screen.getByRole('link', { name: /Wyślij nowy link resetujący/i });
    expect(link).toHaveAttribute('href', '/forgot-password');
  });
});
