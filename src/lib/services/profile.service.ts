import type { SupabaseClient } from '../../db/supabase.client';
import type { UpdateProfileCommand } from '../../types';
import { DatabaseError, NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/utils/logger';

/**
 * Service responsible for managing user profile operations.
 * Handles database interactions for the profiles table.
 */
export class ProfileService {
  private readonly supabase: SupabaseClient;

  constructor(clientOrLocals: SupabaseClient | App.Locals) {
    if ('supabase' in clientOrLocals) {
      this.supabase = clientOrLocals.supabase;
    } else {
      this.supabase = clientOrLocals;
    }
  }

  /**
   * Retrieves a user's profile by their user ID.
   *
   * @param userId - The unique identifier of the user
   * @returns The user's profile if found, null if not found
   * @throws Error if the database operation fails (excluding not found errors)
   */
  public async findProfileByUserId(userId: string) {
    const { data: profile, error } = await this.supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) {
      // PGRST116 is the Postgrest error code for "no rows found"
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return profile;
  }

  /**
   * Updates a user's profile with the provided data.
   * All fields in the data object are optional, enabling partial updates (PATCH semantics).
   * The `updated_at` timestamp is automatically set to the current time.
   *
   * @param userId - The ID of the user whose profile is being updated
   * @param data - The profile fields to update (all optional)
   * @returns The updated profile object with all fields
   * @throws DatabaseError if the update operation fails
   */
  public async updateProfile(userId: string, data: UpdateProfileCommand) {
    logger.debug('Updating profile', { userId, data });

    const { data: updatedProfile, error } = await this.supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update profile', { userId, error: error.message }, error);
      throw new DatabaseError('Failed to update profile.', error);
    }

    logger.debug('Profile updated successfully', { userId });
    return updatedProfile;
  }

  /**
   * Checks if a user has generations remaining.
   *
   * @param userId - The ID of the user
   * @returns true if the user has > 0 generations remaining, false otherwise
   */
  public async hasGenerationsRemaining(userId: string): Promise<boolean> {
    const profile = await this.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found');
    }
    return profile.generations_remaining > 0;
  }

  /**
   * Decrements the user's remaining generations by 1.
   *
   * @param userId - The ID of the user
   * @throws DatabaseError if the update fails or if generations would go below 0
   */
  public async decrementGenerations(userId: string): Promise<void> {
    logger.debug('Decrementing generations', { userId });

    const profile = await this.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found');
    }

    if (profile.generations_remaining <= 0) {
      throw new DatabaseError('No generations remaining.');
    }

    const { error } = await this.supabase
      .from('profiles')
      .update({
        generations_remaining: profile.generations_remaining - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      logger.error('Failed to decrement generations', { userId, error: error.message });
      throw new DatabaseError('Failed to update user credits.', error);
    }

    logger.info('Generations decremented successfully', {
      userId,
      remaining: profile.generations_remaining - 1,
    });
  }
}
