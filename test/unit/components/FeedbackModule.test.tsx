import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackModule from '@/components/FeedbackModule';
import * as useFeedbackModule from '@/hooks/useFeedback';
import * as dateFormatters from '@/lib/utils/dateFormatters';

// Mock hooks
vi.mock('@/hooks/useFeedback');

// Mock date formatter
vi.mock('@/lib/utils/dateFormatters', () => ({
  formatUpdatedAt: vi.fn((date) => `Formatted: ${date}`),
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, disabled, ...props }: any) => (
    <textarea value={value} onChange={onChange} disabled={disabled} {...props} />
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

vi.mock('@/components/ui/rating-button', () => ({
  RatingButton: ({ type, selected, onSelect, disabled, ...props }: any) => (
    <button onClick={() => onSelect(type)} disabled={disabled} {...props}>
      {type === 'thumbs_up' ? '👍' : '👎'} {selected ? '(selected)' : ''}
    </button>
  ),
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('FeedbackModule', () => {
  const mockUseFeedback = {
    feedback: null,
    selectedRating: null,
    comment: '',
    submitMessage: null,
    isLoading: false,
    isSubmitting: false,
    hasChanges: false,
    fetchError: null,
    updateRating: vi.fn(),
    updateComment: vi.fn(),
    handleSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeedbackModule.useFeedback).mockReturnValue(mockUseFeedback);
  });

  describe('rendering - loading state', () => {
    it('should show loading message when isLoading is true', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        isLoading: true,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-loading')).toHaveTextContent('Ładowanie opinii...');
    });

    it('should not show main content when loading', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        isLoading: true,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.queryByTestId('feedback-title')).not.toBeInTheDocument();
    });
  });

  describe('rendering - main content', () => {
    it('should render feedback form', () => {
      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-title')).toHaveTextContent('Jak oceniasz ten plan?');
      expect(screen.getByTestId('feedback-description')).toHaveTextContent(
        'Twoja opinia pomaga nam udoskonalać przyszłe rekomendacje podróży'
      );
    });

    it('should render rating buttons', () => {
      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-rate-positive')).toBeInTheDocument();
      expect(screen.getByTestId('feedback-rate-negative')).toBeInTheDocument();
      expect(screen.getByTestId('feedback-rating-label')).toHaveTextContent('Oceń ten plan:');
    });

    it('should render comment textarea', () => {
      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-comment-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('feedback-comment-label')).toHaveTextContent('Dodatkowe uwagi (opcjonalnie)');
    });

    it('should render submit button', () => {
      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-submit-btn')).toBeInTheDocument();
    });
  });

  describe('rating interactions', () => {
    it('should call updateRating when thumbs up is clicked', async () => {
      const user = userEvent.setup();
      const mockUpdateRating = vi.fn();

      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        updateRating: mockUpdateRating,
      });

      render(<FeedbackModule planId='plan-1' />);

      const thumbsUpButton = screen.getByTestId('feedback-rate-positive');
      await user.click(thumbsUpButton);

      expect(mockUpdateRating).toHaveBeenCalledWith('thumbs_up');
    });

    it('should call updateRating when thumbs down is clicked', async () => {
      const user = userEvent.setup();
      const mockUpdateRating = vi.fn();

      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        updateRating: mockUpdateRating,
      });

      render(<FeedbackModule planId='plan-1' />);

      const thumbsDownButton = screen.getByTestId('feedback-rate-negative');
      await user.click(thumbsDownButton);

      expect(mockUpdateRating).toHaveBeenCalledWith('thumbs_down');
    });

    it('should show thumbs up as selected', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        selectedRating: 'thumbs_up',
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-rate-positive')).toHaveTextContent(/👍.*\(selected\)/);
    });

    it('should show thumbs down as selected', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        selectedRating: 'thumbs_down',
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-rate-negative')).toHaveTextContent(/👎.*\(selected\)/);
    });

    it('should disable rating buttons when isSubmitting is true', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        isSubmitting: true,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-rate-positive')).toBeDisabled();
      expect(screen.getByTestId('feedback-rate-negative')).toBeDisabled();
    });
  });

  describe('comment interactions', () => {
    it('should call updateComment when comment is typed', async () => {
      const user = userEvent.setup();
      const mockUpdateComment = vi.fn();

      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        updateComment: mockUpdateComment,
      });

      render(<FeedbackModule planId='plan-1' />);

      const textarea = screen.getByTestId('feedback-comment-textarea');
      await user.type(textarea, 'Great plan!');

      expect(mockUpdateComment).toHaveBeenCalled();
    });

    it('should display comment value', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        comment: 'Existing comment',
      });

      render(<FeedbackModule planId='plan-1' />);

      const textarea = screen.getByTestId('feedback-comment-textarea');
      expect(textarea).toHaveValue('Existing comment');
    });

    it('should disable textarea when isSubmitting is true', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        isSubmitting: true,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-comment-textarea')).toBeDisabled();
    });
  });

  describe('submit button', () => {
    it('should disable submit button when no rating is selected', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        selectedRating: null,
        hasChanges: true,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-submit-btn')).toBeDisabled();
    });

    it('should disable submit button when no changes', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        selectedRating: 'thumbs_up',
        hasChanges: false,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-submit-btn')).toBeDisabled();
    });

    it('should disable submit button when isSubmitting is true', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        selectedRating: 'thumbs_up',
        hasChanges: true,
        isSubmitting: true,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-submit-btn')).toBeDisabled();
    });

    it('should enable submit button when rating is selected and has changes', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        selectedRating: 'thumbs_up',
        hasChanges: true,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-submit-btn')).not.toBeDisabled();
    });

    it('should call handleSubmit when submit button is clicked', async () => {
      const user = userEvent.setup();
      const mockHandleSubmit = vi.fn();

      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        selectedRating: 'thumbs_up',
        hasChanges: true,
        handleSubmit: mockHandleSubmit,
      });

      render(<FeedbackModule planId='plan-1' />);

      const submitButton = screen.getByTestId('feedback-submit-btn');
      await user.click(submitButton);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it('should show "Wysyłanie..." text when isSubmitting is true', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        selectedRating: 'thumbs_up',
        hasChanges: true,
        isSubmitting: true,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-submit-btn')).toHaveTextContent('Wysyłanie...');
    });

    it('should show "Wyślij opinię" text when no existing feedback', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        feedback: null,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-submit-btn')).toHaveTextContent('Wyślij opinię');
    });

    it('should show "Zaktualizuj opinię" text when feedback exists', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        feedback: {
          rating: 'thumbs_up',
          comment: 'Great!',
          updated_at: '2024-01-05',
        },
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-submit-btn')).toHaveTextContent('Zaktualizuj opinię');
    });
  });

  describe('submit messages', () => {
    it('should show success message when submitMessage is success', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        submitMessage: {
          type: 'success',
          text: 'Feedback submitted successfully',
        },
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-message-success')).toBeInTheDocument();
      expect(screen.getByTestId('feedback-message-success')).toHaveTextContent('Feedback submitted successfully');
    });

    it('should show error message when submitMessage is error', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        submitMessage: {
          type: 'error',
          text: 'Failed to submit feedback',
        },
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-message-error')).toBeInTheDocument();
      expect(screen.getByTestId('feedback-message-error')).toHaveTextContent('Failed to submit feedback');
    });

    it('should not show message when submitMessage is null', () => {
      render(<FeedbackModule planId='plan-1' />);

      expect(screen.queryByTestId('feedback-message-success')).not.toBeInTheDocument();
      expect(screen.queryByTestId('feedback-message-error')).not.toBeInTheDocument();
    });

    it('should have alert role on message', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        submitMessage: {
          type: 'success',
          text: 'Success',
        },
      });

      render(<FeedbackModule planId='plan-1' />);

      const message = screen.getByTestId('feedback-message-success');
      expect(message).toHaveAttribute('role', 'alert');
    });
  });

  describe('last updated timestamp', () => {
    it('should show last updated timestamp when feedback exists', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        feedback: {
          rating: 'thumbs_up',
          comment: 'Great!',
          updated_at: '2024-01-05T10:30:00Z',
        },
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.getByTestId('feedback-updated-at')).toHaveTextContent(/Ostatnia aktualizacja:/);
      expect(dateFormatters.formatUpdatedAt).toHaveBeenCalledWith('2024-01-05T10:30:00Z');
    });

    it('should not show timestamp when no feedback exists', () => {
      vi.mocked(useFeedbackModule.useFeedback).mockReturnValue({
        ...mockUseFeedback,
        feedback: null,
      });

      render(<FeedbackModule planId='plan-1' />);

      expect(screen.queryByTestId('feedback-updated-at')).not.toBeInTheDocument();
    });
  });

  describe('hook initialization', () => {
    it('should call useFeedback with planId', () => {
      render(<FeedbackModule planId='test-plan-123' />);

      expect(useFeedbackModule.useFeedback).toHaveBeenCalledWith('test-plan-123');
    });
  });
});
