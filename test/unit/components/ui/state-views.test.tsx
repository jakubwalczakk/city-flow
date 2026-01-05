import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingView, ErrorView, NotFoundView, BackLink, ArchivedBanner } from '@/components/ui/state-views';

describe('State Views', () => {
  describe('LoadingView', () => {
    it('should render loading message', () => {
      render(<LoadingView message='Załaduję dane...' />);

      expect(screen.getByText('Załaduję dane...')).toBeInTheDocument();
    });

    it('should render default message when not provided', () => {
      render(<LoadingView />);

      expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
    });

    it('should have spinner icon', () => {
      const { container } = render(<LoadingView />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<LoadingView className='custom-class' />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('ErrorView', () => {
    it('should render with default title and message', () => {
      render(<ErrorView message='Coś poszło nie tak' />);

      expect(screen.getByText('Wystąpił błąd')).toBeInTheDocument();
      expect(screen.getByText('Coś poszło nie tak')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<ErrorView title='Błąd serwera' message='Spróbuj ponownie' />);

      expect(screen.getByText('Błąd serwera')).toBeInTheDocument();
    });

    it('should render back button with default link', () => {
      render(<ErrorView message='Błąd' />);

      const link = screen.getByRole('link', { name: /powrót do planów/i });
      expect(link).toHaveAttribute('href', '/plans');
    });

    it('should render back button with custom link', () => {
      render(<ErrorView message='Błąd' backHref='/dashboard' backLabel='Wróć do pulpitu' />);

      const link = screen.getByRole('link', { name: /wróć do pulpitu/i });
      expect(link).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('NotFoundView', () => {
    it('should render with default title and message', () => {
      render(<NotFoundView />);

      expect(screen.getByText('Nie znaleziono')).toBeInTheDocument();
      expect(screen.getByText('Szukany element nie istnieje lub został usunięty.')).toBeInTheDocument();
    });

    it('should render with custom title and message', () => {
      render(<NotFoundView title='Plan nie istnieje' message='Upewnij się, że ID jest prawidłowe' />);

      expect(screen.getByText('Plan nie istnieje')).toBeInTheDocument();
      expect(screen.getByText('Upewnij się, że ID jest prawidłowe')).toBeInTheDocument();
    });

    it('should render back button with default href', () => {
      render(<NotFoundView />);

      const link = screen.getByRole('link', { name: /powrót do planów/i });
      expect(link).toHaveAttribute('href', '/plans');
    });
  });

  describe('BackLink', () => {
    it('should render link with default href and label', () => {
      render(<BackLink />);

      const link = screen.getByRole('link', { name: /powrót do planów/i });
      expect(link).toHaveAttribute('href', '/plans');
    });

    it('should render link with custom href and label', () => {
      render(<BackLink href='/home' label='Wróć do domu' />);

      const link = screen.getByRole('link', { name: /wróć do domu/i });
      expect(link).toHaveAttribute('href', '/home');
    });

    it('should have chevron icon', () => {
      const { container } = render(<BackLink />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('ArchivedBanner', () => {
    it('should render archived message', () => {
      render(<ArchivedBanner />);

      expect(screen.getByText('To jest plan archiwalny. Edycja jest zablokowana.')).toBeInTheDocument();
    });

    it('should have archive icon', () => {
      const { container } = render(<ArchivedBanner />);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have aria-hidden icon', () => {
      const { container } = render(<ArchivedBanner />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
