import type { SupabaseClient } from '@/db/supabase.client';
import { ForbiddenError } from '@/lib/errors/app-error';
import { logger } from '@/lib/utils/logger';

export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(clientOrLocals: SupabaseClient | App.Locals) {
    if ('supabase' in clientOrLocals) {
      this.supabase = clientOrLocals.supabase;
    } else {
      this.supabase = clientOrLocals;
    }
  }

  /**
   * Retrieves the currently authenticated user.
   * Throws ForbiddenError if the user is not authenticated.
   */
  public async getUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error || !user) {
      logger.warn('Unauthenticated request');
      throw new ForbiddenError('You must be logged in.');
    }

    return user;
  }

  /**
   * Retrieves the currently authenticated user ID.
   * Throws ForbiddenError if the user is not authenticated.
   */
  public async getUserId(): Promise<string> {
    const user = await this.getUser();
    return user.id;
  }
}
