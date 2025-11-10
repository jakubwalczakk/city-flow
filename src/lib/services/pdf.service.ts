import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type {
  PlanDetailsDto,
  GeneratedContentViewModel,
  DayPlan,
  TimelineItem,
} from "@/types";
import { logger } from "@/lib/utils/logger";

/**
 * Generates a PDF document from a travel plan.
 *
 * @param plan - The plan details to convert to PDF
 * @returns A Buffer containing the PDF data
 * @throws Error if PDF generation fails
 */
export const generatePlanPdf = async (
  plan: PlanDetailsDto
): Promise<Buffer> => {
  logger.debug("Starting PDF generation", { planId: plan.id });

  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Constants for layout
    const MARGIN = 50;
    const LINE_HEIGHT = 20;
    const TITLE_SIZE = 24;
    const HEADING_SIZE = 16;
    const BODY_SIZE = 11;
    const SMALL_SIZE = 9;

    // Add first page
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let yPosition = height - MARGIN;

    // Helper function to add a new page if needed
    const ensureSpace = (requiredSpace: number) => {
      if (yPosition - requiredSpace < MARGIN) {
        page = pdfDoc.addPage();
        yPosition = height - MARGIN;
      }
    };

    // Helper function to draw text (sanitizes for PDF compatibility)
    const drawText = (
      text: string,
      size: number,
      font: typeof helvetica | typeof helveticaBold,
      color = rgb(0, 0, 0)
    ) => {
      const sanitized = sanitizeTextForPdf(text);
      page.drawText(sanitized, {
        x: MARGIN,
        y: yPosition,
        size,
        font,
        color,
      });
      yPosition -= size + 5;
    };

    // Title
    drawText(plan.name, TITLE_SIZE, helveticaBold, rgb(0.2, 0.2, 0.8));
    yPosition -= 10;

    // Basic Info
    drawText(`Destination: ${plan.destination}`, BODY_SIZE, helvetica);
    
    const startDate = new Date(plan.start_date).toLocaleDateString('pl-PL');
    const endDate = new Date(plan.end_date).toLocaleDateString('pl-PL');
    drawText(`Dates: ${startDate} - ${endDate}`, BODY_SIZE, helvetica);
    
    if (plan.notes) {
      yPosition -= 5;
      drawText("Notes:", BODY_SIZE, helveticaBold);
      drawText(plan.notes, BODY_SIZE, helvetica);
    }

    yPosition -= 20;

    // Parse generated content
    const generatedContent = plan.generated_content as GeneratedContentViewModel | null;

    if (!generatedContent || !generatedContent.days || generatedContent.days.length === 0) {
      drawText("No itinerary generated yet.", BODY_SIZE, helvetica);
    } else {
      // Display warnings if present
      if (generatedContent.warnings && generatedContent.warnings.length > 0) {
        ensureSpace(100);
        drawText("Important Notices:", HEADING_SIZE, helveticaBold, rgb(0.8, 0.4, 0));
        yPosition += 5;
        
        for (const warning of generatedContent.warnings) {
          ensureSpace(40);
          const lines = splitTextIntoLines(warning, 80);
          for (const line of lines) {
            drawText(`! ${line}`, SMALL_SIZE, helvetica, rgb(0.6, 0.3, 0));
          }
        }
        yPosition -= 15;
      }

      // Iterate through each day
      for (const day of generatedContent.days) {
        ensureSpace(60);
        
        // Day heading
        const dayDate = new Date(day.date).toLocaleDateString('pl-PL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        drawText(dayDate, HEADING_SIZE, helveticaBold, rgb(0.2, 0.4, 0.8));
        yPosition -= 5;

        // Check if day has items
        if (!day.items || day.items.length === 0) {
          drawText("  No activities planned for this day.", BODY_SIZE, helvetica);
          yPosition -= 10;
          continue;
        }

        // Draw each item
        for (const item of day.items) {
          ensureSpace(80);
          
          // Item time and title
          const timePrefix = item.time ? `${item.time} - ` : "  ";
          const categoryLabel = getCategoryLabel(item.category);
          const titleText = `${timePrefix}${categoryLabel} ${item.title}`;
          drawText(titleText, BODY_SIZE, helveticaBold);

          // Item details
          if (item.description) {
            const descLines = splitTextIntoLines(item.description, 90);
            for (const line of descLines) {
              ensureSpace(20);
              drawText(`  ${line}`, SMALL_SIZE, helvetica);
            }
          }

          if (item.location) {
            ensureSpace(20);
            drawText(`  Location: ${item.location}`, SMALL_SIZE, helvetica);
          }

          if (item.estimated_duration || item.estimated_price) {
            const details = [];
            if (item.estimated_duration) details.push(`Duration: ${item.estimated_duration}`);
            if (item.estimated_price) details.push(`Cost: ${item.estimated_price}`);
            ensureSpace(20);
            drawText(`  ${details.join(" | ")}`, SMALL_SIZE, helvetica);
          }

          yPosition -= 5;
        }

        yPosition -= 15;
      }

      // Display modifications if present
      if (generatedContent.modifications && generatedContent.modifications.length > 0) {
        ensureSpace(100);
        drawText("AI Modifications:", HEADING_SIZE, helveticaBold, rgb(0.3, 0.6, 0.3));
        yPosition += 5;
        
        for (const modification of generatedContent.modifications) {
          ensureSpace(40);
          const lines = splitTextIntoLines(modification, 80);
          for (const line of lines) {
            drawText(`* ${line}`, SMALL_SIZE, helvetica, rgb(0.2, 0.5, 0.2));
          }
        }
      }
    }

    // Add footer on all pages
    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
      const currentPage = pages[i];
      const { height } = currentPage.getSize();
      
      const footerText = sanitizeTextForPdf(`Generated by CityFlow - Page ${i + 1} of ${pages.length}`);
      currentPage.drawText(footerText, {
        x: MARGIN,
        y: 30,
        size: SMALL_SIZE,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    logger.info("PDF generated successfully", {
      planId: plan.id,
      sizeBytes: pdfBytes.length,
    });

    return Buffer.from(pdfBytes);
  } catch (error) {
    logger.error("Failed to generate PDF", {
      planId: plan.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("PDF generation failed");
  }
};

/**
 * Sanitizes text to be compatible with WinAnsi encoding (standard PDF fonts).
 * Removes or replaces characters that cannot be encoded.
 */
function sanitizeTextForPdf(text: string): string {
  if (!text) return text;
  
  // Replace common problematic characters with ASCII equivalents
  return text
    // Remove emoji and other symbols outside basic Latin
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emoji
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Remove miscellaneous symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Remove dingbats
    // Normalize Unicode characters to closest ASCII
    .normalize('NFKD')
    // Keep only WinAnsi-compatible characters (basic Latin + Latin-1 Supplement)
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper function to get text label for activity category
 * Note: Standard PDF fonts don't support emoji, so we use text labels
 */
function getCategoryLabel(category: string): string {
  const labelMap: Record<string, string> = {
    history: "[History]",
    food: "[Food]",
    sport: "[Sport]",
    nature: "[Nature]",
    culture: "[Culture]",
    transport: "[Transport]",
    accommodation: "[Hotel]",
    other: "[Activity]",
  };
  return labelMap[category] || "[Activity]";
}

/**
 * Helper function to split long text into lines
 */
function splitTextIntoLines(text: string, maxLength: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).length <= maxLength) {
      currentLine = currentLine ? currentLine + " " + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  
  return lines;
}

