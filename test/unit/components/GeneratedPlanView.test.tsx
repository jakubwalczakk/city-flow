import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import GeneratedPlanView from '@/components/GeneratedPlanView';
import * as planContentParser from '@/lib/services/planContentParser';
import type { PlanDetailsDto } from '@/types';

// Mock the parser service
vi.mock('@/lib/services/planContentParser');

/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock child components
vi.mock('@/components/FeedbackModule', () => ({
  default: ({ planId }: { planId: string }) => <div data-testid='feedback-module'>Feedback for {planId}</div>,
}));

vi.mock('@/components/generated-plan/PlanSummaryCard', () => ({
  PlanSummaryCard: ({ summary }: { summary: string }) => <div data-testid='plan-summary-card'>{summary}</div>,
}));

vi.mock('@/components/generated-plan/WarningsCard', () => ({
  WarningsCard: ({ warnings }: { warnings: string[] }) => <div data-testid='warnings-card'>{warnings.join(', ')}</div>,
}));

vi.mock('@/components/generated-plan/ModificationsCard', () => ({
  ModificationsCard: ({ modifications }: { modifications: string[] }) => (
    <div data-testid='modifications-card'>{modifications.join(', ')}</div>
  ),
}));

vi.mock('@/components/generated-plan/DailyItinerary', () => ({
  DailyItinerary: ({ days, currency, onAddActivity, onEditActivity, onDeleteActivity }: any) => (
    <div data-testid='daily-itinerary'>
      <div>Days: {days.length}</div>
      <div>Currency: {currency}</div>
      <button onClick={() => onAddActivity?.('2024-02-01')}>Add Activity</button>
      <button onClick={() => onEditActivity?.('2024-02-01', { id: '1' })}>Edit Activity</button>
      <button onClick={() => onDeleteActivity?.('2024-02-01', '1')}>Delete Activity</button>
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('GeneratedPlanView', () => {
  const mockPlan: PlanDetailsDto = {
    id: 'plan-1',
    user_id: 'user-1',
    name: 'Paris Trip',
    destination: 'Paris',
    status: 'generated',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    start_date: '2024-02-01',
    end_date: '2024-02-07',
    notes: 'Test notes',
    generated_content: {
      summary: 'Test summary',
      currency: 'EUR',
      days: [
        {
          date: '2024-02-01',
          items: [],
        },
      ],
    },
  };

  const mockGeneratedContent = {
    summary: 'Test summary',
    currency: 'EUR',
    days: [
      {
        date: '2024-02-01',
        items: [],
      },
    ],
    warnings: ['Warning 1', 'Warning 2'],
    modifications: ['Modification 1'],
  };

  const mockOnAddActivity = vi.fn();
  const mockOnEditActivity = vi.fn();
  const mockOnDeleteActivity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(planContentParser.parseGeneratedContent).mockReturnValue(mockGeneratedContent);
  });

  describe('rendering - valid generated content', () => {
    it('should render generated plan view', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.getByTestId('generated-plan-view')).toBeInTheDocument();
    });

    it('should render plan summary card', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.getByTestId('plan-summary-card')).toBeInTheDocument();
      expect(screen.getByText('Test summary')).toBeInTheDocument();
    });

    it('should render warnings card when warnings exist', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.getByTestId('warnings-card')).toBeInTheDocument();
      expect(screen.getByText('Warning 1, Warning 2')).toBeInTheDocument();
    });

    it('should render modifications card when modifications exist', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.getByTestId('modifications-card')).toBeInTheDocument();
      expect(screen.getByText('Modification 1')).toBeInTheDocument();
    });

    it('should render daily itinerary', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.getByTestId('daily-itinerary')).toBeInTheDocument();
      expect(screen.getByText('Days: 1')).toBeInTheDocument();
      expect(screen.getByText('Currency: EUR')).toBeInTheDocument();
    });

    it('should render feedback module', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.getByTestId('feedback-section')).toBeInTheDocument();
      expect(screen.getByTestId('feedback-module')).toBeInTheDocument();
    });
  });

  describe('rendering - without warnings and modifications', () => {
    beforeEach(() => {
      vi.mocked(planContentParser.parseGeneratedContent).mockReturnValue({
        summary: 'Test summary',
        currency: 'EUR',
        days: [{ date: '2024-02-01', items: [] }],
      });
    });

    it('should not render warnings card when warnings are undefined', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.queryByTestId('warnings-card')).not.toBeInTheDocument();
    });

    it('should not render modifications card when modifications are undefined', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.queryByTestId('modifications-card')).not.toBeInTheDocument();
    });
  });

  describe('rendering - invalid generated content', () => {
    beforeEach(() => {
      vi.mocked(planContentParser.parseGeneratedContent).mockReturnValue(null);
    });

    it('should render error message when generated content is invalid', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.getByText('Wygenerowany plan')).toBeInTheDocument();
      expect(
        screen.getByText('Twój plan został wygenerowany, ale format zawartości jest nieprawidłowy lub niedostępny.')
      ).toBeInTheDocument();
    });

    it('should not render main sections when content is invalid', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.queryByTestId('generated-plan-view')).not.toBeInTheDocument();
      expect(screen.queryByTestId('plan-summary-card')).not.toBeInTheDocument();
      expect(screen.queryByTestId('daily-itinerary')).not.toBeInTheDocument();
      expect(screen.queryByTestId('feedback-section')).not.toBeInTheDocument();
    });

    it('should show raw data when content exists but is invalid', () => {
      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      expect(screen.getByText('Pokaż surowe dane')).toBeInTheDocument();
    });
  });

  describe('activity callbacks', () => {
    it('should pass onAddActivity callback to DailyItinerary', async () => {
      const user = await import('@testing-library/user-event').then((m) => m.default.setup());

      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      const addButton = screen.getByText('Add Activity');
      await user.click(addButton);

      expect(mockOnAddActivity).toHaveBeenCalledWith('2024-02-01');
    });

    it('should pass onEditActivity callback to DailyItinerary', async () => {
      const user = await import('@testing-library/user-event').then((m) => m.default.setup());

      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      const editButton = screen.getByText('Edit Activity');
      await user.click(editButton);

      expect(mockOnEditActivity).toHaveBeenCalledWith('2024-02-01', { id: '1' });
    });

    it('should pass onDeleteActivity callback to DailyItinerary', async () => {
      const user = await import('@testing-library/user-event').then((m) => m.default.setup());

      render(
        <GeneratedPlanView
          plan={mockPlan}
          onAddActivity={mockOnAddActivity}
          onEditActivity={mockOnEditActivity}
          onDeleteActivity={mockOnDeleteActivity}
        />
      );

      const deleteButton = screen.getByText('Delete Activity');
      await user.click(deleteButton);

      expect(mockOnDeleteActivity).toHaveBeenCalledWith('2024-02-01', '1');
    });

    it('should work without activity callbacks', () => {
      render(<GeneratedPlanView plan={mockPlan} />);

      expect(screen.getByTestId('generated-plan-view')).toBeInTheDocument();
    });
  });

  describe('memoization', () => {
    it('should call parseGeneratedContent with plan.generated_content', () => {
      render(<GeneratedPlanView plan={mockPlan} />);

      expect(planContentParser.parseGeneratedContent).toHaveBeenCalledWith(mockPlan.generated_content);
    });
  });
});
