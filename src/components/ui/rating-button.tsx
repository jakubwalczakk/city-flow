import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { FeedbackRating } from '@/types';

type RatingButtonProps = {
  type: FeedbackRating;
  selected: boolean;
  onSelect: (rating: FeedbackRating) => void;
  disabled?: boolean;
};

const RATING_CONFIG = {
  thumbs_up: {
    Icon: ThumbsUp,
    label: 'Kciuk w górę',
    selectedClass: 'border-green-500 bg-green-50 text-green-600',
    hoverClass: 'hover:border-green-300 hover:bg-green-50/50',
  },
  thumbs_down: {
    Icon: ThumbsDown,
    label: 'Kciuk w dół',
    selectedClass: 'border-red-500 bg-red-50 text-red-600',
    hoverClass: 'hover:border-red-300 hover:bg-red-50/50',
  },
} as const;

/**
 * Rating button component for thumbs up/down feedback.
 * Uses Lucide icons for consistent styling.
 */
export function RatingButton({ type, selected, onSelect, disabled = false }: RatingButtonProps) {
  const config = RATING_CONFIG[type];
  const { Icon, label, selectedClass, hoverClass } = config;

  return (
    <button
      type='button'
      onClick={() => onSelect(type)}
      className={`flex items-center justify-center h-12 w-12 rounded-lg border-2 transition-all ${
        selected ? selectedClass : `border-muted ${hoverClass}`
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={label}
      aria-pressed={selected}
      disabled={disabled}
    >
      <Icon className='h-6 w-6' fill={selected ? 'currentColor' : 'none'} />
    </button>
  );
}
