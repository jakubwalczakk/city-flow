import { describe, it, expect } from 'vitest';
import { basicInfoSchema, fixedPointSchema } from './plan.schema';

describe('plan.schema', () => {
  describe('basicInfoSchema', () => {
    const validData = {
      name: 'Trip to Paris',
      destination: 'Paris, France',
      start_date: new Date('2025-01-10T09:00:00.000Z'),
      end_date: new Date('2025-01-15T18:00:00.000Z'),
      notes: 'Exciting trip!',
    };

    it('should validate correct data successfully', () => {
      // Act
      const result = basicInfoSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail if name is empty', () => {
      // Arrange
      const invalidData = { ...validData, name: '' };

      // Act
      const result = basicInfoSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
        expect(result.error.issues[0].message).toBe('Nazwa planu jest wymagana');
      }
    });

    it('should fail if destination is empty', () => {
      // Arrange
      const invalidData = { ...validData, destination: '' };

      // Act
      const result = basicInfoSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['destination']);
        expect(result.error.issues[0].message).toBe('Miejsce docelowe jest wymagane');
      }
    });

    it('should fail if end_date is before start_date', () => {
      // Arrange
      const invalidData = {
        ...validData,
        start_date: new Date('2025-01-15T09:00:00.000Z'),
        end_date: new Date('2025-01-10T18:00:00.000Z'),
      };

      // Act
      const result = basicInfoSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['end_date']);
        expect(result.error.issues[0].message).toBe('Data zakończenia musi być późniejsza niż data rozpoczęcia');
      }
    });

    it('should allow notes to be null', () => {
      // Arrange
      const dataWithNullNotes = { ...validData, notes: null };

      // Act
      const result = basicInfoSchema.safeParse(dataWithNullNotes);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('fixedPointSchema', () => {
    const validData = {
      location: 'Eiffel Tower',
      event_at: '2025-01-12T14:00:00.000Z',
      event_duration: 120,
      description: 'Visit the landmark',
    };

    it('should validate correct data successfully', () => {
      // Act
      const result = fixedPointSchema.safeParse(validData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail if location is empty', () => {
      // Arrange
      const invalidData = { ...validData, location: '' };

      // Act
      const result = fixedPointSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['location']);
        expect(result.error.issues[0].message).toBe('Lokalizacja jest wymagana');
      }
    });

    it('should fail if event_at is not a valid ISO date string', () => {
      // Arrange
      const invalidData = { ...validData, event_at: 'not-a-date' };

      // Act
      const result = fixedPointSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['event_at']);
        expect(result.error.issues[0].message).toBe('Nieprawidłowy format daty');
      }
    });

    it('should allow event_duration to be null', () => {
      // Arrange
      const dataWithNullDuration = { ...validData, event_duration: null };

      // Act
      const result = fixedPointSchema.safeParse(dataWithNullDuration);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail if event_duration is a negative number', () => {
      // Arrange
      const invalidData = { ...validData, event_duration: -30 };

      // Act
      const result = fixedPointSchema.safeParse(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['event_duration']);
      }
    });

    it('should allow description to be null', () => {
      // Arrange
      const dataWithNullDescription = { ...validData, description: null };

      // Act
      const result = fixedPointSchema.safeParse(dataWithNullDescription);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
