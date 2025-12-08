import { useState, useEffect } from 'react';
import type { FeedbackDto, FeedbackRating, SubmitFeedbackCommand } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type FeedbackModuleProps = {
  planId: string;
};

/**
 * Module for collecting and displaying user feedback on a generated plan.
 * Allows users to submit a thumbs up/down rating and optional comment.
 */
export default function FeedbackModule({ planId }: FeedbackModuleProps) {
  const [feedback, setFeedback] = useState<FeedbackDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch existing feedback on mount
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`/api/plans/${planId}/feedback`);

        if (response.ok) {
          const data: FeedbackDto | null = await response.json();

          // Handle the case where no feedback exists yet (API returns null)
          if (data === null) {
            setFeedback(null);
            setSelectedRating(null);
            setComment('');
          } else {
            setFeedback(data);
            setSelectedRating(data.rating);
            setComment(data.comment || '');
          }
        }
      } catch {
        // Error handling is done via UI feedback
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [planId]);

  const handleSubmit = async () => {
    if (!selectedRating) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const command: SubmitFeedbackCommand = {
        rating: selectedRating,
        comment: comment.trim() || null,
      };

      const response = await fetch(`/api/plans/${planId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const updatedFeedback: FeedbackDto = await response.json();
      setFeedback(updatedFeedback);
      setSubmitMessage({
        type: 'success',
        text: 'Dziękujemy za opinię!',
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitMessage(null), 3000);
    } catch {
      setSubmitMessage({
        type: 'error',
        text: 'Nie udało się wysłać opinii. Spróbuj ponownie.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center text-muted-foreground'>Ładowanie opinii...</div>
        </CardContent>
      </Card>
    );
  }

  const hasChanges = selectedRating !== feedback?.rating || comment !== (feedback?.comment || '');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jak oceniasz ten plan?</CardTitle>
        <CardDescription>Twoja opinia pomaga nam udoskonalać przyszłe rekomendacje podróży</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Rating buttons */}
        <div className='flex items-center gap-4'>
          <span className='text-sm font-medium'>Oceń ten plan:</span>
          <div className='flex gap-2'>
            <button
              onClick={() => setSelectedRating('thumbs_up')}
              className={`flex items-center justify-center h-12 w-12 rounded-lg border-2 transition-all ${
                selectedRating === 'thumbs_up'
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-muted hover:border-green-300 hover:bg-green-50/50'
              }`}
              aria-label='Thumbs up'
              disabled={isSubmitting}
            >
              <svg
                className='h-6 w-6'
                fill={selectedRating === 'thumbs_up' ? 'currentColor' : 'none'}
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5'
                />
              </svg>
            </button>
            <button
              onClick={() => setSelectedRating('thumbs_down')}
              className={`flex items-center justify-center h-12 w-12 rounded-lg border-2 transition-all ${
                selectedRating === 'thumbs_down'
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-muted hover:border-red-300 hover:bg-red-50/50'
              }`}
              aria-label='Thumbs down'
              disabled={isSubmitting}
            >
              <svg
                className='h-6 w-6'
                fill={selectedRating === 'thumbs_down' ? 'currentColor' : 'none'}
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Comment textarea */}
        <div className='space-y-2'>
          <label htmlFor='feedback-comment' className='text-sm font-medium'>
            Dodatkowe uwagi (opcjonalnie)
          </label>
          <Textarea
            id='feedback-comment'
            placeholder='Powiedz nam, co Ci się podobało lub co można poprawić...'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className='resize-none'
            disabled={isSubmitting}
          />
        </div>

        {/* Submit message */}
        {submitMessage && (
          <div
            className={`rounded-md p-3 text-sm ${
              submitMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        {/* Submit button */}
        <div className='flex justify-end'>
          <Button onClick={handleSubmit} disabled={!selectedRating || !hasChanges || isSubmitting}>
            {isSubmitting ? 'Wysyłanie...' : feedback ? 'Zaktualizuj opinię' : 'Wyślij opinię'}
          </Button>
        </div>

        {/* Last updated timestamp */}
        {feedback && (
          <p className='text-xs text-muted-foreground text-center'>
            Ostatnia aktualizacja:{' '}
            {new Date(feedback.updated_at).toLocaleString('pl-PL', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
