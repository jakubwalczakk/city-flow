import { describe, it, expect, vi } from 'vitest';

// Mock supabase before importing the hook
vi.mock('@/db/supabase.client', () => ({
  supabaseClient: {
    auth: {
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

import { getUserInitials } from '@/hooks/useLogout';

describe('getUserInitials', () => {
  it('should return initials from email', () => {
    const email = 'john.doe@example.com';
    const initials = getUserInitials(email);

    expect(initials).toBe('JO');
  });

  it('should handle short usernames', () => {
    const email = 'a@example.com';
    const initials = getUserInitials(email);

    expect(initials).toBe('A');
  });

  it('should convert to uppercase', () => {
    const email = 'lowercase@example.com';
    const initials = getUserInitials(email);

    expect(initials).toBe('LO');
  });

  it('should handle single-letter username', () => {
    const email = 'x@example.com';
    const initials = getUserInitials(email);

    expect(initials).toBe('X');
  });

  it('should handle numbers in username', () => {
    const email = 'user123@example.com';
    const initials = getUserInitials(email);

    expect(initials).toBe('US');
  });
});
