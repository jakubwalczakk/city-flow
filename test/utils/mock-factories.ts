import type {
  PlanListItemDto,
  TimelineItem,
  PlanDetailsDto,
  FixedPointDto,
  TimelineItemCategory,
  TravelPace,
} from '@/types';

/**
 * Creates a mock plan for testing
 */
export const createMockPlan = (overrides?: Partial<PlanListItemDto>): PlanListItemDto => ({
  id: 'test-plan-id',
  name: 'Test Plan',
  destination: 'Test City',
  status: 'draft',
  created_at: '2024-01-01T00:00:00Z',
  start_date: '2024-02-01',
  end_date: '2024-02-07',
  ...overrides,
});

/**
 * Creates a mock activity/timeline item for testing
 */
export const createMockActivity = (overrides?: Partial<TimelineItem>): TimelineItem => ({
  id: 'test-activity-id',
  type: 'activity',
  title: 'Test Activity',
  description: 'Test description',
  time: '10:00',
  category: 'culture' as TimelineItemCategory,
  location: 'Test Location',
  estimated_duration: '60',
  estimated_price: '0',
  ...overrides,
});

/**
 * Creates a mock plan details object for testing
 */
export const createMockPlanDetails = (overrides?: Partial<PlanDetailsDto>): PlanDetailsDto => ({
  id: 'test-plan-id',
  user_id: 'test-user-id',
  name: 'Test Plan',
  destination: 'Test City',
  status: 'generated',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  start_date: '2024-02-01',
  end_date: '2024-02-07',
  notes: 'Test notes',
  generated_content: {
    days: [
      {
        date: '2024-02-01',
        items: [createMockActivity()],
      },
    ],
  },
  ...overrides,
});

/**
 * Creates a mock fixed point for testing
 */
export const createMockFixedPoint = (overrides?: Partial<FixedPointDto>): FixedPointDto => ({
  id: 'test-fixed-point-id',
  plan_id: 'test-plan-id',
  location: 'Test Location',
  event_at: '2024-02-01T12:00:00Z',
  event_duration: 60,
  description: 'Test fixed point description',
  ...overrides,
});

/**
 * Creates mock user preferences for testing
 */
export const createMockPreferences = (overrides?: Partial<{ preferences: string[]; travel_pace: TravelPace }>) => ({
  preferences: ['art_museums', 'local_food'],
  travel_pace: 'moderate' as TravelPace,
  ...overrides,
});

/**
 * Creates a mock form error object for testing
 */
export const createMockFormError = (field: string, message: string) => ({
  [field]: {
    type: 'manual',
    message,
  },
});
