import type { APIRoute } from 'astro';
import { DEFAULT_USER_ID } from '@/db/supabase.client';
import { PlanService } from '@/lib/services/plan.service';
import { generatePlanPdf } from '@/lib/services/pdf.service';
import { ValidationError, ConflictError } from '@/lib/errors/app-error';
import { handleApiError } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/plans/[planId]/export
 * Exports a travel plan to PDF format.
 *
 * Query Parameters:
 * - format (required): Must be "pdf"
 *
 * Returns a PDF file with status 200 on success.
 * Returns 400 if format parameter is missing or invalid.
 * Returns 404 if the plan is not found.
 * Returns 409 if the plan is not in "generated" status.
 */
export const GET: APIRoute = async ({ params, url, locals }) => {
  try {
    const { supabase } = locals;
    const user = { id: DEFAULT_USER_ID };
    const planId = params.planId;

    // Validate plan ID
    if (!planId) {
      throw new ValidationError('Plan ID is required');
    }

    // Validate format query parameter
    const format = url.searchParams.get('format');

    if (!format) {
      throw new ValidationError("Query parameter 'format' is required");
    }

    if (format !== 'pdf') {
      throw new ValidationError("Only 'pdf' format is supported");
    }

    logger.debug('Received request to export plan', {
      userId: user.id,
      planId,
      format,
    });

    // Fetch the plan
    const planService = new PlanService(supabase);
    const plan = await planService.getPlanById(planId, user.id);

    // Validate plan status
    if (plan.status !== 'generated') {
      logger.warn('Attempt to export non-generated plan', {
        userId: user.id,
        planId,
        status: plan.status,
      });
      throw new ConflictError("Only plans with 'generated' status can be exported. Please generate the plan first.");
    }

    // Generate PDF
    logger.debug('Generating PDF for plan', { planId });
    const pdfBuffer = await generatePlanPdf(plan);

    // Create sanitized filename from plan name
    const sanitizedName = plan.name
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .substring(0, 50);

    const filename = `${sanitizedName}-plan.pdf`;

    logger.info('Plan exported successfully', {
      userId: user.id,
      planId,
      filename,
      sizeBytes: pdfBuffer.length,
    });

    // Return the PDF as a downloadable file
    // Convert Buffer to Uint8Array for Response compatibility
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: 'GET /api/plans/[planId]/export',
      userId: DEFAULT_USER_ID,
    });
  }
};

export const prerender = false;
