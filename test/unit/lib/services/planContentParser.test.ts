import { describe, it, expect } from 'vitest';
import { parseGeneratedContent, isValidGeneratedContent } from '@/lib/services/planContentParser';

describe('planContentParser', () => {
  describe('parseGeneratedContent', () => {
    describe('invalid content', () => {
      it('should return null for non-object content', () => {
        expect(parseGeneratedContent(null)).toBeNull();
        expect(parseGeneratedContent(undefined)).toBeNull();
        expect(parseGeneratedContent('string')).toBeNull();
        expect(parseGeneratedContent(123)).toBeNull();
        expect(parseGeneratedContent([])).toBeNull();
      });

      it('should return null for missing days array', () => {
        expect(parseGeneratedContent({})).toBeNull();
        expect(parseGeneratedContent({ summary: 'Test' })).toBeNull();
      });

      it('should return null for non-array days', () => {
        expect(parseGeneratedContent({ days: 'not-array' })).toBeNull();
        expect(parseGeneratedContent({ days: {} })).toBeNull();
        expect(parseGeneratedContent({ days: 123 })).toBeNull();
      });

      it('should return null for malformed day object - missing date', () => {
        const content = {
          days: [
            {
              items: [],
            },
          ],
        };
        expect(parseGeneratedContent(content)).toBeNull();
      });

      it('should return null for malformed day object - missing items', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
            },
          ],
        };
        expect(parseGeneratedContent(content)).toBeNull();
      });

      it('should return null for malformed day object - non-array items', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: 'not-array',
            },
          ],
        };
        expect(parseGeneratedContent(content)).toBeNull();
      });

      it('should return null for malformed item object - missing id', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                {
                  title: 'Activity',
                  category: 'sightseeing',
                },
              ],
            },
          ],
        };
        expect(parseGeneratedContent(content)).toBeNull();
      });

      it('should return null for malformed item object - missing title', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                {
                  id: '1',
                  category: 'sightseeing',
                },
              ],
            },
          ],
        };
        expect(parseGeneratedContent(content)).toBeNull();
      });
    });

    describe('valid content', () => {
      it('should parse valid content correctly', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                {
                  id: '1',
                  title: 'Visit Eiffel Tower',
                  category: 'sightseeing',
                  type: 'activity',
                },
              ],
            },
          ],
          summary: 'Great trip to Paris',
          currency: 'EUR',
        };

        const result = parseGeneratedContent(content);

        expect(result).not.toBeNull();
        expect(result?.days).toHaveLength(1);
        expect(result?.days[0].date).toBe('2024-01-01');
        expect(result?.days[0].items).toHaveLength(1);
        expect(result?.days[0].items[0].id).toBe('1');
        expect(result?.days[0].items[0].title).toBe('Visit Eiffel Tower');
        expect(result?.summary).toBe('Great trip to Paris');
        expect(result?.currency).toBe('EUR');
      });

      it('should provide default category if missing', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                {
                  id: '1',
                  title: 'Activity',
                },
              ],
            },
          ],
        };

        const result = parseGeneratedContent(content);

        expect(result?.days[0].items[0].category).toBe('other');
      });

      it('should provide default type if missing', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                {
                  id: '1',
                  title: 'Activity',
                },
              ],
            },
          ],
        };

        const result = parseGeneratedContent(content);

        expect(result?.days[0].items[0].type).toBe('activity');
      });

      it('should handle missing summary with default', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                {
                  id: '1',
                  title: 'Activity',
                },
              ],
            },
          ],
        };

        const result = parseGeneratedContent(content);

        expect(result?.summary).toBe('Brak podsumowania.');
      });

      it('should handle missing currency with default', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                {
                  id: '1',
                  title: 'Activity',
                },
              ],
            },
          ],
        };

        const result = parseGeneratedContent(content);

        expect(result?.currency).toBe('PLN');
      });

      it('should include modifications if present', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                {
                  id: '1',
                  title: 'Activity',
                },
              ],
            },
          ],
          modifications: ['Changed time', 'Added activity'],
        };

        const result = parseGeneratedContent(content);

        expect(result?.modifications).toEqual(['Changed time', 'Added activity']);
      });

      it('should include warnings if present', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                {
                  id: '1',
                  title: 'Activity',
                },
              ],
            },
          ],
          warnings: ['Weather may be bad', 'Museum closed on Mondays'],
        };

        const result = parseGeneratedContent(content);

        expect(result?.warnings).toEqual(['Weather may be bad', 'Museum closed on Mondays']);
      });

      it('should handle multiple days', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [{ id: '1', title: 'Day 1 Activity' }],
            },
            {
              date: '2024-01-02',
              items: [{ id: '2', title: 'Day 2 Activity' }],
            },
          ],
        };

        const result = parseGeneratedContent(content);

        expect(result?.days).toHaveLength(2);
        expect(result?.days[0].date).toBe('2024-01-01');
        expect(result?.days[1].date).toBe('2024-01-02');
      });

      it('should handle multiple items per day', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                { id: '1', title: 'Morning Activity' },
                { id: '2', title: 'Afternoon Activity' },
                { id: '3', title: 'Evening Activity' },
              ],
            },
          ],
        };

        const result = parseGeneratedContent(content);

        expect(result?.days[0].items).toHaveLength(3);
        expect(result?.days[0].items[0].title).toBe('Morning Activity');
        expect(result?.days[0].items[2].title).toBe('Evening Activity');
      });

      it('should preserve additional item properties', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [
                {
                  id: '1',
                  title: 'Activity',
                  description: 'Detailed description',
                  duration: 120,
                  price: 50,
                },
              ],
            },
          ],
        };

        const result = parseGeneratedContent(content);

        expect(result?.days[0].items[0]).toMatchObject({
          id: '1',
          title: 'Activity',
          description: 'Detailed description',
          duration: 120,
          price: 50,
        });
      });

      it('should handle empty days array', () => {
        const content = {
          days: [],
        };

        const result = parseGeneratedContent(content);

        expect(result).not.toBeNull();
        expect(result?.days).toEqual([]);
      });

      it('should handle day with empty items array', () => {
        const content = {
          days: [
            {
              date: '2024-01-01',
              items: [],
            },
          ],
        };

        const result = parseGeneratedContent(content);

        expect(result).not.toBeNull();
        expect(result?.days[0].items).toEqual([]);
      });
    });
  });

  describe('isValidGeneratedContent', () => {
    it('should return true for valid content', () => {
      const content = {
        days: [
          {
            date: '2024-01-01',
            items: [
              {
                id: '1',
                title: 'Activity',
              },
            ],
          },
        ],
      };

      expect(isValidGeneratedContent(content)).toBe(true);
    });

    it('should return false for invalid content', () => {
      expect(isValidGeneratedContent(null)).toBe(false);
      expect(isValidGeneratedContent({})).toBe(false);
      expect(isValidGeneratedContent({ days: 'not-array' })).toBe(false);
    });

    it('should return false for malformed days', () => {
      const content = {
        days: [
          {
            date: '2024-01-01',
            items: [
              {
                // Missing id and title
                category: 'test',
              },
            ],
          },
        ],
      };

      expect(isValidGeneratedContent(content)).toBe(false);
    });
  });
});
