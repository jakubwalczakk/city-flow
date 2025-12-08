import type {
  CreatePlanCommand,
  UpdatePlanCommand,
  PlanDetailsDto,
  PaginatedPlansDto,
  PlanStatus,
  PlanListItemDto,
  AddActivityCommand,
  UpdateActivityCommand,
  GeneratedContentViewModel,
  TimelineItem,
} from '@/types';
import type { SupabaseClient } from '@/db/supabase.client';
import { DatabaseError, NotFoundError } from '@/lib/errors/app-error';
import { logger } from '@/lib/utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Converts a time string to 24-hour format for proper sorting.
 * Handles formats like "2:30 PM", "14:30", "2:30PM", etc.
 */
function convertTo24Hour(timeStr: string): string {
  const time = timeStr.trim();

  // If already in 24-hour format (no AM/PM), return as is
  if (!/am|pm/i.test(time)) {
    return time.padStart(5, '0'); // Ensure consistent format like "09:00"
  }

  // Parse time with AM/PM
  const match = time.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (!match) return time; // Return original if can't parse

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toLowerCase();

  // Convert to 24-hour format
  if (period === 'pm' && hours !== 12) {
    hours += 12;
  } else if (period === 'am' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Parameters for listing plans.
 */
export type GetPlansParams = {
  status?: PlanStatus | PlanStatus[];
  sort_by: 'created_at' | 'name';
  order: 'asc' | 'desc';
  limit: number;
  offset: number;
};

/**
 * Service for managing travel plans.
 */
export class PlanService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Creates a new travel plan in the database.
   *
   * @param command - The plan creation data
   * @param userId - The ID of the user creating the plan
   * @returns The newly created plan
   * @throws {DatabaseError} If the database operation fails
   */
  public async createPlan(command: CreatePlanCommand, userId: string): Promise<PlanDetailsDto> {
    logger.debug('Creating new plan', {
      userId,
      destination: command.destination,
    });

    const { data, error } = await this.supabase
      .from('plans')
      .insert({ ...command, user_id: userId, status: 'draft' })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create plan in database', {
        userId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError('Failed to create a plan. Please try again later.', new Error(error.message));
    }

    if (!data.start_date || !data.end_date) {
      logger.error('Plan created without start_date or end_date', {
        planId: data.id,
        userId,
      });
      throw new DatabaseError('Failed to create a plan with complete data.');
    }

    logger.info('Plan created successfully', {
      planId: data.id,
      userId,
    });

    return data as PlanDetailsDto;
  }

  /**
   * Retrieves a paginated list of plans for a user.
   *
   * @param userId - The ID of the user whose plans to retrieve
   * @param params - Query parameters for filtering, sorting, and pagination
   * @returns A paginated list of plans
   * @throws {DatabaseError} If the database operation fails
   */
  public async getPlans(userId: string, params: GetPlansParams): Promise<PaginatedPlansDto> {
    logger.debug('Fetching plans list', {
      userId,
      params,
    });

    // Build the base query
    let query = this.supabase
      .from('plans')
      .select('id, name, destination, start_date, end_date, status, created_at', { count: 'exact' })
      .eq('user_id', userId);

    // Apply status filter if provided
    if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status);
      } else {
        query = query.eq('status', params.status);
      }
    }

    // Apply sorting
    query = query.order(params.sort_by, { ascending: params.order === 'asc' });

    // Apply pagination
    const from = params.offset;
    const to = params.offset + params.limit - 1;
    query = query.range(from, to);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch plans from database', {
        userId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError('Failed to retrieve plans. Please try again later.', new Error(error.message));
    }

    logger.info('Plans fetched successfully', {
      userId,
      count: data?.length ?? 0,
      total: count ?? 0,
    });

    const validatedData = (data ?? []).map((plan) => {
      if (!plan.start_date || !plan.end_date) {
        logger.error('A plan in the list is missing start_date or end_date', {
          planId: plan.id,
          userId,
        });
        throw new DatabaseError('Inconsistent plan data received.');
      }
      return plan as PlanListItemDto;
    });

    return {
      data: validatedData,
      pagination: {
        total: count ?? 0,
        limit: params.limit,
        offset: params.offset,
      },
    };
  }

  /**
   * Retrieves detailed information about a specific plan.
   *
   * @param planId - The ID of the plan to retrieve
   * @param userId - The ID of the user who owns the plan
   * @returns The plan details
   * @throws {NotFoundError} If the plan is not found or doesn't belong to the user
   * @throws {DatabaseError} If the database operation fails
   */
  public async getPlanById(planId: string, userId: string): Promise<PlanDetailsDto> {
    logger.debug('Fetching plan by ID', {
      planId,
      userId,
    });

    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.warn('Plan not found', {
          planId,
          userId,
        });
        throw new NotFoundError('Plan not found.');
      }

      logger.error('Failed to fetch plan from database', {
        planId,
        userId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError('Failed to retrieve plan. Please try again later.', new Error(error.message));
    }

    logger.info('Plan fetched successfully', {
      planId,
      userId,
    });

    if (!data.start_date || !data.end_date) {
      logger.error('Plan from database is missing start_date or end_date', {
        planId: data.id,
        userId,
      });
      throw new DatabaseError('Incomplete plan data received from the database.');
    }

    return data as PlanDetailsDto;
  }

  /**
   * Updates an existing plan.
   *
   * @param planId - The ID of the plan to update
   * @param command - The update data
   * @returns The updated plan
   * @throws {NotFoundError} If the plan is not found or doesn't belong to the user
   * @throws {DatabaseError} If the database operation fails
   */
  public async updatePlan(planId: string, command: UpdatePlanCommand): Promise<PlanDetailsDto> {
    logger.debug('Updating plan', {
      planId,
    });

    const { data, error } = await this.supabase.from('plans').update(command).eq('id', planId).select().single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.warn('Plan not found during update', {
          planId,
        });
        throw new NotFoundError('Plan not found.');
      }

      logger.error('Failed to update plan in database', {
        planId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError('Failed to update plan. Please try again later.', new Error(error.message));
    }

    logger.info('Plan updated successfully', {
      planId,
    });

    if (!data.start_date || !data.end_date) {
      logger.error('Plan updated without start_date or end_date', {
        planId: data.id,
      });
      throw new DatabaseError('Failed to update a plan with complete data.');
    }

    return data as PlanDetailsDto;
  }

  /**
   * Deletes a plan.
   *
   * @param planId - The ID of the plan to delete
   * @param userId - The ID of the user who owns the plan
   * @throws {NotFoundError} If the plan is not found or doesn't belong to the user
   * @throws {DatabaseError} If the database operation fails
   */
  public async deletePlan(planId: string, userId: string): Promise<void> {
    logger.debug('Deleting plan', {
      planId,
      userId,
    });

    // First, verify the plan exists and belongs to the user
    await this.getPlanById(planId, userId);

    const { error } = await this.supabase.from('plans').delete().eq('id', planId).eq('user_id', userId);

    if (error) {
      logger.error('Failed to delete plan from database', {
        planId,
        userId,
        errorCode: error.code,
        errorMessage: error.message,
      });

      throw new DatabaseError('Failed to delete plan. Please try again later.', new Error(error.message));
    }

    logger.info('Plan deleted successfully', {
      planId,
      userId,
    });
  }

  /**
   * Adds a new activity to a specific day in a plan.
   *
   * @param planId - The ID of the plan
   * @param date - The date of the day (e.g., "2025-11-10")
   * @param command - The activity data to add
   * @param userId - The ID of the user who owns the plan
   * @returns The updated plan with the new activity
   * @throws {NotFoundError} If the plan is not found or doesn't belong to the user
   * @throws {DatabaseError} If the database operation fails
   */
  public async addActivityToPlanDay(
    planId: string,
    date: string,
    command: AddActivityCommand,
    userId: string
  ): Promise<PlanDetailsDto> {
    logger.debug('Adding activity to plan day', {
      planId,
      date,
      userId,
    });

    // First, fetch the current plan
    const plan = await this.getPlanById(planId, userId);

    if (plan.status !== 'generated') {
      throw new DatabaseError('Can only add activities to generated plans.');
    }

    // Parse the generated_content
    const generatedContent = plan.generated_content as GeneratedContentViewModel | null;

    if (!generatedContent || !generatedContent.days) {
      throw new DatabaseError('Plan does not have valid generated content.');
    }

    // Find the day to add the activity to
    const dayIndex = generatedContent.days.findIndex((day) => day.date === date);

    if (dayIndex === -1) {
      throw new NotFoundError(`Day ${date} not found in plan.`);
    }

    // Create the new activity with a unique ID
    // Map category to type for database validation
    const type = command.category === 'food' ? 'meal' : command.category === 'transport' ? 'transport' : 'activity';

    const newActivity: TimelineItem = {
      id: uuidv4(),
      type: type,
      time: command.time,
      category: command.category,
      title: command.title,
      description: command.description,
      location: command.location,
      estimated_price: command.estimated_cost,
      estimated_duration: command.duration ? `${command.duration} min` : undefined,
    };

    // Add the activity to the day
    const updatedDays = [...generatedContent.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      items: [...updatedDays[dayIndex].items, newActivity],
    };

    // Sort items by time if time is present
    updatedDays[dayIndex].items.sort((a, b) => {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1; // Items without time go to the end
      if (!b.time) return -1;

      // Convert time to 24-hour format for proper comparison
      const timeA = convertTo24Hour(a.time);
      const timeB = convertTo24Hour(b.time);
      return timeA.localeCompare(timeB);
    });

    // Update the plan with the new generated_content
    const updatedContent: GeneratedContentViewModel = {
      ...generatedContent,
      days: updatedDays,
    };

    const updatedPlan = await this.updatePlan(planId, {
      generated_content: updatedContent as unknown as UpdatePlanCommand['generated_content'],
    });

    logger.info('Activity added to plan day successfully', {
      planId,
      date,
      activityId: newActivity.id,
      userId,
    });

    return updatedPlan;
  }

  /**
   * Updates an existing activity in a plan day.
   *
   * @param planId - The ID of the plan
   * @param date - The date of the day (e.g., "2025-11-10")
   * @param itemId - The ID of the activity to update
   * @param command - The updated activity data
   * @param userId - The ID of the user who owns the plan
   * @returns The updated plan
   * @throws {NotFoundError} If the plan, day, or activity is not found
   * @throws {DatabaseError} If the database operation fails
   */
  public async updateActivityInPlanDay(
    planId: string,
    date: string,
    itemId: string,
    command: UpdateActivityCommand,
    userId: string
  ): Promise<PlanDetailsDto> {
    logger.debug('Updating activity in plan day', {
      planId,
      date,
      itemId,
      userId,
    });

    // First, fetch the current plan
    const plan = await this.getPlanById(planId, userId);

    if (plan.status !== 'generated') {
      throw new DatabaseError('Can only update activities in generated plans.');
    }

    // Parse the generated_content
    const generatedContent = plan.generated_content as GeneratedContentViewModel | null;

    if (!generatedContent || !generatedContent.days) {
      throw new DatabaseError('Plan does not have valid generated content.');
    }

    // Find the day containing the activity
    const dayIndex = generatedContent.days.findIndex((day) => day.date === date);

    if (dayIndex === -1) {
      throw new NotFoundError(`Day ${date} not found in plan.`);
    }

    // Find the activity to update
    const itemIndex = generatedContent.days[dayIndex].items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      throw new NotFoundError(`Activity ${itemId} not found in day ${date}.`);
    }

    // Update the activity
    const updatedDays = [...generatedContent.days];
    const currentItem = updatedDays[dayIndex].items[itemIndex];

    // Map category to type for database validation if category is being updated
    const updates: Partial<TimelineItem> = {
      ...(command.time !== undefined && { time: command.time }),
      ...(command.title !== undefined && { title: command.title }),
      ...(command.description !== undefined && { description: command.description }),
      ...(command.location !== undefined && { location: command.location }),
      ...(command.category !== undefined && { category: command.category }),
      ...(command.estimated_cost !== undefined && { estimated_price: command.estimated_cost }),
      ...(command.duration !== undefined && { estimated_duration: `${command.duration} min` }),
    };

    // Update type if category changed
    if (command.category !== undefined) {
      updates.type = command.category === 'food' ? 'meal' : command.category === 'transport' ? 'transport' : 'activity';
    }

    updatedDays[dayIndex].items[itemIndex] = {
      ...currentItem,
      ...updates,
    };

    // Sort items by time if time was updated
    if (command.time !== undefined) {
      updatedDays[dayIndex].items.sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1; // Items without time go to the end
        if (!b.time) return -1;

        // Convert time to 24-hour format for proper comparison
        const timeA = convertTo24Hour(a.time);
        const timeB = convertTo24Hour(b.time);
        return timeA.localeCompare(timeB);
      });
    }

    // Update the plan with the new generated_content
    const updatedContent: GeneratedContentViewModel = {
      ...generatedContent,
      days: updatedDays,
    };

    const updatedPlan = await this.updatePlan(planId, {
      generated_content: updatedContent as unknown as UpdatePlanCommand['generated_content'],
    });

    logger.info('Activity updated in plan day successfully', {
      planId,
      date,
      itemId,
      userId,
    });

    return updatedPlan;
  }

  /**
   * Deletes an activity from a plan day.
   *
   * @param planId - The ID of the plan
   * @param date - The date of the day (e.g., "2025-11-10")
   * @param itemId - The ID of the activity to delete
   * @param userId - The ID of the user who owns the plan
   * @returns The updated plan
   * @throws {NotFoundError} If the plan, day, or activity is not found
   * @throws {DatabaseError} If the database operation fails
   */
  public async deleteActivityFromPlanDay(
    planId: string,
    date: string,
    itemId: string,
    userId: string
  ): Promise<PlanDetailsDto> {
    logger.debug('Deleting activity from plan day', {
      planId,
      date,
      itemId,
      userId,
    });

    // First, fetch the current plan
    const plan = await this.getPlanById(planId, userId);

    if (plan.status !== 'generated') {
      throw new DatabaseError('Can only delete activities from generated plans.');
    }

    // Parse the generated_content
    const generatedContent = plan.generated_content as GeneratedContentViewModel | null;

    if (!generatedContent || !generatedContent.days) {
      throw new DatabaseError('Plan does not have valid generated content.');
    }

    // Find the day containing the activity
    const dayIndex = generatedContent.days.findIndex((day) => day.date === date);

    if (dayIndex === -1) {
      throw new NotFoundError(`Day ${date} not found in plan.`);
    }

    // Find the activity to delete
    const itemIndex = generatedContent.days[dayIndex].items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      throw new NotFoundError(`Activity ${itemId} not found in day ${date}.`);
    }

    // Remove the activity
    const updatedDays = [...generatedContent.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      items: updatedDays[dayIndex].items.filter((item) => item.id !== itemId),
    };

    // Update the plan with the new generated_content
    const updatedContent: GeneratedContentViewModel = {
      ...generatedContent,
      days: updatedDays,
    };

    const updatedPlan = await this.updatePlan(planId, {
      generated_content: updatedContent as unknown as UpdatePlanCommand['generated_content'],
    });

    logger.info('Activity deleted from plan day successfully', {
      planId,
      date,
      itemId,
      userId,
    });

    return updatedPlan;
  }
}
