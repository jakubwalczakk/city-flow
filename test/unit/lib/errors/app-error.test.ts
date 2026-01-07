import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
} from '@/lib/errors/app-error';

describe('AppError', () => {
  describe('AppError base class', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should set correct name', () => {
      const error = new AppError('Test', 500);
      expect(error.name).toBe('AppError');
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test', 500);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    it('should support non-operational errors', () => {
      const error = new AppError('Critical', 500, false);
      expect(error.isOperational).toBe(false);
    });

    it('should default to operational errors', () => {
      const error = new AppError('Test', 400);
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of Error', () => {
      const error = new AppError('Test', 400);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('should have status 400', () => {
      const error = new ValidationError('Invalid data');
      expect(error.statusCode).toBe(400);
    });

    it('should be operational', () => {
      const error = new ValidationError('Invalid data');
      expect(error.isOperational).toBe(true);
    });

    it('should include validation details', () => {
      const details = { field: 'email', issue: 'invalid format' };
      const error = new ValidationError('Validation failed', details);

      expect(error.details).toEqual(details);
    });

    it('should work without details', () => {
      const error = new ValidationError('Validation failed');
      expect(error.details).toBeUndefined();
    });

    it('should set correct name', () => {
      const error = new ValidationError('Test');
      expect(error.name).toBe('ValidationError');
    });

    it('should be instance of AppError', () => {
      const error = new ValidationError('Test');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('UnauthorizedError', () => {
    it('should have status 401', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
    });

    it('should have default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Token expired');
      expect(error.message).toBe('Token expired');
    });

    it('should be operational', () => {
      const error = new UnauthorizedError();
      expect(error.isOperational).toBe(true);
    });

    it('should set correct name', () => {
      const error = new UnauthorizedError();
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should be instance of AppError', () => {
      const error = new UnauthorizedError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ForbiddenError', () => {
    it('should have status 403', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
    });

    it('should have default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Forbidden');
    });

    it('should accept custom message', () => {
      const error = new ForbiddenError('Insufficient permissions');
      expect(error.message).toBe('Insufficient permissions');
    });

    it('should be operational', () => {
      const error = new ForbiddenError();
      expect(error.isOperational).toBe(true);
    });

    it('should set correct name', () => {
      const error = new ForbiddenError();
      expect(error.name).toBe('ForbiddenError');
    });

    it('should be instance of AppError', () => {
      const error = new ForbiddenError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('NotFoundError', () => {
    it('should have status 404', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
    });

    it('should have default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('User not found');
      expect(error.message).toBe('User not found');
    });

    it('should be operational', () => {
      const error = new NotFoundError();
      expect(error.isOperational).toBe(true);
    });

    it('should set correct name', () => {
      const error = new NotFoundError();
      expect(error.name).toBe('NotFoundError');
    });

    it('should be instance of AppError', () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ConflictError', () => {
    it('should have status 409', () => {
      const error = new ConflictError('Resource already exists');
      expect(error.statusCode).toBe(409);
    });

    it('should require message', () => {
      const error = new ConflictError('Duplicate entry');
      expect(error.message).toBe('Duplicate entry');
    });

    it('should be operational', () => {
      const error = new ConflictError('Test');
      expect(error.isOperational).toBe(true);
    });

    it('should set correct name', () => {
      const error = new ConflictError('Test');
      expect(error.name).toBe('ConflictError');
    });

    it('should be instance of AppError', () => {
      const error = new ConflictError('Test');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('DatabaseError', () => {
    it('should have status 500', () => {
      const error = new DatabaseError('Database connection failed');
      expect(error.statusCode).toBe(500);
    });

    it('should be non-operational', () => {
      const error = new DatabaseError('Database error');
      expect(error.isOperational).toBe(false);
    });

    it('should include original error', () => {
      const originalError = new Error('Connection timeout');
      const error = new DatabaseError('Database failed', originalError);

      expect(error.originalError).toBe(originalError);
    });

    it('should work without original error', () => {
      const error = new DatabaseError('Database failed');
      expect(error.originalError).toBeUndefined();
    });

    it('should set correct name', () => {
      const error = new DatabaseError('Test');
      expect(error.name).toBe('DatabaseError');
    });

    it('should be instance of AppError', () => {
      const error = new DatabaseError('Test');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ExternalServiceError', () => {
    it('should have status 502', () => {
      const error = new ExternalServiceError('API call failed');
      expect(error.statusCode).toBe(502);
    });

    it('should be non-operational', () => {
      const error = new ExternalServiceError('Service error');
      expect(error.isOperational).toBe(false);
    });

    it('should include original error', () => {
      const originalError = new Error('Network timeout');
      const error = new ExternalServiceError('Service failed', originalError);

      expect(error.originalError).toBe(originalError);
    });

    it('should work without original error', () => {
      const error = new ExternalServiceError('Service failed');
      expect(error.originalError).toBeUndefined();
    });

    it('should set correct name', () => {
      const error = new ExternalServiceError('Test');
      expect(error.name).toBe('ExternalServiceError');
    });

    it('should be instance of AppError', () => {
      const error = new ExternalServiceError('Test');
      expect(error).toBeInstanceOf(AppError);
    });
  });
});
