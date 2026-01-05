import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleApiError, successResponse } from '@/lib/utils/error-handler';
import { AppError, ValidationError, UnauthorizedError, NotFoundError, DatabaseError } from '@/lib/errors/app-error';
import { logger } from '@/lib/utils/logger';

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('error-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleApiError', () => {
    describe('AppError handling', () => {
      it('should handle ValidationError with correct status', async () => {
        const error = new ValidationError('Invalid data');
        const response = handleApiError(error);

        expect(response.status).toBe(400);

        const body = await response.json();
        expect(body.error).toBe('Invalid data');
      });

      it('should include details for ValidationError', async () => {
        const details = { field: 'email', issue: 'invalid format' };
        const error = new ValidationError('Invalid data', details);
        const response = handleApiError(error);

        const body = await response.json();
        expect(body.details).toEqual(details);
      });

      it('should handle UnauthorizedError', async () => {
        const error = new UnauthorizedError();
        const response = handleApiError(error);

        expect(response.status).toBe(401);

        const body = await response.json();
        expect(body.error).toBe('Unauthorized');
      });

      it('should handle NotFoundError', async () => {
        const error = new NotFoundError('User not found');
        const response = handleApiError(error);

        expect(response.status).toBe(404);

        const body = await response.json();
        expect(body.error).toBe('User not found');
      });

      it('should set Content-Type header to application/json', () => {
        const error = new AppError('Test error', 400);
        const response = handleApiError(error);

        expect(response.headers.get('Content-Type')).toBe('application/json');
      });
    });

    describe('Logging behavior', () => {
      it('should log operational errors as warnings', () => {
        const error = new ValidationError('Invalid data');
        handleApiError(error, { endpoint: '/api/test' });

        expect(logger.warn).toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(
          'Operational error: Invalid data',
          expect.objectContaining({
            endpoint: '/api/test',
            statusCode: 400,
            errorName: 'ValidationError',
          })
        );
      });

      it('should log non-operational errors as errors', () => {
        const error = new DatabaseError('Database connection failed');
        handleApiError(error, { userId: '123' });

        expect(logger.error).toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(
          'Non-operational error: Database connection failed',
          expect.objectContaining({
            userId: '123',
            statusCode: 500,
            errorName: 'DatabaseError',
          }),
          error
        );
      });

      it('should include context in logs', () => {
        const error = new ValidationError('Test');
        const context = { userId: '123', action: 'create-plan' };

        handleApiError(error, context);

        expect(logger.warn).toHaveBeenCalledWith(expect.any(String), expect.objectContaining(context));
      });
    });

    describe('Unknown error handling', () => {
      it('should handle unknown errors with 500 status', async () => {
        const error = new Error('Unknown error');
        const response = handleApiError(error);

        expect(response.status).toBe(500);

        const body = await response.json();
        expect(body.error).toBe('Internal Server Error');
      });

      it('should log unknown errors', () => {
        const error = new Error('Unknown error');
        handleApiError(error);

        expect(logger.error).toHaveBeenCalledWith('Unexpected error occurred', undefined, error);
      });

      it('should include error details in development mode', async () => {
        vi.stubEnv('DEV', true);

        const error = new Error('Detailed error message');
        const response = handleApiError(error);

        const body = await response.json();
        expect(body.details).toBe('Detailed error message');
      });

      it('should not include error details in production mode', async () => {
        vi.stubEnv('DEV', false);

        const error = new Error('Detailed error message');
        const response = handleApiError(error);

        const body = await response.json();
        expect(body).not.toHaveProperty('details');
      });

      it('should handle non-Error objects', async () => {
        const error = 'String error';
        const response = handleApiError(error);

        expect(response.status).toBe(500);

        const body = await response.json();
        expect(body.error).toBe('Internal Server Error');
      });
    });
  });

  describe('successResponse', () => {
    it('should create response with data', async () => {
      const data = { id: '123', name: 'Test' };
      const response = successResponse(data);

      const body = await response.json();
      expect(body).toEqual(data);
    });

    it('should use default status 200', () => {
      const response = successResponse({ success: true });
      expect(response.status).toBe(200);
    });

    it('should accept custom status', () => {
      const response = successResponse({ created: true }, 201);
      expect(response.status).toBe(201);
    });

    it('should set Content-Type header', () => {
      const response = successResponse({ data: 'test' });
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle null data', async () => {
      const response = successResponse(null);
      const body = await response.json();
      expect(body).toBeNull();
    });

    it('should handle array data', async () => {
      const data = [1, 2, 3];
      const response = successResponse(data);
      const body = await response.json();
      expect(body).toEqual([1, 2, 3]);
    });
  });
});
