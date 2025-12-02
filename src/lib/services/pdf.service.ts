import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";
import type { PlanDetailsDto, GeneratedContentViewModel } from "@/types";
import { logger } from "@/lib/utils/logger";

/**
 * Generates a PDF document from a travel plan.
 *
 * @param plan - The plan details to convert to PDF
 * @returns A Buffer containing the PDF data
 * @throws Error if PDF generation fails
 */
export const generatePlanPdf = async (plan: PlanDetailsDto): Promise<Buffer> => {
  logger.debug("Starting PDF generation", { planId: plan.id });

  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Register fontkit to enable custom font embedding
    pdfDoc.registerFontkit(fontkit);

    // Load font data from file
    const fontBytes = await fs.readFile(path.resolve(process.cwd(), "src/assets/fonts/Lato-Regular.ttf"));
    const fontBoldBytes = await fs.readFile(path.resolve(process.cwd(), "src/assets/fonts/Lato-Bold.ttf"));

    // Embed fonts
    const lato = await pdfDoc.embedFont(fontBytes);
    const latoBold = await pdfDoc.embedFont(fontBoldBytes);

    // Constants for layout
    const MARGIN = 50;
    const TITLE_SIZE = 24;
    const HEADING_SIZE = 16;
    const BODY_SIZE = 11;
    const SMALL_SIZE = 9;

    // Add first page
    let page = pdfDoc.addPage();
    const { height } = page.getSize();
    let yPosition = height - MARGIN;

    // Helper function to add a new page if needed
    const ensureSpace = (requiredSpace: number) => {
      if (yPosition - requiredSpace < MARGIN) {
        page = pdfDoc.addPage();
        yPosition = height - MARGIN;
      }
    };

    // Helper function to draw text (sanitizes for PDF compatibility)
    const drawText = (text: string, size: number, font: typeof lato | typeof latoBold, color = rgb(0, 0, 0)) => {
      page.drawText(text, {
        x: MARGIN,
        y: yPosition,
        size,
        font,
        color,
      });
      yPosition -= size + 5;
    };

    // Title
    drawText(plan.name, TITLE_SIZE, latoBold, rgb(0.2, 0.2, 0.8));
    yPosition -= 10;

    // Basic Info
    drawText(`Cel podróży: ${plan.destination}`, BODY_SIZE, lato);

    const startDate = new Date(plan.start_date).toLocaleDateString("pl-PL");
    const endDate = new Date(plan.end_date).toLocaleDateString("pl-PL");
    drawText(`Daty: ${startDate} - ${endDate}`, BODY_SIZE, lato);

    if (plan.notes) {
      yPosition -= 5;
      drawText("Notatki:", BODY_SIZE, latoBold);
      drawText(plan.notes, BODY_SIZE, lato);
    }

    yPosition -= 20;

    // Parse generated content
    const generatedContent = plan.generated_content as GeneratedContentViewModel | null;

    if (!generatedContent || !generatedContent.days || generatedContent.days.length === 0) {
      drawText("Brak wygenerowanego planu.", BODY_SIZE, lato);
    } else {
      // Display warnings if present
      if (generatedContent.warnings && generatedContent.warnings.length > 0) {
        ensureSpace(100);
        drawText("Ważne uwagi:", HEADING_SIZE, latoBold, rgb(0.8, 0.4, 0));
        yPosition += 5;

        for (const warning of generatedContent.warnings) {
          ensureSpace(40);
          const lines = splitTextIntoLines(warning, 80);
          for (const line of lines) {
            drawText(`! ${line}`, SMALL_SIZE, lato, rgb(0.6, 0.3, 0));
          }
        }
        yPosition -= 15;
      }

      // Iterate through each day
      for (const day of generatedContent.days) {
        ensureSpace(60);

        // Day heading
        const dayDate = new Date(day.date).toLocaleDateString("pl-PL", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        drawText(dayDate, HEADING_SIZE, latoBold, rgb(0.2, 0.4, 0.8));
        yPosition -= 5;

        // Check if day has items
        if (!day.items || day.items.length === 0) {
          drawText("  Brak zaplanowanych aktywności na ten dzień.", BODY_SIZE, lato);
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
          drawText(titleText, BODY_SIZE, latoBold);

          // Item details
          if (item.description) {
            const descLines = splitTextIntoLines(item.description, 90);
            for (const line of descLines) {
              ensureSpace(20);
              drawText(`  ${line}`, SMALL_SIZE, lato);
            }
          }

          if (item.location) {
            ensureSpace(20);
            drawText(`  Lokalizacja: ${item.location}`, SMALL_SIZE, lato);
          }

          if (item.estimated_price && item.estimated_price !== "0") {
            const currency = generatedContent?.currency ?? "PLN";
            ensureSpace(20);
            drawText(`  Koszt: ${item.estimated_price} ${currency}`, SMALL_SIZE, lato);
          }

          yPosition -= 5;
        }

        yPosition -= 15;
      }

      // Display modifications if present
      if (generatedContent.modifications && generatedContent.modifications.length > 0) {
        ensureSpace(100);
        drawText("Modyfikacje AI:", HEADING_SIZE, latoBold, rgb(0.3, 0.6, 0.3));
        yPosition += 5;

        for (const modification of generatedContent.modifications) {
          ensureSpace(40);
          const lines = splitTextIntoLines(modification, 80);
          for (const line of lines) {
            drawText(`* ${line}`, SMALL_SIZE, lato, rgb(0.2, 0.5, 0.2));
          }
        }
      }
    }

    // Add footer on all pages
    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
      const currentPage = pages[i];

      const footerText = `Wygenerowano przez CityFlow - Strona ${i + 1} z ${pages.length}`;
      currentPage.drawText(footerText, {
        x: MARGIN,
        y: 30,
        size: SMALL_SIZE,
        font: lato,
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
