import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePlanPdf, getCategoryLabel, splitTextIntoLines } from '@/lib/services/pdf.service';
import type { PlanDetailsDto } from '@/types';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
  },
}));

// Mock pdf-lib
vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn(),
  },
  rgb: vi.fn((r, g, b) => ({ r, g, b })),
}));

// Mock fontkit
vi.mock('@pdf-lib/fontkit', () => ({
  default: {},
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('PDF Service - Pure Functions', () => {
  describe('getCategoryLabel', () => {
    it('should return correct label for history category', () => {
      expect(getCategoryLabel('history')).toBe('[History]');
    });

    it('should return correct label for food category', () => {
      expect(getCategoryLabel('food')).toBe('[Food]');
    });

    it('should return correct label for sport category', () => {
      expect(getCategoryLabel('sport')).toBe('[Sport]');
    });

    it('should return correct label for nature category', () => {
      expect(getCategoryLabel('nature')).toBe('[Nature]');
    });

    it('should return correct label for culture category', () => {
      expect(getCategoryLabel('culture')).toBe('[Culture]');
    });

    it('should return correct label for transport category', () => {
      expect(getCategoryLabel('transport')).toBe('[Transport]');
    });

    it('should return correct label for accommodation category', () => {
      expect(getCategoryLabel('accommodation')).toBe('[Hotel]');
    });

    it('should return correct label for other category', () => {
      expect(getCategoryLabel('other')).toBe('[Activity]');
    });

    it('should return default label for unknown category', () => {
      expect(getCategoryLabel('unknown')).toBe('[Activity]');
    });

    it('should return default label for empty string', () => {
      expect(getCategoryLabel('')).toBe('[Activity]');
    });

    it('should handle case-sensitive categories', () => {
      // Function is case-sensitive by design
      expect(getCategoryLabel('FOOD')).toBe('[Activity]');
      expect(getCategoryLabel('Food')).toBe('[Activity]');
    });
  });

  describe('splitTextIntoLines', () => {
    it('should return single line for short text', () => {
      const text = 'Short text';
      const result = splitTextIntoLines(text, 20);
      expect(result).toEqual(['Short text']);
    });

    it('should split long text into multiple lines', () => {
      const text = 'This is a very long text that should be split into multiple lines';
      const result = splitTextIntoLines(text, 20);
      expect(result.length).toBeGreaterThan(1);
      // Verify each line is within maxLength
      result.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(20);
      });
    });

    it('should handle exact maxLength boundary', () => {
      const text = 'Word1 Word2 Word3';
      const result = splitTextIntoLines(text, 11); // "Word1 Word2" is exactly 11 chars
      expect(result).toEqual(['Word1 Word2', 'Word3']);
    });

    it('should handle single very long word', () => {
      const text = 'Supercalifragilisticexpialidocious';
      const result = splitTextIntoLines(text, 10);
      // Word is longer than maxLength, so it goes on its own line
      expect(result).toEqual(['Supercalifragilisticexpialidocious']);
    });

    it('should handle empty text', () => {
      const text = '';
      const result = splitTextIntoLines(text, 20);
      expect(result).toEqual([]);
    });

    it('should handle single word', () => {
      const text = 'Word';
      const result = splitTextIntoLines(text, 20);
      expect(result).toEqual(['Word']);
    });

    it('should handle multiple spaces between words', () => {
      const text = 'Word1    Word2';
      const result = splitTextIntoLines(text, 20);
      // Function preserves multiple spaces when splitting
      expect(result).toEqual(['Word1    Word2']);
    });

    it('should preserve word order', () => {
      const text = 'First Second Third Fourth';
      const result = splitTextIntoLines(text, 15);
      const joined = result.join(' ');
      expect(joined).toBe('First Second Third Fourth');
    });

    it('should handle text with newlines by treating as spaces', () => {
      // split(' ') treats newlines as part of words
      const text = 'Line1\nLine2';
      const result = splitTextIntoLines(text, 20);
      expect(result).toEqual(['Line1\nLine2']);
    });
  });
});

describe('PDF Service - Main Function', () => {
  let mockPdfDoc: {
    registerFontkit: ReturnType<typeof vi.fn>;
    embedFont: ReturnType<typeof vi.fn>;
    addPage: ReturnType<typeof vi.fn>;
    getPages: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let mockPage: {
    getSize: ReturnType<typeof vi.fn>;
    drawText: ReturnType<typeof vi.fn>;
  };
  let mockFont: Record<string, unknown>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock page
    mockPage = {
      getSize: vi.fn(() => ({ height: 800, width: 600 })),
      drawText: vi.fn(),
    };

    // Setup mock font
    mockFont = {
      widthOfTextAtSize: vi.fn(() => 100),
    };

    // Setup mock PDF document
    mockPdfDoc = {
      registerFontkit: vi.fn(),
      embedFont: vi.fn(() => Promise.resolve(mockFont)),
      addPage: vi.fn(() => mockPage),
      getPages: vi.fn(() => [mockPage]),
      save: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3, 4]))),
    };

    // Setup PDFDocument.create mock
    vi.mocked(PDFDocument.create).mockResolvedValue(mockPdfDoc as unknown as PDFDocument);

    // Mock fs.readFile
    vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-font-data'));
  });

  describe('generatePlanPdf', () => {
    const mockPlan: PlanDetailsDto = {
      id: 'plan-1',
      user_id: 'user-1',
      name: 'Paris Trip',
      destination: 'Paris',
      start_date: '2024-06-01',
      end_date: '2024-06-03',
      notes: 'Visit museums',
      status: 'generated',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      generated_content: {
        summary: 'A wonderful trip',
        currency: 'EUR',
        days: [
          {
            date: '2024-06-01',
            items: [
              {
                id: 'item-1',
                type: 'activity',
                time: '10:00',
                title: 'Eiffel Tower',
                description: 'Visit the iconic Eiffel Tower',
                category: 'culture',
                estimated_price: '25',
                estimated_duration: '2 hours',
                location: 'Champ de Mars',
              },
            ],
          },
        ],
      },
    };

    it('should successfully generate PDF for plan with content', async () => {
      const result = await generatePlanPdf(mockPlan);

      expect(result).toBeInstanceOf(Buffer);
      expect(mockPdfDoc.registerFontkit).toHaveBeenCalled();
      expect(mockPdfDoc.embedFont).toHaveBeenCalledTimes(2); // Regular and bold fonts
      expect(mockPdfDoc.addPage).toHaveBeenCalled();
      expect(mockPage.drawText).toHaveBeenCalled();
      expect(mockPdfDoc.save).toHaveBeenCalled();
    });

    it('should log debug at start', async () => {
      const { logger } = await import('@/lib/utils/logger');

      await generatePlanPdf(mockPlan);

      expect(logger.debug).toHaveBeenCalledWith('Starting PDF generation', { planId: 'plan-1' });
    });

    it('should log info on success', async () => {
      const { logger } = await import('@/lib/utils/logger');

      await generatePlanPdf(mockPlan);

      expect(logger.info).toHaveBeenCalledWith('PDF generated successfully', {
        planId: 'plan-1',
        sizeBytes: expect.any(Number),
      });
    });

    it('should handle plan with no generated content', async () => {
      const planWithNoContent: PlanDetailsDto = {
        ...mockPlan,
        generated_content: null,
      };

      const result = await generatePlanPdf(planWithNoContent);

      expect(result).toBeInstanceOf(Buffer);
      expect(mockPage.drawText).toHaveBeenCalledWith(
        'Brak wygenerowanego planu.',
        expect.objectContaining({
          size: 11,
        })
      );
    });

    it('should handle plan with empty days array', async () => {
      const planWithEmptyDays: PlanDetailsDto = {
        ...mockPlan,
        generated_content: {
          summary: 'Test',
          currency: 'EUR',
          days: [],
        },
      };

      const result = await generatePlanPdf(planWithEmptyDays);

      expect(result).toBeInstanceOf(Buffer);
      expect(mockPage.drawText).toHaveBeenCalledWith(
        'Brak wygenerowanego planu.',
        expect.objectContaining({
          size: 11,
        })
      );
    });

    it('should handle plan with warnings', async () => {
      const planWithWarnings: PlanDetailsDto = {
        ...mockPlan,
        generated_content: {
          summary: 'Test',
          currency: 'EUR',
          warnings: ['Warning 1', 'Warning 2'],
          days: [
            {
              date: '2024-06-01',
              items: [],
            },
          ],
        },
      };

      const result = await generatePlanPdf(planWithWarnings);

      expect(result).toBeInstanceOf(Buffer);
      expect(mockPage.drawText).toHaveBeenCalledWith(
        'Ważne uwagi:',
        expect.objectContaining({
          size: 16,
        })
      );
    });

    it('should handle plan with modifications', async () => {
      const planWithModifications: PlanDetailsDto = {
        ...mockPlan,
        generated_content: {
          summary: 'Test',
          currency: 'EUR',
          modifications: ['Modification 1', 'Modification 2'],
          days: [
            {
              date: '2024-06-01',
              items: [],
            },
          ],
        },
      };

      const result = await generatePlanPdf(planWithModifications);

      expect(result).toBeInstanceOf(Buffer);
      expect(mockPage.drawText).toHaveBeenCalledWith(
        'Modyfikacje AI:',
        expect.objectContaining({
          size: 16,
        })
      );
    });

    it('should handle item without location', async () => {
      const planWithoutLocation: PlanDetailsDto = {
        ...mockPlan,
        generated_content: {
          summary: 'Test',
          currency: 'EUR',
          days: [
            {
              date: '2024-06-01',
              items: [
                {
                  id: 'item-1',
                  type: 'activity',
                  time: '10:00',
                  title: 'Activity',
                  description: 'Description',
                  category: 'other',
                  estimated_price: null,
                  estimated_duration: null,
                  location: null,
                },
              ],
            },
          ],
        },
      };

      const result = await generatePlanPdf(planWithoutLocation);

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle item with zero price', async () => {
      const planWithZeroPrice: PlanDetailsDto = {
        ...mockPlan,
        generated_content: {
          summary: 'Test',
          currency: 'EUR',
          days: [
            {
              date: '2024-06-01',
              items: [
                {
                  id: 'item-1',
                  type: 'activity',
                  time: '10:00',
                  title: 'Free Activity',
                  description: 'Description',
                  category: 'other',
                  estimated_price: '0',
                  estimated_duration: null,
                  location: null,
                },
              ],
            },
          ],
        },
      };

      const result = await generatePlanPdf(planWithZeroPrice);

      expect(result).toBeInstanceOf(Buffer);
      // Should not draw cost for zero price
      const costCalls = mockPage.drawText.mock.calls.filter(
        (call: unknown[]) => typeof call[0] === 'string' && call[0].includes('Koszt:')
      );
      expect(costCalls.length).toBe(0);
    });

    it('should throw error when font loading fails', async () => {
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('File not found'));

      await expect(generatePlanPdf(mockPlan)).rejects.toThrow('PDF generation failed');
    });

    it('should throw error when PDF creation fails', async () => {
      vi.mocked(PDFDocument.create).mockRejectedValueOnce(new Error('PDF creation failed'));

      await expect(generatePlanPdf(mockPlan)).rejects.toThrow('PDF generation failed');
    });

    it('should log error when PDF generation fails', async () => {
      const { logger } = await import('@/lib/utils/logger');
      vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('File not found'));

      try {
        await generatePlanPdf(mockPlan);
      } catch {
        // Expected
      }

      expect(logger.error).toHaveBeenCalledWith('Failed to generate PDF', {
        planId: 'plan-1',
        error: 'File not found',
      });
    });

    it('should add footer to all pages', async () => {
      // Mock multiple pages
      const mockPage2 = {
        getSize: vi.fn(() => ({ height: 800, width: 600 })),
        drawText: vi.fn(),
      };
      mockPdfDoc.getPages.mockReturnValue([mockPage, mockPage2]);

      await generatePlanPdf(mockPlan);

      // Both pages should have footer
      expect(mockPage.drawText).toHaveBeenCalledWith(
        'Wygenerowano przez CityFlow - Strona 1 z 2',
        expect.objectContaining({
          y: 30,
          size: 9,
        })
      );
      expect(mockPage2.drawText).toHaveBeenCalledWith(
        'Wygenerowano przez CityFlow - Strona 2 z 2',
        expect.objectContaining({
          y: 30,
          size: 9,
        })
      );
    });

    it('should create new page when content exceeds page height', async () => {
      // Create a plan with large content to trigger page break
      const largePlan: PlanDetailsDto = {
        ...mockPlan,
        generated_content: {
          summary: 'A'.repeat(500), // Very long summary
          currency: 'EUR',
          days: [
            {
              date: '2024-06-01',
              items: Array(20)
                .fill(null)
                .map((_, i) => ({
                  id: `item-${i}`,
                  type: 'activity' as const,
                  time: '10:00',
                  title: `Activity ${i}`,
                  description: 'B'.repeat(200),
                  category: 'culture' as const,
                  estimated_price: '25',
                  estimated_duration: '2 hours',
                  location: 'Location',
                })),
            },
          ],
        },
      };

      const mockPage2 = {
        getSize: vi.fn(() => ({ height: 800, width: 600 })),
        drawText: vi.fn(),
      };

      mockPdfDoc.addPage.mockReturnValueOnce(mockPage2);
      mockPdfDoc.getPages.mockReturnValue([mockPage, mockPage2]);

      await generatePlanPdf(largePlan);

      // Should have called addPage multiple times (initial + page breaks for content)
      expect(mockPdfDoc.addPage.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
