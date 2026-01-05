import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingView, ErrorView, NotFoundView, BackLink, ArchivedBanner } from '@/components/ui/state-views';

describe('State Views', () => {
  describe('LoadingView', () => {
    it('should render loading message', () => {
      render(<LoadingView message='Załaduję dane...' />);

      expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    });

    it('should render default message when not provided', () => {
      render(<LoadingView />);

      expect(screen.getByTestId('loading-message')).toBeInTheDocument();
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

      expect(screen.getByTestId('error-title')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<ErrorView title='Błąd serwera' message='Spróbuj ponownie' />);

      expect(screen.getByTestId('error-title')).toBeInTheDocument();
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

      expect(screen.getByTestId('notfound-title')).toBeInTheDocument();
      expect(screen.getByTestId('notfound-message')).toBeInTheDocument();
    });

    it('should render with custom title and message', () => {
      render(<NotFoundView title='Plan nie istnieje' message='Upewnij się, że ID jest prawidłowe' />);

      expect(screen.getByTestId('notfound-title')).toBeInTheDocument();
      expect(screen.getByTestId('notfound-message')).toBeInTheDocument();
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

      expect(screen.getByTestId('archived-message')).toBeInTheDocument();
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
