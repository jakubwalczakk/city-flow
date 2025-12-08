import type { SupabaseClient } from '@/db/supabase.client';
import type { FixedPointDto, CreateFixedPointCommand, UpdateFixedPointCommand } from '@/types';
import { DatabaseError, NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing fixed points (e.g., flights, hotel bookings) in travel plans.
 */
export class FixedPointService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Creates a new fixed point for a plan.
   *
   * @param planId - The ID of the plan
   * @param command - The fixed point creation data
   * @param userId - The ID of the user creating the fixed point (for verification)
   * @returns The newly created fixed point
   * @throws {DatabaseError} If the database operation fails
   */
  public async createFixedPoint(
    planId: string,
    command: CreateFixedPointCommand,
    userId: string
  ): Promise<FixedPointDto> {
    logger.debug('Creating new fixed point', {
      planId,
      location: command.location,
      userId,
    });

    const { data, error } = await this.supabase
      .from('fixed_points')
      .insert({
        id: uuidv4(),
        plan_id: planId,
        location: command.location,
        event_at: command.event_at,
        event_duration: command.event_duration ?? 0, // Default to 0 if null
        description: command.description,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create fixed point in database', {
        planId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError('Failed to create a fixed point. Please try again later.', new Error(error.message));
    }

    logger.info('Fixed point created successfully', {
      fixedPointId: data.id,
      planId,
    });

    return data as FixedPointDto;
  }

  /**
   * Retrieves all fixed points for a specific plan.
   *
   * @param planId - The ID of the plan
   * @returns A list of fixed points
   * @throws {DatabaseError} If the database operation fails
   */
  public async getFixedPointsByPlanId(planId: string): Promise<FixedPointDto[]> {
    logger.debug('Fetching fixed points for plan', { planId });

    const { data, error } = await this.supabase
      .from('fixed_points')
      .select('*')
      .eq('plan_id', planId)
      .order('event_at', { ascending: true });

    if (error) {
      logger.error('Failed to fetch fixed points from database', {
        planId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError('Failed to retrieve fixed points. Please try again later.', new Error(error.message));
    }

    return (data || []) as FixedPointDto[];
  }

  /**
   * Updates an existing fixed point.
   *
   * @param planId - The ID of the plan (for verification)
   * @param fixedPointId - The ID of the fixed point to update
   * @param command - The update data
   * @returns The updated fixed point
   * @throws {NotFoundError} If the fixed point is not found
   * @throws {DatabaseError} If the database operation fails
   */
  public async updateFixedPoint(
    planId: string,
    fixedPointId: string,
    command: UpdateFixedPointCommand
  ): Promise<FixedPointDto> {
    logger.debug('Updating fixed point', { fixedPointId, planId });

    const updates: {
      location?: string;
      event_at?: string;
      event_duration?: number;
      description?: string | null;
      updated_at?: string;
    } = {};
    if (command.location !== undefined) updates.location = command.location;
    if (command.event_at !== undefined) updates.event_at = command.event_at;
    if (command.event_duration !== undefined) updates.event_duration = command.event_duration ?? 0;
    if (command.description !== undefined) updates.description = command.description;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('fixed_points')
      .update(updates)
      .eq('id', fixedPointId)
      .eq('plan_id', planId) // Security check to ensure it belongs to the plan
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Fixed point not found.');
      }

      logger.error('Failed to update fixed point', {
        fixedPointId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError('Failed to update fixed point.', new Error(error.message));
    }

    return data as FixedPointDto;
  }

  /**
   * Deletes a fixed point.
   *
   * @param planId - The ID of the plan (for verification)
   * @param fixedPointId - The ID of the fixed point to delete
   * @throws {DatabaseError} If the database operation fails
   */
  public async deleteFixedPoint(planId: string, fixedPointId: string): Promise<void> {
    logger.debug('Deleting fixed point', { fixedPointId, planId });

    const { error } = await this.supabase.from('fixed_points').delete().eq('id', fixedPointId).eq('plan_id', planId);

    if (error) {
      logger.error('Failed to delete fixed point', {
        fixedPointId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError('Failed to delete fixed point.', new Error(error.message));
    }
  }
}
