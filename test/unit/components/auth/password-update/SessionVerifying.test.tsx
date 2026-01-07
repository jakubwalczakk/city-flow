import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionVerifying } from '@/components/auth/password-update/SessionVerifying';

describe('SessionVerifying', () => {
  it('renders loading spinner', () => {
    render(<SessionVerifying />);

    // Find the Loader2 icon by looking for an svg with animation class
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('displays verification message', () => {
    render(<SessionVerifying />);

    expect(screen.getByText('Weryfikacja sesji...')).toBeInTheDocument();
  });
});
