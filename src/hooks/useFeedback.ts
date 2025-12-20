import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeedbackDto, FeedbackRating, SubmitFeedbackCommand } from '@/types';

type SubmitMessage = {
  type: 'success' | 'error';
  text: string;
} | null;

/**
 * Fetches feedback for a specific plan
 */
async function fetchFeedback(planId: string): Promise<FeedbackDto | null> {
  const response = await fetch(`/api/plans/${planId}/feedback`);

  if (!response.ok) {
    throw new Error('Failed to fetch feedback');
  }

  return response.json();
}

/**
 * Submits feedback for a specific plan
 */
async function submitFeedback(planId: string, command: SubmitFeedbackCommand): Promise<FeedbackDto> {
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

  return response.json();
}

/**
 * Custom hook for managing feedback state and operations.
 * Uses React Query for fetching and mutations.
 */
export function useFeedback(planId: string) {
  const queryClient = useQueryClient();
  const [selectedRating, setSelectedRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState('');
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage>(null);
  const initializedRef = useRef(false);

  // Query for fetching existing feedback
  const {
    data: feedback,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['feedback', planId],
    queryFn: () => fetchFeedback(planId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sync local state when feedback is loaded (only once)
  useEffect(() => {
    if (feedback && !initializedRef.current) {
      initializedRef.current = true;
      setSelectedRating(feedback.rating);
      setComment(feedback.comment || '');
    }
  }, [feedback]);

  // Mutation for submitting feedback
  const mutation = useMutation({
    mutationFn: (command: SubmitFeedbackCommand) => submitFeedback(planId, command),
    onSuccess: (updatedFeedback) => {
      // Update cache
      queryClient.setQueryData(['feedback', planId], updatedFeedback);

      setSubmitMessage({
        type: 'success',
        text: 'Dziękujemy za opinię!',
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitMessage(null), 3000);
    },
    onError: () => {
      setSubmitMessage({
        type: 'error',
        text: 'Nie udało się wysłać opinii. Spróbuj ponownie.',
      });
    },
  });

  // Check if form has changes compared to saved feedback
  const hasChanges = useMemo(() => {
    return selectedRating !== feedback?.rating || comment !== (feedback?.comment || '');
  }, [selectedRating, comment, feedback]);

  // Handle feedback submission
  const handleSubmit = useCallback(() => {
    if (!selectedRating) return;

    setSubmitMessage(null);

    mutation.mutate({
      rating: selectedRating,
      comment: comment.trim() || null,
    });
  }, [selectedRating, comment, mutation]);

  // Update selected rating
  const updateRating = useCallback((rating: FeedbackRating) => {
    setSelectedRating(rating);
  }, []);

  // Update comment
  const updateComment = useCallback((newComment: string) => {
    setComment(newComment);
  }, []);

  return {
    // Data
    feedback,
    selectedRating,
    comment,
    submitMessage,

    // State
    isLoading,
    isSubmitting: mutation.isPending,
    hasChanges,
    fetchError,

    // Actions
    updateRating,
    updateComment,
    handleSubmit,
  };
}
