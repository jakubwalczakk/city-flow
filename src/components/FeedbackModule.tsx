import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingButton } from '@/components/ui/rating-button';
import { useFeedback } from '@/hooks/useFeedback';

type FeedbackModuleProps = {
  planId: string;
};

/**
 * Module for collecting and displaying user feedback on a generated plan.
 * Allows users to submit a thumbs up/down rating and optional comment.
 * Uses React Query for data fetching and mutations.
 */
export default function FeedbackModule({ planId }: FeedbackModuleProps) {
  const {
    feedback,
    selectedRating,
    comment,
    submitMessage,
    isLoading,
    isSubmitting,
    hasChanges,
    updateRating,
    updateComment,
    handleSubmit,
  } = useFeedback(planId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center text-muted-foreground'>Ładowanie opinii...</div>
        </CardContent>
      </Card>
    );
  }

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
            <RatingButton
              type='thumbs_up'
              selected={selectedRating === 'thumbs_up'}
              onSelect={updateRating}
              disabled={isSubmitting}
            />
            <RatingButton
              type='thumbs_down'
              selected={selectedRating === 'thumbs_down'}
              onSelect={updateRating}
              disabled={isSubmitting}
            />
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
            onChange={(e) => updateComment(e.target.value)}
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
            role='alert'
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
