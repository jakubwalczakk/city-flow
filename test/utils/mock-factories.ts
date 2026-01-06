import type {
  PlanListItemDto,
  TimelineItem,
  PlanDetailsDto,
  FixedPoint,
  ActivityCategory,
  TravelPaceType,
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
  title: 'Test Activity',
  description: 'Test description',
  time: '10:00',
  category: 'sightseeing' as ActivityCategory,
  location: 'Test Location',
  duration: 60,
  price: 0,
  day: 1,
  ...overrides,
});

/**
 * Creates a mock plan details object for testing
 */
export const createMockPlanDetails = (overrides?: Partial<PlanDetailsDto>): PlanDetailsDto => ({
  id: 'test-plan-id',
  name: 'Test Plan',
  destination: 'Test City',
  status: 'generated',
  created_at: '2024-01-01T00:00:00Z',
  start_date: '2024-02-01',
  end_date: '2024-02-07',
  start_time: '09:00',
  end_time: '18:00',
  notes: 'Test notes',
  content: {
    days: [
      {
        day: 1,
        date: '2024-02-01',
        activities: [createMockActivity()],
      },
    ],
  },
  fixed_points: [],
  ...overrides,
});

/**
 * Creates a mock fixed point for testing
 */
export const createMockFixedPoint = (overrides?: Partial<FixedPoint>): FixedPoint => ({
  id: 'test-fixed-point-id',
  plan_id: 'test-plan-id',
  name: 'Test Fixed Point',
  time: '12:00',
  date: '2024-02-01',
  description: 'Test fixed point description',
  location: 'Test Location',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Creates mock user preferences for testing
 */
export const createMockPreferences = (overrides?: Partial<{ preferences: string[]; travel_pace: TravelPaceType }>) => ({
  preferences: ['sightseeing', 'food'],
  travel_pace: 'moderate' as TravelPaceType,
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
